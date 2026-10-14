#!/usr/bin/env python3
"""
Fetch demo stand-in images for every media slot in the Reel & Rank manifest.

Source: Openverse (https://openverse.org), which indexes openly-licensed media
and returns the licence and creator for each result, so the site can credit
what it borrows.

What it does, per slot:
  1. searches Openverse for the slot's query,
  2. keeps only licences that permit commercial use AND modification,
  3. downloads candidate originals until one works,
  4. centre-crops to the slot's aspect ratio and resizes with Lanczos,
  5. writes a progressive JPEG at the exact path the manifest expects.

Attribution is written to public/media/STOCK-CREDITS.json and printed as a
markdown table.

These images are STAND-INS for a demo. They are not the studio's work. Nothing
here should ship as real portfolio content.

Usage:
  python scripts/fetch-demo-images.py [--only campaign] [--force]
"""

from __future__ import annotations

import argparse
import io
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / "public" / "media"
CREDITS = MEDIA / "STOCK-CREDITS.json"

API = "https://api.openverse.org/v1/images/"
UA = "reel-and-rank-demo/1.0 (local development; contact: hello@reelandrank.com)"
MAX_BYTES = 30 * 1024 * 1024
PAGE_SIZE = 20
# How many candidates to actually download per slot before settling. Keeps a
# thin search from hammering the API.
MAX_ATTEMPTS_PER_SLOT = 7
# The design is a dark stage. Above this average brightness (0-255) an image
# reads as a white hole in the page, so darker candidates are preferred.
MAX_LUMA = 132.0

# Licences that allow commercial use and modification. `license_type=commercial`
# already excludes -nc; -nd is excluded here because we crop and resize.
ALLOWED_LICENCES = {"cc0", "pdm", "by", "by-sa"}

# Openverse indexes a lot of NASA and observatory material, which is openly
# licensed but visually wrong for a creative studio: a satellite photograph of
# Earth's cloud cover is not "ink in water". Relevance matters more than volume
# here, so those sources and subjects are filtered out rather than cropped in.
DENY_SOURCE_SUBSTRINGS = ("nasa", "noaa", "observatory", "hubble")
DENY_TITLE_SUBSTRINGS = (
    "earth", "satellite", "hurricane", "typhoon", "galaxy", "nebula",
    "planet", "space station", "aurora", "eclipse", "telescope",
)


# --- slots -----------------------------------------------------------------
# `group` lets --only run a subset. `queries` are tried in order so a thin
# search still resolves to something.
SLOTS: list[dict] = [
    # --- Campaign: Flavors Chase Me (spice, cinnamon, bold colour) ----------
    dict(group="campaign", id="campaign-hero", path="campaign/flavors-chase-me.jpg",
         size=(1920, 1080), queries=["cinnamon powder explosion", "spice powder dark background", "cinnamon sticks dark"]),
    dict(group="campaign", id="campaign-still-01", path="campaign/still-01.jpg",
         size=(1600, 900), queries=["cinnamon sticks macro", "cinnamon bark close up"]),
    dict(group="campaign", id="campaign-still-02", path="campaign/still-02.jpg",
         size=(1600, 900), queries=["red chili powder", "paprika powder dark"]),
    dict(group="campaign", id="campaign-still-03", path="campaign/still-03.jpg",
         size=(1600, 900), queries=["turmeric powder", "spice market stall"]),
    dict(group="campaign", id="campaign-still-04", path="campaign/still-04.jpg",
         size=(1600, 900), queries=["star anise dark background", "whole spices dark"]),

    # --- The eight film posters -------------------------------------------
    dict(group="films", id="film-01-poster", path="films/film-01.jpg",
         size=(1600, 900), queries=["dramatic smoke black background", "colored smoke dark"]),
    dict(group="films", id="film-02-poster", path="films/film-02.jpg",
         size=(1600, 900), queries=["moody food photography dark", "dark kitchen cooking"]),
    dict(group="films", id="film-03-poster", path="films/film-03.jpg",
         size=(1600, 900), queries=["low key portrait dramatic lighting", "cinematic portrait dark"]),
    dict(group="films", id="film-04-poster", path="films/film-04.jpg",
         size=(1600, 900), queries=["neon lights night street rain", "neon sign dark"]),
    dict(group="films", id="film-05-poster", path="films/film-05.jpg",
         size=(1600, 900), queries=["flame fire cooking wok", "fire flame dark background"]),
    dict(group="films", id="film-06-poster", path="films/film-06.jpg",
         size=(1600, 900), queries=["liquid splash dark background", "milk splash black"]),
    dict(group="films", id="film-07-poster", path="films/film-07.jpg",
         size=(1600, 900), queries=["motion blur city lights night", "long exposure light trails"]),
    dict(group="films", id="film-08-poster", path="films/film-08.jpg",
         size=(1600, 900), queries=["silhouette dramatic backlight", "silhouette sunset dark"]),

    # --- Motion graphics samples (square) ----------------------------------
    # These belong to the RamanRasa spice line, so they stay on-subject rather
    # than abstract: a product or spice still reads as the studio's own work.
    dict(group="motion", id="motion-01-poster", path="motion/motion-01.jpg",
         size=(1080, 1080), queries=[
             "cinnamon sticks dark background",
             "autumn spices still life",
             "spices flat lay dark",
         ]),
    dict(group="motion", id="motion-02-poster", path="motion/motion-02.jpg",
         size=(1080, 1080), queries=[
             "spice jars dark background",
             "seasoning spices bowls dark",
             "ground spice bowl",
         ]),
    dict(group="motion", id="motion-03-poster", path="motion/motion-03.jpg",
         size=(1080, 1080), queries=[
             "product packaging dark background",
             "spice pouch packaging",
             "coffee beans dark background",
         ]),

    # --- Studio stills -----------------------------------------------------
    dict(group="studio", id="studio-01", path="studio/studio-01.jpg",
         size=(1600, 1067), queries=[
             "television studio control room",
             "recording studio mixing desk",
             "video monitor screen dark room",
             "broadcast control room",
         ]),
    dict(group="studio", id="studio-02", path="studio/studio-02.jpg",
         size=(1600, 1067), queries=["film camera crew on set", "camera operator filming"]),
    dict(group="studio", id="studio-03", path="studio/studio-03.jpg",
         size=(1600, 1067), queries=["color grading monitor studio", "audio mixing console studio"]),

    # --- Social fallback card ---------------------------------------------
    dict(group="brand", id="og-fallback", path="brand/og-fallback.jpg",
         size=(1200, 630), queries=["dark moody still life spices", "dark texture background subtle"]),
]


def api_get(url: str) -> dict:
    request = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(request, timeout=40) as response:
        return json.loads(response.read().decode("utf-8"))


def search(query: str) -> list[dict]:
    params = urllib.parse.urlencode({
        "q": query,
        "license_type": "commercial",
        "mature": "false",
        "page_size": PAGE_SIZE,
    })
    try:
        payload = api_get(f"{API}?{params}")
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
        print(f"    search failed ({error})", flush=True)
        return []

    results = []
    for item in payload.get("results", []):
        if item.get("license") not in ALLOWED_LICENCES:
            continue
        if not item.get("url"):
            continue
        # Prefer sources big enough to crop down to the slot size.
        if (item.get("width") or 0) < 900:
            continue

        # The offending name can sit in `source`, `creator` or the title, so
        # all three are checked.
        source = (item.get("source") or "").lower()
        creator = (item.get("creator") or "").lower()
        title = (item.get("title") or "").lower()
        if any(bad in source or bad in creator for bad in DENY_SOURCE_SUBSTRINGS):
            continue
        if any(bad in title for bad in DENY_TITLE_SUBSTRINGS):
            continue

        results.append(item)
    return results


def download(url: str) -> bytes | None:
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            length = int(response.headers.get("Content-Length") or 0)
            if length > MAX_BYTES:
                return None
            data = response.read(MAX_BYTES)
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError):
        return None
    return data if len(data) > 4096 else None


def process(raw: bytes, size: tuple[int, int]) -> Image.Image | None:
    """Centre-crop to the slot's aspect ratio, then resize. No stretching."""
    try:
        image = Image.open(io.BytesIO(raw))
        image = ImageOps.exif_transpose(image)
        image = image.convert("RGB")
    except Exception:
        return None

    target_w, target_h = size
    target_ratio = target_w / target_h
    width, height = image.size
    if width == 0 or height == 0:
        return None

    current_ratio = width / height
    if current_ratio > target_ratio:
        # Too wide: trim the sides.
        new_width = int(round(height * target_ratio))
        left = (width - new_width) // 2
        image = image.crop((left, 0, left + new_width, height))
    elif current_ratio < target_ratio:
        # Too tall: trim top and bottom.
        new_height = int(round(width / target_ratio))
        top = (height - new_height) // 2
        image = image.crop((0, top, width, top + new_height))

    return image.resize((target_w, target_h), Image.LANCZOS)


def mean_luma(image: Image.Image) -> float:
    """Average brightness 0-255. The site is a dark stage, so a bright
    white-background cutout reads as a hole in the page rather than a picture."""
    small = image.convert("L").resize((64, 64))
    pixels = list(small.getdata())
    return sum(pixels) / len(pixels)


def credit_for(item: dict) -> dict:
    return {
        "title": (item.get("title") or "Untitled").strip(),
        "creator": (item.get("creator") or "Unknown").strip(),
        "creator_url": item.get("creator_url") or "",
        "license": (item.get("license") or "").upper(),
        "license_version": item.get("license_version") or "",
        "license_url": item.get("license_url") or "",
        "source": item.get("source") or "",
        "foreign_landing_url": item.get("foreign_landing_url") or "",
        "file_url": item.get("url") or "",
        "query": item.get("_query", ""),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", help="comma-separated groups, e.g. campaign,films")
    parser.add_argument("--slots", help="comma-separated slot ids to refetch, e.g. motion-01-poster")
    parser.add_argument("--force", action="store_true", help="re-download slots that already exist")
    args = parser.parse_args()

    wanted_groups = {g.strip() for g in args.only.split(",")} if args.only else None
    wanted_slots = {s.strip() for s in args.slots.split(",")} if args.slots else None
    slots = [
        s
        for s in SLOTS
        if (wanted_groups is None or s["group"] in wanted_groups)
        and (wanted_slots is None or s["id"] in wanted_slots)
    ]
    # Refetching named slots is always a replacement.
    if wanted_slots:
        args.force = True

    MEDIA.mkdir(parents=True, exist_ok=True)
    credits: dict[str, dict] = {}
    if CREDITS.exists():
        try:
            credits = json.loads(CREDITS.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            credits = {}

    done, skipped, failed = 0, 0, []

    for slot in slots:
        destination = MEDIA / slot["path"]
        if destination.exists() and not args.force:
            skipped += 1
            print(f"  = {slot['id']:<20} already present", flush=True)
            continue

        # Candidates are ranked, not taken first-come. A result is accepted
        # straight away only if it is dark enough for the design; otherwise the
        # least-bright result seen is kept and used if nothing better appears.
        best: tuple[float, Image.Image, dict, str] | None = None
        attempts = 0
        placed = False

        for query in slot["queries"]:
            if placed or attempts >= MAX_ATTEMPTS_PER_SLOT:
                break
            print(f"  ? {slot['id']:<20} searching: {query}", flush=True)

            for item in search(query):
                if placed or attempts >= MAX_ATTEMPTS_PER_SLOT:
                    break
                attempts += 1
                time.sleep(0.4)

                raw = download(item["url"])
                if raw is None:
                    continue
                image = process(raw, slot["size"])
                if image is None:
                    continue

                luma = mean_luma(image)
                if luma <= MAX_LUMA:
                    best = (luma, image, item, query)
                    placed = True
                    break
                if best is None or luma < best[0]:
                    best = (luma, image, item, query)

            if not placed:
                time.sleep(0.5)

        if best is not None:
            luma, image, item, query = best
            destination.parent.mkdir(parents=True, exist_ok=True)
            image.save(destination, "JPEG", quality=82, optimize=True, progressive=True)

            entry = credit_for({**item, "_query": query})
            entry["file"] = slot["path"]
            entry["bytes"] = destination.stat().st_size
            entry["mean_luma"] = round(luma, 1)
            credits[slot["id"]] = entry

            note = "" if luma <= MAX_LUMA else "  (brightest fallback)"
            print(f"    + {slot['id']:<18} {image.size[0]}x{image.size[1]} "
                  f"{entry['bytes'] // 1024}KB luma={luma:.0f}  "
                  f"{entry['license']} / {entry['creator'][:26]}{note}", flush=True)
            done += 1
        else:
            failed.append(slot["id"])
            print(f"    x {slot['id']:<18} no usable result", flush=True)

    CREDITS.write_text(
        json.dumps(
            {
                "warning": (
                    "Demo stand-ins fetched from Openverse. These are NOT the studio's work "
                    "and must not ship as portfolio content. Delete these files and re-run "
                    "scripts/wire-media.ps1 to restore the designed placeholder frames."
                ),
                "source": "Openverse (https://openverse.org)",
                "assets": credits,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(f"\nplaced {done}, skipped {skipped}, failed {len(failed)}")
    if failed:
        print("failed slots: " + ", ".join(failed))
    print(f"credits -> {CREDITS.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

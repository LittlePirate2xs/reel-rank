# MEDIA.md — how to wire real assets

The site ships with a **designed placeholder frame** for every asset, so nothing
looks broken or unfinished while the real files are being gathered. Wiring them
in requires **no code changes**.

## The one command

```powershell
powershell -File scripts\wire-media.ps1
```

(If you have PowerShell 7 on your PATH, `pwsh -File scripts\wire-media.ps1`
works too. The script is pure ASCII so it behaves identically in both.)

It does two things:

1. **Copies** the media that already exists in
   `C:\Users\vikky\Documents\Ramanrasa assets` into `public/media`, using the
   filenames the manifest expects.
2. **Scans** `public/media` and regenerates
   `src/lib/media-availability.ts`, which tells the site which assets are real.

Nothing is ever deleted. Files already present are skipped.

If your assets live somewhere else:

```powershell
powershell -File scripts\wire-media.ps1 -Source "D:\my assets"
```

If you have already dropped files into `public/media` yourself and only want the
scan:

```powershell
powershell -File scripts\wire-media.ps1 -ScanOnly
```

## Where files go, and what they are called

| Manifest id | File to place | Notes |
|---|---|---|
| `film-01` … `film-08` | `public/media/films/film-01.mp4` … `film-08.mp4` | The eight Flavors Chase Me films |
| `film-01-poster` … | `public/media/films/film-01.jpg` … | Poster frame; same basename as the video |
| `motion-01` … `motion-03` | `public/media/motion/motion-01.mp4` … | Motion graphics samples |
| `campaign-hero` | `public/media/campaign/flavors-chase-me.jpg` | The Spice Man hero still |
| `campaign-still-01` … `04` | `public/media/campaign/still-01.jpg` … | Campaign gallery |
| `portrait-manny` | `public/media/team/manny.jpg` | Also `teammate2`, `teammate3` |
| `studio-01` … `03` | `public/media/studio/studio-01.jpg` … | About-page stills |
| `brand-logo`, `brand-mark` | `public/media/brand/logo.svg`, `mark.svg` | Optional — the wordmark is typeset |
| `og-fallback` | `public/media/brand/og-fallback.jpg` | 1200×630 social card fallback |

## What already exists in your RamanRasa folder

`scripts/wire-media.ps1` maps these automatically:

| Source | Becomes |
|---|---|
| `Video/ramanrasa-fall-spice-reel-9x16.mp4` | `film-01` |
| `Video/ramanrasa-thank-you-ispice2-bold-9x16.mp4` | `film-02` |
| `Video/ramanrasa-cover-autumn-motion.mp4` | `film-03` |
| `Video/ramanrasa-facebook-cover-autumn-motion.mp4` | `film-04` |
| `Video/ramanrasa-cinnamon-aplus-video.mp4` | `film-05` |
| `Video/amazon-brandstore-loop-15s.mp4` | `film-06` |
| `Video/fall-promo-15s/…-16x9-with-offer.mp4` | `film-07` |
| `Video/launch-reveal-10s/…-9x16.mp4` | `film-08` |
| `Video/email-welcome-founders-batch-motion.mp4` | `motion-01` |
| `Video/fall-promo-15s/…-clean-no-offer-text.mp4` | `motion-02` |
| `Video/ramanrasa-facebook-cover-autumn-motion.mp4` | `motion-03` |
| `Images/hero-cinnamon-pouch-plantation.png` | `campaign-still-01` |
| `Images/hero-cinnamon-pouch-bright.png` | `campaign-still-02` |
| `Images/amazon-aplus-lineup-premium.png` | `campaign-still-03` |
| `Images/amazon-brandstore-hero-3000x600.png` | `campaign-still-04` |
| `Images/PXL_2026…` (three of them) | `studio-01` … `03` |
| `Video/fall-promo-15s/…-poster-offer.png` | `film-07-poster` |
| `Video/launch-reveal-10s/…-poster-9x16.jpg` | `film-08-poster` |

## Still needed from you

These are **not** in the Ramanrasa assets folder and still show placeholders:

1. **The Spice Man hero still** — the live site referenced
   `assets/campaign/flavors-chase-me.jpg`. Place it at
   `public/media/campaign/flavors-chase-me.jpg`.
2. **Six more film posters** — `film-01` through `film-06` posters.
3. **Manny's portrait** — `public/media/team/manny.jpg`.
4. **Posters for the three motion samples** — `motion-01.jpg` … `motion-03.jpg`.
5. **The real film titles.** The live site only exposed a single "Selected
   film" player, so films are labelled `Part 01` … `Part 08`. Edit the `label`
   values in `src/content/work.ts` when the real scene titles are settled.

## Note on file size

The eight films total roughly 150 MB. That is fine for local development but
before deploying you should:

- move the videos to a CDN or object store and point `src` in
  `src/lib/media.ts` at the absolute URL, or
- re-encode them. A 1080p H.264 at CRF 23 with `-movflags +faststart` is
  typically 3–8 MB for a 15–60 second piece.

`next/image` optimises stills automatically; video is never optimised by Next,
so it is served as-is.

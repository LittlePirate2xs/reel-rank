# Reel & Rank

Motion graphics, video and search strategy in Houston.

A complete rebuild: **Next.js 16** (App Router) · **React 19** · **Tailwind CSS v4**
· **Motion** (Framer Motion 12) · **Lenis**.

---

## Run it

```powershell
cd C:\Users\vikky\Documents\Jwelry\reel-and-rank
npm run dev
```

Open <http://localhost:3000>.

```powershell
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

## What changed from the old site

| Old | New |
|---|---|
| One anchor-scroll page | Cinematic scroll home **plus** real routes: `/work`, `/work/[slug]`, `/offers`, `/offers/[slug]`, `/career`, `/about`, `/contact` |
| No motion language | A documented motion system: custom easing curves, scroll-linked sections, word-by-word reveals, staggered entrances |
| Films hidden behind a modal | A sticky horizontal **reel strip** driven by vertical scroll, with a real player |
| Identical card grids | A price **ladder**: compact rows for entry offers, full-width panels for flagship engagements |
| "REVIEW MODE — sending isn't connected" | A real form posting to `/api/inquiry`, with validation, a reference number, and durable capture |
| Thin SEO | Per-route metadata, Open Graph image, sitemap, robots, and JSON-LD for the studio, the offers, the FAQ and breadcrumbs |
| No design system | Documented tokens, a three-family type system with distinct jobs, and an enforceable anti-slop checklist |

## Where things live

```
src/
  app/          routes, layout, SEO files, /api/inquiry
  components/
    primitives/ the design system's building blocks
    layout/     header, mobile nav, footer, page transition
    sections/   home-page sections
    work/       work cards, grid, film player, campaign series
    offers/     price ladder pieces
    career/     career packages
    contact/    the inquiry form
  content/      every user-visible string and every price
  lib/          cn helpers, motion constants, media manifest, SEO, hooks
  styles/       design tokens
docs/           CONTRACTS, DESIGN, ANTI-SLOP, MEDIA
scripts/        wire-media.ps1
```

**Nothing user-visible is hardcoded in a component.** Prices, names, claims,
guarantees and disclaimers all live in `src/content/`, so copy changes never
require touching a component.

## Wiring the real media

The site ships with a designed placeholder frame for every image and video, so
nothing looks broken while assets are being gathered. To wire the real files:

```powershell
powershell -File scripts\wire-media.ps1
```

That copies what it can find from your Ramanrasa assets folder and regenerates
`src/lib/media-availability.ts`. No component changes needed. See
[docs/MEDIA.md](docs/MEDIA.md) for the full mapping and what is still missing.

## Connecting the inquiry form

The form works out of the box: it validates, returns a reference number, and
appends every brief to `.inquiry-outbox/inquiries.jsonl` so nothing is lost.

To have briefs delivered somewhere — email, a CRM, a Make or Zapier automation —
set one environment variable:

```powershell
$env:INQUIRY_WEBHOOK_URL = "https://formspree.io/f/your-id"
```

Any endpoint that accepts a JSON POST will work. If it fails, the local outbox
still has the brief.

Also set the canonical URL in production:

```powershell
$env:NEXT_PUBLIC_SITE_URL = "https://reelandrank.com"
```

## Documentation

- [PLAN.md](PLAN.md) — the audit of the old site and the rebuild plan
- [docs/DESIGN.md](docs/DESIGN.md) — tokens, type scale, motion scale
- [docs/CONTRACTS.md](docs/CONTRACTS.md) — frozen component APIs
- [docs/ANTI-SLOP.md](docs/ANTI-SLOP.md) — the enforceable design checklist
- [docs/MEDIA.md](docs/MEDIA.md) — asset wiring

## Accessibility

Skip link, semantic landmarks, visible focus rings, `aria-current` on the active
nav item, focus trapping and focus return in dialogs and the mobile menu,
labelled form controls with `aria-describedby` and `aria-invalid`, `aria-live`
announcements, 16px minimum input font size to stop iOS zoom, and
`prefers-reduced-motion` honoured in every animated component — motion is
*reduced*, not removed.

## Verifying the design

`scripts/audit-visual.mjs` drives headless Chrome over the DevTools Protocol and,
for every route at desktop **and** real mobile emulation, reports the page
height, the horizontal overflow, whether any entrance is stuck hidden, and
writes both a full-page capture and native-resolution slices.

```powershell
# profile must live OUTSIDE this project
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new `
  --remote-debugging-port=9222 --user-data-dir="$env:TEMP\rr-chrome" about:blank
node scripts\audit-visual.mjs 9222 shots\cdp
```

Last run: **0px horizontal overflow on all 16 page/device combinations**, and no
entrance left stuck in the viewport.

## Bugs found and fixed during verification

Screenshot review caught four real problems that type checking could not:

1. **Entrances could leave the page blank.** `Reveal` and `SplitText` hid
   content in the server-rendered HTML and depended on JavaScript to reveal it,
   so a blocked or failed script meant an invisible page. Content is now visible
   by default and only hidden once an inline pre-paint script confirms
   JavaScript — see the "Entrance primitives" block in `globals.css`. A failed
   observer also falls back to a viewport check instead of hiding content
   forever.
2. **The hero headline was truncated.** The word-mask reveal combined
   `overflow: clip`, `overflow-clip-margin` and negative margins on the inner
   span, which clipped glyphs unpredictably on wrapped lines. Replaced with one
   clip box per word sized from the line-box metrics.
3. **Stagger delays survived reduced motion**, so the choreography ran even
   though the motion was gone. Reduced motion now drops the delay as well as the
   travel, so content is simply present.
4. **Marquee items ran together** — "MOTION GRAPHICSVIDEO ADS…" — because the
   separator rendered with no space around it. The primitive now always creates
   a gap and gives a supplied separator room.

## Notes

- `node_modules` was installed with a workspace-local npm cache
  (`.npm-cache/`), because the sandbox blocks npm's default cache location.
  That directory is gitignored.
- Tailwind scans `src/` explicitly (`source(none)` + `@source`) rather than
  walking the whole project. Scanning the project root picked up junk from
  cache directories and crashed the build on a locked file.
- **Two folders could not be deleted:** `.chrome-cdp/` and `.chrome-profile/`
  are leftover headless-Chrome profiles from the visual audit. The DSH sandbox
  denies `DeleteSubdirectoriesAndFiles` to `Everyone` by design (only its own
  package SID is granted it), so a confined session cannot remove them. They are
  gitignored, excluded from `tsconfig`, and outside Tailwind's source scope, so
  they are inert. To remove them, run this from a normal (non-confined)
  PowerShell window:

  ```powershell
  Remove-Item -Recurse -Force "$env:USERPROFILE\Documents\Jwelry\reel-and-rank\.chrome-cdp",
                             "$env:USERPROFILE\Documents\Jwelry\reel-and-rank\.chrome-profile"
  ```
- The video files total roughly 150 MB if you wire all eight films. Re-encode or
  move them to a CDN before deploying. See the end of
  [docs/MEDIA.md](docs/MEDIA.md).

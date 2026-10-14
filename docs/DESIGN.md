# DESIGN.md — the design system

Direction: **"Signal, not noise."** A motion studio's site has to demonstrate
motion, but `impeccable.style` documents how that goes wrong. So the palette is
disciplined, the type has jobs, and the motion has rules.

If you add a font, a colour, a radius or a type size, add it here too.

---

## Colour

One accent. If everything is accented, nothing is.

| Token | Value | Role |
|---|---|---|
| `ink-950` | `#070D1A` | Page base — the stage (midnight dark blue) |
| `ink-900` | `#0D1527` | Raised surface |
| `ink-850` | `#121C32` | Alternate band |
| `ink-800` | `#17233F` | Card |
| `ink-700` | `#213257` | Hairline / border |
| `ink-600` | `#2F477B` | Stronger border |
| `ink-500` | `#425F9F` | Scrollbar, deep rule |
| `paper` | `#F2EEE6` | Primary text on ink; light sections |
| `paper-deep` | `#E4DFD4` | Light section alt |
| `paper-dim` | `#CFC9BE` | Muted on paper |
| `flare` | `#FF4A1C` | **The** accent — vermilion |
| `flare-deep` | `#C9350F` | Accent, pressed / on paper |
| `flare-soft` | `#FF6F47` | Accent tint |
| `ember` | `#FF8A3D` | Accent partner, used sparingly |
| `ash` | `#8E9DB5` | Muted text on ink (cool slate) |
| `ash-dim` | `#5C6C82` | Least important text |

**Why vermilion:** it reads as heat, spice (the founder's own brand), Houston sun
and film-lab red. It is deliberately not the purple-and-cyan AI default, and
deliberately not the cream-and-beige editorial default.

**Contrast:** `paper` on `ink-950` is about 15:1. `ash` on `ink-950` is about
7.4:1, so it is safe for metadata at 14px and above. `flare` on `ink-950` clears
4.5:1 only at large sizes — never use it for body copy. On `paper`, body text is
`ink-950` and metadata is `ink-600` or darker.

## Typography

Three families, each with a job. Deliberately not Inter or Geist, and
deliberately not an italic serif display headline.

| Token | Family | Job |
|---|---|---|
| `font-display` | **Archivo** (variable, `wdth` up to 125, weight 700–900) | Headlines. Expanded and heavy, set in `.u-display` with `font-stretch: 118%` |
| `font-sans` | **Instrument Sans** | Body and UI |
| `font-mono` | **Azeret Mono** | Timecodes, reel numbers, prices, labels |

The mono is functional, not decorative: this is a video studio, so timecodes and
reel IDs are real information.

### Scale

| Token | Size | Use |
|---|---|---|
| `text-display-1` | `clamp(3.25rem, 11.5vw, 10.5rem)` | The hero headline, and nothing else |
| `text-display-2` | `clamp(2.5rem, 7.5vw, 6.5rem)` | Page headlines |
| `text-display-3` | `clamp(1.875rem, 4.6vw, 3.75rem)` | Section headlines |
| `text-display-4` | `clamp(1.5rem, 3vw, 2.375rem)` | Sub-sections, panel titles |
| `text-lead` | `clamp(1.0625rem, 1.35vw, 1.375rem)` | Lead paragraphs |
| `text-base` | `1rem` | Body |
| `text-sm` | `0.875rem` | Secondary |
| `text-micro` | `0.6875rem` | Mono labels, `.u-eyebrow` |

Body copy never exceeds `62ch` (`.u-measure`), inside the readable 65–75ch band.
Headings use `text-wrap: balance`; paragraphs use `text-wrap: pretty`.

## Space

| Token | Value |
|---|---|
| `--shell-max` | `96rem` |
| `--shell-pad` | `clamp(1.25rem, 4vw, 4.5rem)` |
| `--section-y` | `clamp(5rem, 11vw, 11rem)` |

Grouping is by proximity, not by equal gaps everywhere. Related items sit close;
separate groups get real distance. Uniform spacing is a documented slop tell.

## Radii

A small, tight scale — deliberately not oversized.

| Token | Value | Use |
|---|---|---|
| `radius-xs` | `2px` | Focus ring |
| `radius-sm` | `4px` | Tags, inputs, buttons |
| `radius-md` | `8px` | Media frames |
| `radius-lg` | `14px` | Panels |
| `radius-pill` | `999px` | Scrollbar, pills only |

## Motion

### Easing — never `ease-in` for UI

| Token | Curve | Use |
|---|---|---|
| `ease-swift` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entrances, hover, anything responding to the user |
| `ease-glide` | `cubic-bezier(0.77, 0, 0.175, 1)` | Elements travelling across the screen |
| `ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Sheets and drawers |
| `ease-soft` | `cubic-bezier(0.4, 0, 0.2, 1)` | Neutral fallback |

`ease-in` starts slow, which reads as sluggish at exactly the moment the user is
watching most closely. It is banned.

### Duration

| Token | Value | Use |
|---|---|---|
| `--dur-press` | `120ms` | Press feedback |
| `--dur-fast` | `160ms` | Exits |
| `--dur-ui` | `200ms` | Hover, small state changes |
| `--dur-pop` | `220ms` | Popovers, dropdowns |
| `--dur-panel` | `380ms` | Dialogs, drawers, page enter |
| `--dur-reveal` | `720ms` | Scroll reveals and marketing motion |

UI motion stays under 300ms. Only scroll-linked and marketing motion is longer.

### Rules

- **Entrances** start from `scale(0.95)` or `translateY(8px)` **with** opacity.
  Never `scale(0)`.
- **Exits are faster than entrances.**
- **Stagger** 30–80ms between siblings, and never block interaction while it runs.
- **Press feedback** `scale(0.97)` on every pressable element.
- **Animate only** `transform`, `opacity`, `clip-path`, `filter`. Never
  `width`, `height`, `padding` or `margin`.
- **CSS for predetermined entrances** (off the main thread, interruptible).
  **Motion for scroll-linked and interruptible interaction.**
- **Popovers scale from their trigger.** Modals stay centred — the one exception.
- **Hover motion** is gated behind `@media (hover: hover) and (pointer: fine)`,
  exposed as the `hoverable:` variant.
- **No bounce or elastic easing.** Spring `bounce` never exceeds 0.2.

### Where Motion is used, and why

| Place | Mechanism | Reason |
|---|---|---|
| `Reveal`, `SplitText` | IntersectionObserver + **CSS transition** | Runs off the main thread; interruptible |
| Hero scroll settle, `ReelStrip`, `ProcessRail` fill, `ScrollProgress` | **Motion** `useScroll` / `useTransform` | Genuinely scroll-linked; rAF is required |
| `Magnetic`, `Cursor` | **Motion** springs | Decorative pointer tracking that must carry momentum |
| `Dialog`, `MobileNav`, `Accordion` | **CSS transitions** | Rapidly retriggerable; keyframes would restart from zero |
| `PageTransition` | **Motion** on mount | One-shot enter per route |

### Reduced motion

`prefers-reduced-motion: reduce` **reduces**, it does not zero. Opacity and colour
changes stay because they aid comprehension. Transform, position, grain and
marquee motion are removed. Components check `usePrefersReducedMotion()` from
`@/lib/hooks` or use the `motion-reduce:` / `motion-safe:` variants.

## Emphasis hierarchy

Not everything gets the same weight. Specifically:

- The **$250–$1,000 entry offers** are compact rows.
- The **$1,000 search and $2,000 campaign** offers are full-width panels.
- **Manny** leads the team composition; the other two roles are smaller.
- The **$1,500 career package** carries visibly more weight than the $500 and
  $1,000 packages.

Identical card grids for unequal content are banned — see
[ANTI-SLOP.md](ANTI-SLOP.md).

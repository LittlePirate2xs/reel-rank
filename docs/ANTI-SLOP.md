# ANTI-SLOP.md — the enforceable checklist

Derived from the 59-rule catalog at [impeccable.style/slop](https://impeccable.style/slop)
and Emil Kowalski's `emil-design-eng` skill. Treat every line as a review
criterion. The verifier will grep for the mechanical ones.

## Never ship these

| # | Rule | Why it is slop |
|---|---|---|
| 1 | Decorative grid-line background | Lines that measure nothing |
| 2 | Thick coloured border / side-tab stripe on a rounded card | Looks like an alert with no status |
| 3 | Hairline border **and** a wide shadow on the same surface | Two edges fighting to define one card |
| 4 | Glassmorphism / blur used as decoration | Solves no layering problem |
| 5 | Repeating-gradient stripes as filler | Visual noise |
| 6 | Border radius far beyond the card's size | Squeezes content, makes every card alike |
| 7 | Icon in a rounded tile stacked above a heading | The archetypal AI feature card |
| 8 | Pill badge or capsule above the `<h1>` | Competes with the message, looks clickable |
| 9 | Tiny numbered section labels ("01 /") where there is no sequence | Clutter. Only `ProcessRail` may number, because it is genuinely ordered |
| 10 | Radial-gradient halo / soft spotlight glow behind content | Emphasises nothing |
| 11 | Purple-to-blue or cyan-on-dark AI palette | Not this brand |
| 12 | Gradient text | Decoration pretending to be emphasis |
| 13 | Oversized hero headline that fills the whole first screen | Leaves no room for the offer |
| 14 | Monotonous spacing — equal gaps everywhere | Groups nothing; the eye cannot tell what belongs together |
| 15 | Identical card grids for unequal content | Gives a $250 bundle the same weight as a $2,000 campaign |
| 16 | Nested cards | Noise, fake depth |
| 17 | Pulsing status dot | Draws attention to something that is not changing |
| 18 | Decorative blinking cursor | Makes static copy look editable |
| 19 | Bounce or elastic easing | Fussy. Spring `bounce` stays ≤ 0.2, and only where playful |
| 20 | Animation that changes layout (width/height/padding/margin) | Stutters |
| 21 | Images that zoom or rotate on hover | Motion with no purpose |
| 22 | Auto-scrolling marquee with no pause | Forces the reader's pace |
| 23 | Inter or Geist as the whole type system | Makes every product look the same |
| 24 | Oversized italic serif display headline | The default editorial costume |
| 25 | Em-dash in every paragraph | A model's writing habit |
| 26 | "Supercharge", "world-class", "seamless", "unleash", "elevate" | Promises nothing specific |
| 27 | "Not a feature. A platform." forced-contrast slogans | Every point sounds like an ad |
| 28 | The same label repeated in several slots of one card | Reading without information |
| 29 | Gray text on a coloured surface | Washed out; check real contrast |
| 30 | Line length beyond ~75 characters | Hard to track to the next line |

## Always do these

- **Enter** with `ease-swift` and start at `scale(0.95)` or `translateY(8px)`
  **with** opacity. Never `scale(0)`.
- **Exit faster than you enter.**
- **UI motion under 300ms.** Only scroll-linked/marketing motion is longer.
- **Stagger 30–80ms** between siblings and never block interaction while it runs.
- **Press feedback** `scale(0.97)` on every pressable element.
- **Popovers scale from their trigger.** Modals stay centred — that is the one
  documented exception.
- **Gate hover motion** behind `@media (hover: hover) and (pointer: fine)`.
- **Reduced motion reduces, it does not zero.** Keep opacity and colour; drop
  transform and position.
- **One accent colour.** Vermilion does the work. If everything is accented,
  nothing is.
- **Group by proximity.** Related things close, separate groups far apart.
- **Say the specific thing.** "Three motion graphics for $250" beats
  "premium creative solutions".

## Contrast requirements

- Body text on `ink-950`: use `paper` (#F2EEE6), never `ash` (#8A8A96) below 16px.
- `ash` is for metadata at 14px and above, and must clear 4.5:1 on `ink-950`
  (it does: ~7.4:1).
- Vermilion `flare` on `ink-950` clears 4.5:1 for large text only — never use it
  for body copy.
- On `paper`, use `ink-950` for body and `ink-600` or darker for metadata.

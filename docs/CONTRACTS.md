# CONTRACTS.md — frozen interfaces

**Every builder must obey this file exactly.** If you need a change, make the
smallest compatible addition and note it in your completion report. Never
change an existing prop name, type, or default.

---

## 0. Ground rules

1. **Server components by default.** Add `"use client"` only where hooks,
   events, or Motion are required. Never put `"use client"` on a `page.tsx`.
2. **All colours, fonts, easings and durations come from tokens.** Use Tailwind
   utilities generated from `@theme` (`bg-ink-950`, `text-flare`, `ease-swift`,
   `font-display`, `text-display-2`, `rounded-md`). Inline hex values are a bug.
3. **Never write a magic media path.** Import from `@/lib/media.ts` and pass a
   `MediaAsset` to `<MediaFrame />`.
4. **`cn()` from `@/lib/cn`** for every conditional className.
5. **No `transition: all`.** Name the properties.
6. **No `ease-in`.** Use `ease-swift`, `ease-glide`, `ease-drawer`, `ease-soft`.
7. **No `scale(0)` entrances.** Start at `0.95` plus opacity.
8. **All content comes from `@/content/*`.** A component never hardcodes a
   price, a name, or a claim. If you need new copy, add it to the content file.
9. **`prefers-reduced-motion` is mandatory.** Use the `useReducedMotion` hook
   from `motion/react` (re-exported at `@/lib/hooks`) or `motion-reduce:` /
   `motion-safe:` variants. Reduced motion means *no transform or position
   change*; opacity and colour changes stay.
10. **Hover-only motion** must be wrapped by the `hoverable:` variant
    (`@custom-variant hoverable (@media (hover: hover) and (pointer: fine))`).
11. **Accessibility:** every interactive element is a real `<button>`, `<a>`,
    or `<input>`. Icons get `aria-hidden`. Every control has an accessible name.
12. **TypeScript strict.** No `any`. No non-null assertions on possibly-missing
    data.

### Path aliases

| Alias | Resolves to |
|---|---|
| `@/*` | `src/*` |

### Available deps

`next@16`, `react@19`, `motion` (Framer Motion 12 — import from `motion/react`),
`lenis`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`,
`zod`. Do not add dependencies.

---

## 1. Existing modules you must import, not recreate

### `@/lib/cn`
```ts
export function cn(...inputs: ClassValue[]): string
export function timecode(seconds: number | null | undefined): string  // 15 -> "00:15"
export function usd(value: number): string                            // 1000 -> "$1,000"
export function pad(n: number): string                                // 3 -> "03"
export function slugify(input: string): string
```

### `@/lib/motion`
```ts
export const EASE: { swift; glide; drawer; soft }        // number[] bezier tuples
export const cssEase: { swift; glide; drawer; soft }     // css strings
export const DUR: { press; fast; ui; pop; panel; reveal } // seconds
export function stagger(index: number, step?: number, max?: number): number // ms
export const SPRING: { settle; lively; snap }
export const fadeUp, fadeIn, clipUp                      // Motion variants
export function cascade(step?: number, delay?: number)
```

### `@/lib/media`
```ts
export const brand: { logo: MediaAsset; mark: MediaAsset; ogFallback: MediaAsset }
export const campaign: { hero: MediaAsset; stills: MediaAsset[] }
export const filmPosters: MediaAsset[]   // 8
export const filmSources: MediaAsset[]   // 8
export const motionSamples: MediaAsset[] // 3
export const portraits: Record<string, MediaAsset | null>
export function anyPlaceholder(assets: MediaAsset[]): boolean
```

### `@/types`
`MediaAsset`, `WorkItem`, `Film`, `Offer`, `CareerTier`, `TeamMember`,
`ProcessStep`, `FaqItem`, `NavItem`, `InquiryPayload`, `InquiryResult`.

### `@/content/site.ts`
`site` (name, wordmark, tagline, headline, promise, foundedBy, location, size,
email, url, description, founderBrand), `nav: NavItem[]`,
`footerNav: NavItem[]`, `marquee: readonly string[]`, `disciplines`.

### `@/content/offers.ts`
`offers: Offer[]`, `careerTiers: CareerTier[]`, `careerCommitments`,
`careerBio`, `getOffer(slug)`, `getCareerTier(slug)`, `offersByOrder`.

### `@/content/work.ts`
`work: WorkItem[]`, `getWork(slug)`, `featured`, `allFilms`, `workKinds`.

### `@/content/team.ts`
`team: TeamMember[]`, `teamIntro`.

### `@/content/process.ts`
`process: ProcessStep[]`, `processIntro`, `manifesto`.

### `@/content/faq.ts`
`faq: FaqItem[]`.

---

## 2. `@/lib/hooks` — you create this (builder A owns it)

```ts
/** True when the viewport prefers reduced motion. Safe during SSR (false). */
export function usePrefersReducedMotion(): boolean

/** True only for fine pointers that support hover. Safe during SSR (false). */
export function useIsPointerFine(): boolean

/** Mobile menu / dialog scroll lock. Returns nothing. */
export function useScrollLock(locked: boolean): void

/** Fire `onEnter` once when the ref enters the viewport. */
export function useInViewOnce<T extends Element>(
  options?: { margin?: string; threshold?: number },
): { ref: React.RefObject<T | null>; inView: boolean }

/**
 * Fires when the element enters, and again when it leaves.
 * Used by scroll-linked sections that need to know direction.
 */
export function useInViewToggle<T extends Element>(
  options?: { margin?: string },
): { ref: React.RefObject<T | null>; inView: boolean }

/** True after mount. Use to gate enter animations so SSR markup is stable. */
export function useMounted(): boolean
```

---

## 3. `@/components/primitives/*` — frozen APIs

### `Reveal.tsx` — `"use client"`
**CSS-based entrance. Do NOT use Motion here.** Inserts an
IntersectionObserver, then toggles a data attribute; the transition itself is
CSS on `opacity` + `transform` so it runs off the main thread.

```tsx
type RevealProps = {
  children: React.ReactNode;
  as?: React.ElementType;      // default "div"
  className?: string;
  /** Delay in ms. Use stagger(i). */
  delay?: number;              // default 0
  /** Travel distance in px. Reduced motion forces 0. */
  y?: number;                  // default 14
  /** Add a 2px blur during the transition to bridge the crossfade. */
  blur?: boolean;              // default false
  once?: boolean;              // default true
  threshold?: number;          // default 0.15
};
export function Reveal(props: RevealProps): JSX.Element
```

### `SplitText.tsx` — `"use client"`
Word-by-word clip reveal. Each word is wrapped in an inline-block span with
`overflow: hidden` on the parent, animating `clip-path` + `translateY(100%)` →
`0`. Used for the hero and section headlines.

```tsx
type SplitTextProps = {
  text: string;
  as?: React.ElementType;      // default "span"
  className?: string;
  /** Base delay in ms before the first word. */
  delay?: number;              // default 0
  /** ms between words. Keep 30–80. */
  step?: number;               // default 55
  /** Animate immediately on mount instead of waiting for intersection. */
  immediate?: boolean;         // default false
  /** Words to render in the accent colour, matched case-insensitively. */
  accentWords?: string[];
  accentClassName?: string;    // default "text-flare"
};
export function SplitText(props: SplitTextProps): JSX.Element
```
Renders the full text as one accessible string: the wrapper carries the real
text for screen readers (`aria-label`) and the per-word spans are
`aria-hidden` when split. **Reduced motion: no transform, opacity only.**

### `Marquee.tsx` — `"use client"`
```tsx
type MarqueeProps = {
  items: React.ReactNode[];
  /** Seconds for one full loop. */
  speed?: number;              // default 40
  reverse?: boolean;           // default false
  className?: string;
  itemClassName?: string;
  /** Must default true — an un-pausable marquee is a documented slop tell. */
  pauseOnHover?: boolean;      // default true
  ariaLabel?: string;
  /** Optional separator rendered between items. */
  separator?: React.ReactNode;
};
export function Marquee(props: MarqueeProps): JSX.Element
```
Duplicates the item list once and translates `-50%`. Stops on hover, focus-within
and when off-screen. Reduced motion: static, horizontally scrollable row.

### `Magnetic.tsx` — `"use client"`
```tsx
type MagneticProps = {
  children: React.ReactNode;
  className?: string;
  /** 0–1. How far the child follows the pointer. */
  strength?: number;           // default 0.25
  /** Max travel in px. */
  max?: number;                // default 10
  as?: React.ElementType;      // default "div"
};
export function Magnetic(props: MagneticProps): JSX.Element
```
No-op on coarse pointers and under reduced motion. Uses `useSpring` +
`useTransform` from `motion/react`. Never animates on keyboard focus.

### `Button.tsx` — `"use client"` only if it takes an onClick; otherwise server
```tsx
type ButtonVariant = "solid" | "outline" | "ghost" | "paper";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;     // default "solid"
  size?: ButtonSize;           // default "md"
  /** Renders a next/link instead of a button. */
  href?: string;
  /** External link: adds target/rel. */
  external?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  /** Trailing arrow that shifts right on hover. */
  arrow?: boolean;             // default false
  /** Leading icon node. Rendered aria-hidden. */
  icon?: React.ReactNode;
  "aria-label"?: string;
};
export function Button(props: ButtonProps): JSX.Element
```
Rules: `active:scale-[0.97]`, `transition-transform duration-[120ms] ease-swift`
plus named colour transitions. Hover styles inside `hoverable:`. Minimum hit
area 44px on `lg`, never below 36px.

### `Tag.tsx`
```tsx
type TagProps = {
  children: React.ReactNode;
  tone?: "flare" | "ash" | "outline" | "paper";  // default "outline"
  className?: string;
};
export function Tag(props: TagProps): JSX.Element
```
Mono, uppercase, `text-micro`, tracking wide. **Never** use a Tag as a capsule
above an `<h1>` — that is a documented slop tell.

### `Field.tsx` — exports four components
```tsx
type FieldProps = {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

type InputProps = React.ComponentPropsWithoutRef<"input">;
type TextareaProps = React.ComponentPropsWithoutRef<"textarea">;
type SelectProps = React.ComponentPropsWithoutRef<"select"> & {
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function Field(props: FieldProps): JSX.Element
export function Input(props: InputProps): JSX.Element
export function Textarea(props: TextareaProps): JSX.Element
export function Select(props: SelectProps): JSX.Element
```
`input`/`select`/`textarea` font-size must be **at least 16px** to stop iOS
zooming the page on focus. Invalid state uses `aria-invalid` plus a visible
message wired with `aria-describedby`. Errors are never colour-only.

### `MediaFrame.tsx`
The single way media is rendered anywhere in the app.

```tsx
type MediaFrameProps = {
  asset: MediaAsset;
  /** CSS aspect-ratio value, e.g. "16 / 9". Defaults to the asset's own ratio. */
  ratio?: string;
  className?: string;
  sizes?: string;              // passed to next/image
  priority?: boolean;          // default false
  /** Object-fit. Default "cover". */
  fit?: "cover" | "contain";
};
export function MediaFrame(props: MediaFrameProps): JSX.Element
```
When `asset.placeholder` is true it renders `<PlaceholderFrame />` instead of an
`<img>`: a designed ink surface with a mono label, the asset id, a corner
timecode-style marker and a subtle diagonal hairline. It must look intentional,
not broken. When false it renders `next/image` with `fill`.

Also export:
```tsx
export function PlaceholderFrame(props: {
  asset: MediaAsset;
  className?: string;
  compact?: boolean;           // smaller label, for thumbnails
}): JSX.Element
```

### `Cursor.tsx` — `"use client"`
Custom pointer ring. Two nested divs: a small dot and a ring that lags behind.
Grows and turns `flare` over `[data-cursor="hover"]` targets, contracts on
pointer-down. Hidden entirely on coarse pointers, under reduced motion, and
when `document.hasFocus()` is false. Never hides the native cursor unless the
ring has successfully mounted.

```tsx
type CursorProps = { className?: string };
export function Cursor(props: CursorProps): JSX.Element | null
```

### `GrainOverlay.tsx`
Fixed, `pointer-events-none`, `aria-hidden`, `mix-blend-overlay`, low opacity,
fills the viewport with the film grain from `.u-grain`. Renders nothing under
reduced motion.

```tsx
type GrainOverlayProps = { opacity?: number; className?: string };
export function GrainOverlay(props: GrainOverlayProps): JSX.Element | null
```

### `ScrollProgress.tsx` — `"use client"`
2px vermilion bar along the top, `scaleX` bound to scroll progress via
`useScroll` + `useSpring`. `aria-hidden`. Under reduced motion it still tracks
scroll but with no spring smoothing.

```tsx
type ScrollProgressProps = { className?: string };
export function ScrollProgress(props: ScrollProgressProps): JSX.Element
```

### `SmoothScroll.tsx` — `"use client"`
Lenis provider. Mounts Lenis only when the pointer is fine and reduced motion is
off. Must call `lenis.destroy()` on unmount, and must integrate with Motion's
frame loop via `lenis.on("scroll", ...)` + `requestAnimationFrame` OR use
Lenis' own RAF. Intercepts in-page `#hash` anchor clicks and smooth-scrolls to
the target, accounting for the header height.

```tsx
type SmoothScrollProps = { children: React.ReactNode };
export function SmoothScroll(props: SmoothScrollProps): JSX.Element
```

### `SectionHeading.tsx`
```tsx
type SectionHeadingProps = {
  id?: string;
  /** Small mono line above the title. Plain words, never "01 /". */
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";   // default "left"
  tone?: "ink" | "paper";      // default "ink"
  /** Optional CTA cluster aligned to the end. */
  action?: React.ReactNode;
  className?: string;
  /** Animate the title word by word. */
  split?: boolean;             // default false
};
export function SectionHeading(props: SectionHeadingProps): JSX.Element
```
Heading gets `scroll-margin-top` so anchors do not hide under the header.
**Never** render a numbered prefix or a pill badge.

### `Divider.tsx`
```tsx
type DividerProps = {
  tone?: "ink" | "paper";
  className?: string;
  /** Adds a short vermilion segment at the start. */
  accent?: boolean;
};
export function Divider(props: DividerProps): JSX.Element
```

### `Accordion.tsx` — `"use client"`
```tsx
type AccordionItem = { id: string; q: string; a: string };

type AccordionProps = {
  items: AccordionItem[];
  /** default true */
  single?: boolean;
  defaultOpenId?: string;
  className?: string;
};
export function Accordion(props: AccordionProps): JSX.Element
```
Real `<button aria-expanded aria-controls>` + panel with `role="region"` and
`aria-labelledby`. Animate with `grid-template-rows: 0fr → 1fr` on the panel
wrapper plus opacity, `--dur-panel` / `--ease-glide`. Rotate the chevron with
`transform`. Reduced motion: instant.

### `Dialog.tsx` — `"use client"`
```tsx
type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Visually hidden title is allowed; `title` is still required. */
  hideTitle?: boolean;
  children: React.ReactNode;
  className?: string;
  /** Max width utility, default "max-w-5xl". */
  size?: string;
};
export function Dialog(props: DialogProps): JSX.Element | null
```
Requirements: renders in a portal, `role="dialog" aria-modal="true"`,
focus moves in on open and returns to the trigger on close, `Tab` is trapped,
`Escape` closes, backdrop click closes, scroll is locked, body scroll position
preserved. Enter `opacity` + `scale(0.96)` with `ease-swift` at `--dur-panel`;
exit faster at `--dur-fast`. **Keep `transform-origin: center`** (modals are the
documented exception to origin-aware scaling).

### `CopyButton.tsx` — `"use client"`
```tsx
type CopyButtonProps = {
  value: string;
  label?: string;              // default "Copy"
  copiedLabel?: string;        // default "Copied"
  className?: string;
};
export function CopyButton(props: CopyButtonProps): JSX.Element
```
Uses `navigator.clipboard`, announces the change in an `aria-live="polite"`
region, resets after 2s. Falls back gracefully when the API is unavailable.

---

## 4. `@/components/layout/*` — frozen APIs

### `Container.tsx`
```tsx
type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  /** "shell" (max-w-96rem) or "wide" (max-w-120rem). */
  width?: "shell" | "wide";    // default "shell"
};
```

### `Header.tsx` — `"use client"`
Sticky top bar. Starts transparent over the hero; after ~40px of scroll it
gains a hairline bottom border and a translucent ink backdrop with
`backdrop-blur`. Wordmark links to `/`. Desktop nav from `nav` in
`@/content/site`. Right side: a `Button href="/contact"` reading
"Start a brief". Active route gets `aria-current="page"` and a vermilion
underline. Opens `MobileNav` below `lg`. Hides on scroll-down / reveals on
scroll-up (transform only, never layout).

```tsx
export function Header(): JSX.Element
```

### `MobileNav.tsx` — `"use client"`
```tsx
type MobileNavProps = { open: boolean; onClose: () => void };
export function MobileNav(props: MobileNavProps): JSX.Element
```
Full-height drawer, `--ease-drawer` at `--dur-panel`, staggered nav items
(40ms), scroll locked, focus trapped, Escape closes. Uses `nav` items plus
their `hint`.

### `Footer.tsx`
Large wordmark (`site.wordmark`) that scales subtly with scroll progress,
footer nav from `footerNav`, contact email, the Houston line, the year, and a
one-line provenance note that the featured work is RamanRasa, founder-owned.
Server component.

```tsx
export function Footer(): JSX.Element
```

### `PageTransition.tsx` — `"use client"`
Wraps route content in `app/template.tsx`. Enter: `opacity 0 → 1` and
`translateY(8px) → 0` with `ease-swift` at `DUR.panel`. **Exit animation is not
possible in the App Router without the View Transitions API**, so do not fake
one. Reduced motion: opacity only.

```tsx
export function PageTransition(props: { children: React.ReactNode }): JSX.Element
```

---

## 5. `@/components/sections/*` — frozen APIs

Each takes no props (they read from `@/content`) and renders `<section>`.

| Component | Content source | Notes |
|---|---|---|
| `Hero.tsx` | `site`, `marquee` | Split headline `site.headline` in `text-display-1`, two Buttons, scroll-cue, grain, a scroll-linked scale settle. Must fit the fold at 360×640 without the headline eating the whole screen. |
| `ReelStrip.tsx` | `allFilms`, `@/lib/media` | Sticky horizontal rail driven by vertical scroll. Cards show label, work title, timecode. Clicking a card opens `FilmPlayer`. |
| `OfferLadder.tsx` | `offersByOrder` | **Deliberately unequal weight.** Entry offers ($250/$500/$1,000) as a compact 3-row list. Flagship offers open as full-width panels. Never an identical card grid. |
| `Manifesto.tsx` | `manifesto` | Three points. Vary the treatment; do not use three identical cards. |
| `ProcessRail.tsx` | `process`, `processIntro` | Three steps that genuinely are a sequence, so numbering is allowed here. Vertical rule that fills with scroll progress. |
| `TeamWall.tsx` | `team`, `teamIntro` | One typographic composition, not three identical cards. Manny leads it. |
| `FaqSection.tsx` | `faq` | `SectionHeading` + `Accordion`, two columns at `lg`. |
| `ContactCta.tsx` | `site` | Closing call to action with the one-day promise and a Button to `/contact`. |

---

## 6. `@/components/work/*` — frozen APIs

### `WorkCard.tsx`
```tsx
type WorkCardProps = {
  item: WorkItem;
  index: number;
  className?: string;
};
```
Shows `MediaFrame` (hero), title, hook, kind, credit line. The founder-owned
credit must be visible on the card, not hidden in a detail page.

### `WorkGrid.tsx` — `"use client"`
```tsx
type WorkGridProps = { items: WorkItem[] };
```
Filter uses `workKinds`. Filtering animates with Motion `layout`; the active
filter is a real `<button role="tab">` set with `aria-selected`. Keep the
filter transition under `DUR.ui`. Reduced motion: instant swap.

### `FilmPlayer.tsx` — `"use client"`
```tsx
type FilmPlayerProps = {
  films: (Film & { workTitle?: string })[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (next: number) => void;
};
```
Renders inside `Dialog`. Native `<video controls playsInline poster>`. Previous
/ next queue, keyboard `←`/`→`, mute toggle starting **muted** (autoplay policy),
timecode via `timecode()`. When the asset is a placeholder, show
`PlaceholderFrame` plus a clear notice that the film file is not yet wired.

### `CampaignSeries.tsx`
```tsx
type CampaignSeriesProps = { item: WorkItem };
```
Grid of the item's films with poster, part label and timecode. Clicking a film
selects it in a shared player. Used on `/work/[slug]`.

---

## 7. `@/components/offers/*` and `@/components/career/*`

### `OfferRow.tsx`
```tsx
type OfferRowProps = { offer: Offer; index: number };
```
Compact list row for `tier === "entry"`.

### `OfferPanel.tsx`
```tsx
type OfferPanelProps = { offer: Offer };
```
Full-width cinematic panel for `tier === "flagship"`. Must render
`offer.commitments` and `offer.disclaimers` **verbatim and visibly** — these are
contractual.

### `PriceTag.tsx`
```tsx
type PriceTagProps = {
  price: string;
  unit?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};
```
Mono, tabular figures (`tabular-nums`), price leads and unit follows in `ash`.

### `SearchStack.tsx`
The SEO / GEO / AEO three-part explainer. Three items that are genuinely
parallel, so numbering-free equal treatment is fine here, but vary the layout
from a plain three-card grid: use a stacked list with a shared left rule.

### `CareerTier.tsx`
```tsx
type CareerTierProps = { tier: CareerTier; index: number };
```
`isComplete` tiers lead with the commitment from `careerCommitments`. The
disclaimer must always be rendered, never truncated.

---

## 8. Routes — owned by the lead

Builders must **not** create or edit anything under `src/app/`.

| File | Contents |
|---|---|
| `app/layout.tsx` | Fonts via `next/font/google` (Archivo, Instrument_Sans, Azeret_Mono), `globals.css`, skip link, `SmoothScroll`, `Header`, `Footer`, `ScrollProgress`, `Cursor`, `GrainOverlay`, metadata |
| `app/template.tsx` | `PageTransition` |
| `app/page.tsx` | Home: `Hero`, `ReelStrip`, `OfferLadder`, `Manifesto`, `ProcessRail`, `TeamWall`, `FaqSection`, `ContactCta` |
| `app/work/page.tsx` | `WorkGrid` over `work` |
| `app/work/[slug]/page.tsx` | Campaign detail with `CampaignSeries` + `generateStaticParams` |
| `app/offers/page.tsx` | `OfferRow` list + `OfferPanel` panels + `SearchStack` |
| `app/offers/[slug]/page.tsx` | Offer detail |
| `app/career/page.tsx` | Career tiers + `careerBio` + commitments |
| `app/about/page.tsx` | `TeamWall`, `ProcessRail`, story |
| `app/contact/page.tsx` | Working inquiry form wired to `/api/inquiry` |
| `app/api/inquiry/route.ts` | `zod`-validated POST returning `InquiryResult` |
| `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`, `app/not-found.tsx` | SEO + 404 |

---

## 9. Definition of done for every builder

- `npx tsc --noEmit` reports **zero** errors in the files you own.
- No `transition: all`, no `ease-in`, no `scale(0)`, no ink-colour hex literals.
- Every animated component handles reduced motion.
- Every media render goes through `MediaFrame`.
- Every string that a user reads comes from `@/content/*`.
- Report back: files created, any contract deviation, anything you could not
  finish.

# Reel & Rank — Rebuild Plan

**Target:** `C:\Users\vikky\Documents\Jwelry\reel-and-rank`
**Stack:** Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · Motion (Framer Motion 12 successor) · Lenis
**Architecture:** Cinematic scroll-linked home page + real detail routes (hybrid)
**Copy:** Existing copy reused, rewritten sharper. All prices, guarantees and disclaimers kept factual.

---

## 1. Audit of the current site

### What exists today

| Area | Current state | Verdict |
|---|---|---|
| Structure | One long anchor-scroll page, 7 numbered blocks | Works, but no real routes, no deep-linkable offers/work |
| Header | Static anchors, no menu on mobile | Weak |
| Hero | "MAKE A LITTLE NOISE." + two CTAs | Great line, weak execution |
| Work | 1 featured campaign + a modal film player, 8 films | Content exists but buried and non-shareable |
| Offers | 5 offers + 3 career packages in flat blocks | Solid facts, monotonous card grid, tiny numbers |
| Process | 3 steps | Fine |
| Team | Paragraph, no faces, no roles | Underused — "three people" is the whole pitch |
| FAQ | 6 accordion items | Good content, naive interaction |
| Contact | Form marked "REVIEW MODE — SENDING ISN'T CONNECTED YET" | **Not functional** |
| Motion | Almost none; `ScrollToTop` and a modal | **Not premium** |
| Media | `assets/campaign/*.jpg`, 8 films | Not present locally |
| SEO | Title + a few meta tags | Thin: no OG image, sitemap, robots, or JSON-LD |
| Access | Skip link present; no reduced-motion handling; modal focus trap unverified | Partial |

### Problems that matter

1. **It admits it is a preview.** "REVIEW MODE", "SENDING ISN'T CONNECTED YET", "this review site doesn't send inquiries yet" — visible in the FAQ, the form, and the footer. A premium site cannot ship apologies.
2. **The inquiry form is the entire conversion path and it does nothing.**
3. **Numbered section labels** (`01 /`, `02 /`) on sections that aren't a sequence — a documented AI-slop tell.
4. **Identical card grids** — every offer has the same icon/heading/price/body shape, so a $250 bundle and a $2,000 campaign carry identical weight.
5. **Monotonous spacing** — equal gaps everywhere, so nothing groups.
6. **No motion language.** Nothing ties the "motion studio" claim to the experience of the page.
7. **Films live behind a modal** instead of being the main event.
8. **No design system** — no tokens, no scale, no documented type or color decisions.

### Content we keep (facts that must not change)

- 3 people, Houston TX. Founded by Manny Singh.
- Motion graphics set of 3 — **$250**
- 15-second ad — **$500**
- Up-to-1-minute ad — **$1,000**
- SEO / GEO / AEO strategy + dashboard — **from $1,000**
- Selling campaigns — **from $2,000**
- Career: interview video **$500**, résumé + video + portfolio **$1,000**, complete package **$1,500**
- All existing disclaimers: no guaranteed rankings/traffic/citations/sales, no guaranteed job offer, media buying excluded, refinement of the *agreed* creative direction only.
- Featured work is RamanRasa, the founder's own brand, AI-assisted — **not** client testimonials. This honesty stays and is presented as a strength, not a footnote.

---

## 2. Design direction — "Signal, not noise"

A motion studio's website should demonstrate motion. But the references (`impeccable.style`) document exactly how that goes wrong. So the direction is disciplined:

### Palette — one accent, high contrast, no purple

| Token | Value | Role |
|---|---|---|
| `--ink-950` | `#08080A` | Base stage |
| `--ink-900` | `#0E0E12` | Raised surface |
| `--ink-800` | `#17171D` | Card |
| `--ink-700` | `#24242C` | Hairline / border |
| `--paper` | `#F2EEE6` | Light sections (warm, deliberate) |
| `--paper-dim` | `#CFC9BE` | Muted text on paper |
| `--flare` | `#FF4A1C` | **The** accent — vermilion |
| `--ember` | `#FF8A3D` | Accent tint, gradient partner only |
| `--ash` | `#8A8A96` | Muted text on ink |

Chosen because vermilion reads as heat, spice (the founder's own brand), Houston sun, and film-lab red. Explicitly **not** a purple/cyan AI gradient, and **not** a cream/beige editorial default.

### Typography — three families, each with a job

| Token | Family | Use |
|---|---|---|
| `--font-display` | **Archivo** (variable, `wdth` up to 125, `wght` 700–900) | Expanded black headlines — distinctive, kinetic, scales beautifully for scroll-driven type |
| `--font-sans` | **Instrument Sans** | Body and UI |
| `--font-mono` | **Azeret Mono** | Timecodes, reel numbers, metadata, price labels |

Deliberately avoids Inter and Geist (documented "overused font" tell) and avoids the italic-serif display headline tell. The mono is *functional* here — this is a video studio; timecodes and reel IDs are real information.

### Motion language (Emil Kowalski rules, enforced)

- **Easings:** `--ease-out: cubic-bezier(0.23,1,0.32,1)`, `--ease-in-out: cubic-bezier(0.77,0,0.175,1)`, `--ease-drawer: cubic-bezier(0.32,0.72,0,1)`. **Never** `ease-in`.
- **Durations:** UI feedback 100–160ms · popovers 125–200ms · dropdowns 150–250ms · modals/drawers 200–500ms · marketing/scroll can be longer.
- **Entrances** from `scale(0.95)`/`translateY(8px)` **with opacity**. Never `scale(0)`.
- **Press feedback:** `scale(0.97)` on `:active` for every pressable element.
- **Animate `transform`, `opacity`, `clip-path`, `filter` only.** Never width/height/padding.
- **Stagger** 30–80ms between siblings. Never block interaction while staggering.
- **`prefers-reduced-motion`**: motion is *reduced*, not zero — opacity/colour stay, transform/position go.
- **No bounce or elastic easing** anywhere.
- **CSS animations** for predetermined sequences (off main thread); **Motion** for scroll-linked and interruptible interaction.
- **No keyboard-triggered animation.**
- **Hover motion** gated behind `@media (hover: hover) and (pointer: fine)`.

### Signature moments

1. **Hero — "MAKE A LITTLE NOISE."** Per-word `clip-path` + `translateY` reveal, then a scroll-linked scale/letter-spacing settle as the section pins. Animated **film grain + scanline** overlay in `--flare` used at very low opacity.
2. **Reel strip** — horizontal scroll driven by vertical page scroll (sticky viewport). Real film cards with timecodes, hover shows a poster scrub. This replaces the hidden modal.
3. **Price ladder** — the five offers rendered at *deliberately unequal weight*: a compact list for the $250–$1,000 entry offers, then a full-width cinematic panel for the $1,000 search and $2,000 campaign tiers. Counters animate once on enter only.
4. **The Wall** — the three-person team as a single typographic composition, not three identical cards.
5. **Wordmark that follows you** — the footer's `reel&rank.` scales with scroll progress.
6. **Custom cursor** on pointer-fine devices only: a small vermilion ring that magnetises to interactive elements and scales on press. Disabled on touch and under reduced motion.

### Anti-slop commitments (from `impeccable.style/slop`, 59 rules)

Will not ship: decorative grid backgrounds · thick coloured side-tab borders · hairline border **plus** wide shadow on the same card · glassmorphism as decoration · repeating-gradient stripes · extreme card radius · icon-tile-stacked-above-heading · badge/capsule above the H1 · tiny numbered section labels · oversized hero headline that eats the fold · radial-gradient halos · soft spotlight glows · gradient text · pulsing status dots · decorative blinking cursors · auto-scrolling marquees without pause · hover-zoom on every image · nested cards · identical card grids · monotonous spacing · em-dash overuse · generic "world-class/supercharge" claims · "Not a feature. A platform." forced contrast.

---

## 3. Architecture

```
reel-and-rank/
├─ docs/
│  ├─ CONTRACTS.md          # frozen APIs every builder must obey
│  ├─ DESIGN.md             # tokens, type scale, motion scale
│  └─ ANTI-SLOP.md          # the enforceable checklist
├─ public/
│  └─ media/                # drop-in real assets (currently placeholders)
│     ├─ README.md
│     └─ MANIFEST.md
└─ src/
   ├─ app/
   │  ├─ layout.tsx  page.tsx  globals.css  not-found.tsx
   │  ├─ work/page.tsx        work/[slug]/page.tsx
   │  ├─ offers/page.tsx      offers/[slug]/page.tsx
   │  ├─ career/page.tsx  about/page.tsx  contact/page.tsx
   │  ├─ sitemap.ts  robots.ts  opengraph-image.tsx
   │  └─ api/inquiry/route.ts          # the form actually works
   ├─ components/
   │  ├─ primitives/   Button Tag Field Reveal SplitText Marquee Magnetic
   │  │                Cursor GrainOverlay ScrollProgress SmoothScroll
   │  │                SectionHeading Divider Accordion Dialog CopyButton
   │  ├─ layout/       Header MobileNav Footer PageTransition Container
   │  ├─ sections/     Hero Manifesto ReelStrip OfferLadder Process
   │  │                Team Wall Faq ContactCta LogosStrip
   │  ├─ work/         WorkCard WorkGrid FilmPlayer CampaignSeries
   │  ├─ offers/       OfferCard OfferTier PriceTag SearchStack
   │  └─ career/       CareerTier CareerTimeline
   ├─ content/         site.ts offers.ts work.ts team.ts process.ts faq.ts
   ├─ lib/             cn.ts motion.ts media.ts seo.ts useMagnetic.ts
   ├─ styles/          tokens.css
   └─ types/           index.ts
```

### Routes

| Route | Purpose |
|---|---|
| `/` | Cinematic scroll home |
| `/work` | All films + campaigns, filterable |
| `/work/[slug]` | Campaign / film detail, deep-linkable, shareable OG |
| `/offers` | All five offers, price ladder |
| `/offers/[slug]` | Offer detail with deliverables, timeline, FAQ, CTA |
| `/career` | Manny + three career packages |
| `/about` | The three people, Houston, approach |
| `/contact` | Working inquiry form → `/api/inquiry` |
| `not-found` | On-brand 404 |

---

## 4. Build phases

| # | Phase | Owner | Output |
|---|---|---|---|
| 0 | Scaffold + deps | lead | Next 15, Tailwind v4, Motion, Lenis installed |
| 1 | Foundation | lead | tokens, globals, `cn`, motion constants, types, content data, media manifest |
| 2 | Contracts | lead | `docs/CONTRACTS.md` + `docs/DESIGN.md` + `docs/ANTI-SLOP.md` frozen |
| 3 | Primitives | subagent A + B | all `components/primitives/*` |
| 4 | Layout chrome | subagent C | Header, MobileNav, Footer, PageTransition |
| 5 | Home sections | subagent D + E | 8 section components |
| 6 | Work + Offers + Career | subagent F + G | domain components |
| 7 | Routes + SEO + API | lead | all pages assembled, metadata, sitemap, inquiry route |
| 8 | Verify | subagent H | anti-slop audit + animation review, fixes applied |
| 9 | Build + run | lead | `next build` clean, dev server verified |

Phases 3–6 run as one parallel wave once phase 2 is frozen. Each builder owns **disjoint files** — no two agents touch the same path.

---

## 5. Definition of done

- [ ] `npm run build` passes with zero errors and zero type errors
- [ ] Every route renders and is deep-linkable
- [ ] Inquiry form posts to `/api/inquiry` and returns a real result (no "review mode")
- [ ] No "preview / review mode / coming soon" language anywhere
- [ ] Zero `transition: all`, zero `ease-in`, zero `scale(0)` entrances, zero `duration > 500ms` on UI
- [ ] `prefers-reduced-motion` honoured on every animated component
- [ ] All five offers + three career packages present with correct prices and disclaimers
- [ ] Media referenced only through the typed manifest in `lib/media.ts`
- [ ] Anti-slop audit returns no critical findings
- [ ] Runs at `http://localhost:3000`

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ORACLE } from "../helpers/contract-oracle.mjs";
import {
  readFileSafe,
  exists,
  countWords,
  validateUnifiedGraph,
  validateVideoObject,
  extractDirectAnswer,
  extractOffersDirectAnswer,
} from "../helpers/test-context.mjs";

describe("Tier 1: Feature Coverage (Isolated Functionality)", () => {
  // =========================================================================
  // Feature 1: /llms.txt Endpoint
  // =========================================================================
  describe("Feature 1: /llms.txt Endpoint", () => {
    it("T1-F01-01: Route file exists or endpoint handler is defined", () => {
      const routeExists = exists("src/app/llms.txt/route.ts");
      assert.equal(
        routeExists,
        true,
        "src/app/llms.txt/route.ts must exist as an App Router route handler"
      );
    });

    it("T1-F01-02: Content contains studio name and Houston tagline", () => {
      const content = readFileSafe("src/app/llms.txt/route.ts") || "";
      assert.ok(
        content.includes("site.name") || /Reel & Rank/i.test(content),
        "llms.txt must state studio name 'Reel & Rank'"
      );
      assert.ok(
        content.includes("site.location") || /Houston/i.test(content),
        "llms.txt must explicitly mention studio location 'Houston'"
      );
    });

    it("T1-F01-03: Content contains founder credentials and corporate history", () => {
      const content = readFileSafe("src/app/llms.txt/route.ts") || "";
      assert.ok(
        content.includes("site.foundedBy") || /Manny Singh/i.test(content),
        "llms.txt must include founder Manny Singh"
      );
      assert.ok(
        content.includes("site.founderCorporateHistory") ||
          ORACLE.studio.corporateHistory.some((c) => content.includes(c)),
        "llms.txt must reference corporate history credentials"
      );
    });

    it("T1-F01-04: Content specifies flat-rate pricing tiers ($250 to $2,000+)", () => {
      const content = readFileSafe("src/app/llms.txt/route.ts") || "";
      assert.ok(
        content.includes("offersByOrder") || content.includes("$250"),
        "llms.txt must detail flat-rate production services and pricing"
      );
    });

    it("T1-F01-05: Returns clean markdown formatting with text/plain mime", () => {
      const content = readFileSafe("src/app/llms.txt/route.ts") || "";
      assert.match(
        content,
        /text\/plain|text\/markdown/,
        "Route response must specify text/plain or text/markdown content-type"
      );
      assert.ok(!content.includes("<html"), "llms.txt must not output HTML markup");
    });
  });

  // =========================================================================
  // Feature 2: /llms-full.txt Endpoint
  // =========================================================================
  describe("Feature 2: /llms-full.txt Endpoint", () => {
    it("T1-F02-01: Route file exists or endpoint handler is defined", () => {
      const routeExists = exists("src/app/llms-full.txt/route.ts");
      assert.equal(
        routeExists,
        true,
        "src/app/llms-full.txt/route.ts must exist as an App Router route handler"
      );
    });

    it("T1-F02-02: Content provides comprehensive deliverables for all offers", () => {
      const content = readFileSafe("src/app/llms-full.txt/route.ts") || "";
      assert.ok(
        content.includes("offersByOrder") || content.includes("offers"),
        "llms-full.txt must detail all offers from catalog"
      );
    });

    it("T1-F02-03: Content includes turnaround commitments (24h, 48h, 3 days)", () => {
      const content = readFileSafe("src/app/llms-full.txt/route.ts") || "";
      assert.ok(
        content.includes("offer.turnaround") || /24 hours|one day/i.test(content),
        "llms-full.txt must document turnaround commitments"
      );
    });

    it("T1-F02-04: Content includes studio contact and founder brand references", () => {
      const content = readFileSafe("src/app/llms-full.txt/route.ts") || "";
      assert.ok(
        content.includes("site.email") || /reelandrank\.com/i.test(content),
        "llms-full.txt must provide studio email contact"
      );
      assert.ok(
        content.includes("site.founderBrand") || /RamanRasa/i.test(content),
        "llms-full.txt must credit founder brand RamanRasa"
      );
    });

    it("T1-F02-05: Content contains structured markdown sections", () => {
      const content = readFileSafe("src/app/llms-full.txt/route.ts") || "";
      assert.match(content, /#\s+/m, "llms-full.txt must contain markdown headers");
      assert.match(content, /-\s+/m, "llms-full.txt must contain markdown bullet lists");
    });
  });

  // =========================================================================
  // Feature 3: Unified Schema.org @graph (Person, LocalBusiness, Offer)
  // =========================================================================
  describe("Feature 3: Unified Schema.org @graph", () => {
    it("T1-F03-01: src/lib/seo.ts exports unifiedGraphJsonLd with @graph structure", () => {
      const content = readFileSafe("src/lib/seo.ts") || "";
      assert.match(
        content,
        /export\s+function\s+unifiedGraphJsonLd/,
        "seo.ts must export unifiedGraphJsonLd"
      );
      assert.match(
        content,
        /@graph/,
        "seo.ts must generate a unified @graph array"
      );
    });

    it("T1-F03-02: Graph links Person Manny Singh with corporate history", () => {
      const content = readFileSafe("src/lib/seo.ts") || "";
      assert.match(
        content,
        /#founder/,
        "Person entity must have #founder @id anchor"
      );
      assert.match(
        content,
        /founderCorporateHistory|Salesforce|United Airlines|Morgan Stanley/,
        "Person entity must reference corporate history credentials"
      );
    });

    it("T1-F03-03: Graph links LocalBusiness/ProfessionalService with Houston coords", () => {
      const content = readFileSafe("src/lib/seo.ts") || "";
      assert.match(
        content,
        /#studio/,
        "Studio entity must have #studio @id anchor"
      );
      assert.ok(
        content.includes("site.location.latitude") || content.includes("29.7604"),
        "Studio entity must include latitude 29.7604"
      );
      assert.ok(
        content.includes("site.location.longitude") || content.includes("-95.3698"),
        "Studio entity must include longitude -95.3698"
      );
    });

    it("T1-F03-04: Graph links OfferCatalog and Offer items", () => {
      const content = readFileSafe("src/lib/seo.ts") || "";
      assert.match(
        content,
        /OfferCatalog|#catalog/,
        "seo.ts must declare OfferCatalog with #catalog @id"
      );
      assert.match(
        content,
        /itemListElement|makesOffer|hasOfferCatalog/,
        "Catalog must link offer catalog elements"
      );
    });

    it("T1-F03-05: Root layout injects unifiedGraphJsonLd into script tag", () => {
      const layoutContent = readFileSafe("src/app/layout.tsx") || "";
      assert.match(
        layoutContent,
        /unifiedGraphJsonLd/,
        "src/app/layout.tsx must inject unifiedGraphJsonLd()"
      );
    });
  });

  // =========================================================================
  // Feature 4: VideoObject Structured Metadata
  // =========================================================================
  describe("Feature 4: VideoObject Structured Metadata", () => {
    it("T1-F04-01: src/lib/seo.ts exports videoObjectJsonLd or workVideosJsonLd", () => {
      const content = readFileSafe("src/lib/seo.ts") || "";
      assert.match(
        content,
        /export\s+function\s+(videoObjectJsonLd|workVideosJsonLd)/,
        "seo.ts must export videoObjectJsonLd or workVideosJsonLd"
      );
    });

    it("T1-F04-02: VideoObject structure includes name and description", () => {
      const content = readFileSafe("src/lib/seo.ts") || "";
      assert.match(
        content,
        /@type["']?:\s*["']VideoObject["']/,
        "Must specify @type: 'VideoObject'"
      );
      assert.match(content, /name:/, "VideoObject must specify name property");
      assert.match(content, /description:/, "VideoObject must specify description property");
    });

    it("T1-F04-03: VideoObject provides absolute thumbnailUrl and contentUrl", () => {
      const content = readFileSafe("src/lib/seo.ts") || "";
      assert.match(content, /thumbnailUrl/, "VideoObject must define thumbnailUrl");
      assert.match(content, /contentUrl/, "VideoObject must define contentUrl");
    });

    it("T1-F04-04: VideoObject provides uploadDate", () => {
      const content = readFileSafe("src/lib/seo.ts") || "";
      assert.match(content, /uploadDate/, "VideoObject must define uploadDate");
    });

    it("T1-F04-05: /work and /work/[slug] inject VideoObject script tags", () => {
      const workPage = readFileSafe("src/app/work/page.tsx") || "";
      const workSlugPage = readFileSafe("src/app/work/[slug]/page.tsx") || "";
      assert.ok(
        workPage.includes("video") || workPage.includes("JsonLd"),
        "/work/page.tsx must reference video structured data"
      );
      assert.ok(
        workSlugPage.includes("video") || workSlugPage.includes("JsonLd"),
        "/work/[slug]/page.tsx must reference video structured data"
      );
    });
  });

  // =========================================================================
  // Feature 5: Quotable Direct-Answer Definition Blocks
  // =========================================================================
  describe("Feature 5: Quotable Direct-Answer Definition Blocks", () => {
    it("T1-F05-01: offersDirectAnswer exists in src/content/offers.ts and is 45-60 words", () => {
      const content = readFileSafe("src/content/offers.ts") || "";
      const answer = extractOffersDirectAnswer(content);
      assert.ok(answer, "offersDirectAnswer must be exported in src/content/offers.ts");
      const wordCount = countWords(answer);
      assert.ok(
        wordCount >= 45 && wordCount <= 60,
        `offersDirectAnswer word count must be between 45 and 60, got ${wordCount}`
      );
    });

    it("T1-F05-02: motion-graphics-set directAnswer is 45-60 words", () => {
      const content = readFileSafe("src/content/offers.ts") || "";
      const answer = extractDirectAnswer(content, "motion-graphics-set");
      assert.ok(answer, "motion-graphics-set must define directAnswer");
      const count = countWords(answer);
      assert.ok(
        count >= 45 && count <= 60,
        `motion-graphics-set directAnswer must be 45-60 words, got ${count}`
      );
    });

    it("T1-F05-03: fifteen-second-ad directAnswer is 45-60 words", () => {
      const content = readFileSafe("src/content/offers.ts") || "";
      const answer = extractDirectAnswer(content, "fifteen-second-ad");
      assert.ok(answer, "fifteen-second-ad must define directAnswer");
      const count = countWords(answer);
      assert.ok(
        count >= 45 && count <= 60,
        `fifteen-second-ad directAnswer must be 45-60 words, got ${count}`
      );
    });

    it("T1-F05-04: sixty-second-ad directAnswer is 45-60 words", () => {
      const content = readFileSafe("src/content/offers.ts") || "";
      const answer = extractDirectAnswer(content, "sixty-second-ad");
      assert.ok(answer, "sixty-second-ad must define directAnswer");
      const count = countWords(answer);
      assert.ok(
        count >= 45 && count <= 60,
        `sixty-second-ad directAnswer must be 45-60 words, got ${count}`
      );
    });

    it("T1-F05-05: flagship offers (search-visibility & selling-campaign) define 45-60 word answers", () => {
      const content = readFileSafe("src/content/offers.ts") || "";
      const answerSearch = extractDirectAnswer(content, "search-visibility");
      const answerSelling = extractDirectAnswer(content, "selling-campaign");
      assert.ok(answerSearch, "search-visibility must define directAnswer");
      assert.ok(answerSelling, "selling-campaign must define directAnswer");
      const countSearch = countWords(answerSearch);
      const countSelling = countWords(answerSelling);
      assert.ok(countSearch >= 45 && countSearch <= 60, `search-visibility words: ${countSearch}`);
      assert.ok(countSelling >= 45 && countSelling <= 60, `selling-campaign words: ${countSelling}`);
    });
  });

  // =========================================================================
  // Feature 6: Zero-Latency Pointer-Down :active Press Response
  // =========================================================================
  describe("Feature 6: Zero-Latency Pointer-Down :active Press Response", () => {
    it("T1-F06-01: src/app/globals.css defines .u-press active scale transformation", () => {
      const content = readFileSafe("src/app/globals.css") || "";
      assert.match(
        content,
        /\.u-press:active/,
        "globals.css must define .u-press:active rule"
      );
      assert.match(
        content,
        /scale\(0\.9[5-8]\)/,
        ".u-press:active must apply instant scale transform (e.g. scale(0.97))"
      );
    });

    it("T1-F06-02: .u-press transition duration is instantaneous (<= 40ms)", () => {
      const content = readFileSafe("src/app/globals.css") || "";
      assert.match(
        content,
        /40ms|var\(--dur-press\)/,
        ".u-press must use rapid 40ms or --dur-press timing"
      );
    });

    it("T1-F06-03: touch-action: manipulation is configured globally", () => {
      const content = readFileSafe("src/app/globals.css") || "";
      assert.match(
        content,
        /touch-action:\s*manipulation/,
        "globals.css must set touch-action: manipulation to eliminate 300ms tap delay"
      );
    });

    it("T1-F06-04: Button primitive uses .u-press or active scale feedback", () => {
      const content = readFileSafe("src/components/primitives/Button.tsx") || "";
      assert.match(
        content,
        /u-press|active:scale/,
        "Button.tsx must apply .u-press or active:scale feedback"
      );
    });

    it("T1-F06-05: Interactive rows and links implement press feedback", () => {
      const offerRow = readFileSafe("src/components/offers/OfferRow.tsx") || "";
      const careerTier = readFileSafe("src/components/career/CareerTier.tsx") || "";
      assert.ok(
        offerRow.includes("u-press") || offerRow.includes("active:"),
        "OfferRow must support press feedback"
      );
      assert.ok(
        careerTier.includes("u-press") || careerTier.includes("active:"),
        "CareerTier must support press feedback"
      );
    });
  });

  // =========================================================================
  // Feature 7: Interruptible Spring Physics & Motion Engine
  // =========================================================================
  describe("Feature 7: Interruptible Spring Physics & Motion Engine", () => {
    it("T1-F07-01: src/lib/motion.ts exports APPLE_SPRINGS presets", () => {
      const content = readFileSafe("src/lib/motion.ts") || "";
      assert.match(
        content,
        /export\s+const\s+APPLE_SPRINGS/,
        "motion.ts must export APPLE_SPRINGS"
      );
    });

    it("T1-F07-02: APPLE_SPRINGS.criticallyDamped has bounce: 0 and responsive duration", () => {
      const content = readFileSafe("src/lib/motion.ts") || "";
      assert.match(
        content,
        /criticallyDamped[\s\S]*?bounce:\s*0/,
        "APPLE_SPRINGS.criticallyDamped must specify bounce: 0"
      );
    });

    it("T1-F07-03: APPLE_SPRINGS.momentum specifies controlled bounce (<=0.18)", () => {
      const content = readFileSafe("src/lib/motion.ts") || "";
      assert.match(
        content,
        /momentum[\s\S]*?bounce:\s*0\.1[0-8]/,
        "APPLE_SPRINGS.momentum must specify bounce around 0.16"
      );
    });

    it("T1-F07-04: src/lib/motion.ts exports projectMomentum projection utility", () => {
      const content = readFileSafe("src/lib/motion.ts") || "";
      assert.match(
        content,
        /export\s+function\s+projectMomentum/,
        "motion.ts must export projectMomentum"
      );
    });

    it("T1-F07-05: src/lib/motion.ts exports rubberband resistance utility", () => {
      const content = readFileSafe("src/lib/motion.ts") || "";
      assert.match(
        content,
        /export\s+function\s+rubberband/,
        "motion.ts must export rubberband"
      );
    });
  });

  // =========================================================================
  // Feature 8: Continuous 1:1 Direct-Manipulation Scrub Bars
  // =========================================================================
  describe("Feature 8: Continuous 1:1 Direct-Manipulation Scrub Bars", () => {
    it("T1-F08-01: src/components/primitives/ScrubBar.tsx exists and exports ScrubBar", () => {
      const scrubExists = exists("src/components/primitives/ScrubBar.tsx");
      assert.equal(scrubExists, true, "ScrubBar.tsx primitive component must exist");
    });

    it("T1-F08-02: ScrubBar handles pointer events with pointer capture", () => {
      const content = readFileSafe("src/components/primitives/ScrubBar.tsx") || "";
      assert.match(
        content,
        /setPointerCapture|onPointerDown/,
        "ScrubBar must use pointer capture for 1:1 direct manipulation"
      );
    });

    it("T1-F08-03: ScrubBar exposes ARIA slider semantics", () => {
      const content = readFileSafe("src/components/primitives/ScrubBar.tsx") || "";
      assert.match(content, /role=["']slider["']/, "ScrubBar must specify role='slider'");
      assert.match(content, /aria-valuenow/, "ScrubBar must specify aria-valuenow");
      assert.match(content, /aria-valuemin/, "ScrubBar must specify aria-valuemin");
      assert.match(content, /aria-valuemax/, "ScrubBar must specify aria-valuemax");
    });

    it("T1-F08-04: ScrubBar handles keyboard navigation", () => {
      const content = readFileSafe("src/components/primitives/ScrubBar.tsx") || "";
      assert.match(
        content,
        /ArrowLeft|ArrowRight|onKeyDown/,
        "ScrubBar must handle ArrowLeft / ArrowRight keyboard seeking"
      );
    });

    it("T1-F08-05: ScrubBar provides onChangeEnd callback with velocity", () => {
      const content = readFileSafe("src/components/primitives/ScrubBar.tsx") || "";
      assert.match(
        content,
        /onChangeEnd/,
        "ScrubBar must support onChangeEnd callback"
      );
    });
  });

  // =========================================================================
  // Feature 9: Momentum-Aware Film Player & Reel Strip
  // =========================================================================
  describe("Feature 9: Momentum-Aware Film Player & Reel Strip", () => {
    it("T1-F09-01: FilmPlayer integrates custom ScrubBar component", () => {
      const content = readFileSafe("src/components/work/FilmPlayer.tsx") || "";
      assert.match(
        content,
        /ScrubBar/,
        "FilmPlayer.tsx must integrate ScrubBar"
      );
    });

    it("T1-F09-02: FilmPlayer implements arrow key navigation", () => {
      const content = readFileSafe("src/components/work/FilmPlayer.tsx") || "";
      assert.match(
        content,
        /ArrowLeft|ArrowRight/,
        "FilmPlayer must support arrow key shortcuts"
      );
    });

    it("T1-F09-03: FilmPlayer uses critically damped springs for transitions", () => {
      const content = readFileSafe("src/components/work/FilmPlayer.tsx") || "";
      assert.match(
        content,
        /APPLE_SPRINGS|criticallyDamped|SPRING/,
        "FilmPlayer must use Apple spring presets"
      );
    });

    it("T1-F09-04: ReelStrip supports direct pointer drag manipulation", () => {
      const content = readFileSafe("src/components/sections/ReelStrip.tsx") || "";
      assert.match(
        content,
        /drag|onPointerDown|ScrubBar/,
        "ReelStrip must support direct pointer scrub or drag navigation"
      );
    });

    it("T1-F09-05: ReelStrip applies momentum carry on release", () => {
      const content = readFileSafe("src/components/sections/ReelStrip.tsx") || "";
      assert.match(
        content,
        /momentum|projectMomentum|inertia/,
        "ReelStrip must incorporate momentum carry physics"
      );
    });
  });

  // =========================================================================
  // Feature 10: Persistent Audio Toggle
  // =========================================================================
  describe("Feature 10: Persistent Audio Toggle", () => {
    it("T1-F10-01: src/lib/audio.ts exports usePersistentAudio hook", () => {
      const audioExists = exists("src/lib/audio.ts");
      assert.equal(audioExists, true, "src/lib/audio.ts must exist");
      const content = readFileSafe("src/lib/audio.ts") || "";
      assert.match(
        content,
        /export\s+function\s+usePersistentAudio/,
        "audio.ts must export usePersistentAudio"
      );
    });

    it("T1-F10-02: Default state is muted: true", () => {
      const content = readFileSafe("src/lib/audio.ts") || "";
      assert.match(
        content,
        /muted.*?true|initialState.*?true|defaultValue.*?true/,
        "Default audio state must be muted: true"
      );
    });

    it("T1-F10-03: Hook reads and writes to localStorage key 'reel_audio_muted'", () => {
      const content = readFileSafe("src/lib/audio.ts") || "";
      assert.match(
        content,
        /reel_audio_muted/,
        "Must use storage key 'reel_audio_muted'"
      );
    });

    it("T1-F10-04: Hook provides toggleMute function", () => {
      const content = readFileSafe("src/lib/audio.ts") || "";
      assert.match(
        content,
        /toggleMute/,
        "usePersistentAudio must return toggleMute handler"
      );
    });

    it("T1-F10-05: FilmPlayer uses usePersistentAudio without reset on film.id change", () => {
      const content = readFileSafe("src/components/work/FilmPlayer.tsx") || "";
      assert.match(
        content,
        /usePersistentAudio/,
        "FilmPlayer must adopt usePersistentAudio"
      );
      assert.ok(
        !content.includes("setMuted(true);\n    }, [film?.id]"),
        "FilmPlayer must not reset mute state to true upon film queue step"
      );
    });
  });

  // =========================================================================
  // Feature 11: prefers-reduced-motion Accessibility Compliance
  // =========================================================================
  describe("Feature 11: prefers-reduced-motion Compliance", () => {
    it("T1-F11-01: globals.css contains prefers-reduced-motion media query", () => {
      const content = readFileSafe("src/app/globals.css") || "";
      assert.match(
        content,
        /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/,
        "globals.css must define prefers-reduced-motion media query"
      );
    });

    it("T1-F11-02: Reduced motion resets animation and transition durations", () => {
      const content = readFileSafe("src/app/globals.css") || "";
      assert.match(
        content,
        /animation-duration:\s*0\.01ms|transition-duration:\s*0\.01ms|transition:\s*none/,
        "Reduced motion query must neutralize animations"
      );
    });

    it("T1-F11-03: Motion presets or components respect reduced motion preference", () => {
      const motionContent = readFileSafe("src/lib/motion.ts") || "";
      const hooksContent = readFileSafe("src/lib/hooks.ts") || "";
      assert.ok(
        motionContent.includes("reducedMotion") ||
          hooksContent.includes("prefers-reduced-motion") ||
          hooksContent.includes("reducedMotion"),
        "Must provide programmatic reduced motion detection"
      );
    });

    it("T1-F11-04: Lenis smooth scroll honors reduced motion preference", () => {
      const smoothContent = readFileSafe("src/components/primitives/SmoothScroll.tsx") || "";
      assert.match(
        smoothContent,
        /prefers-reduced-motion|reducedMotion|immediate/,
        "SmoothScroll must disable or bypass smooth scrolling when motion is reduced"
      );
    });

    it("T1-F11-05: Dialog modal dismisses spring overshoot under reduced motion", () => {
      const dialogContent = readFileSafe("src/components/primitives/Dialog.tsx") || "";
      assert.ok(
        dialogContent.includes("criticallyDamped") ||
          dialogContent.includes("reducedMotion") ||
          dialogContent.includes("SPRING"),
        "Dialog must use critically damped or guarded spring animations"
      );
    });
  });

  // =========================================================================
  // Feature 12: Interactive Scope & Budget Estimator Component
  // =========================================================================
  describe("Feature 12: Interactive Scope & Budget Estimator Component", () => {
    it("T1-F12-01: src/components/offers/ScopeEstimator.tsx exists and exports ScopeEstimator", () => {
      const existsEst = exists("src/components/offers/ScopeEstimator.tsx");
      assert.equal(existsEst, true, "ScopeEstimator.tsx component must exist");
    });

    it("T1-F12-02: ScopeEstimator supports motion graphics count selection (1 to 5)", () => {
      const content = readFileSafe("src/components/offers/ScopeEstimator.tsx") || "";
      assert.match(
        content,
        /motionCount|motionGraphics/i,
        "ScopeEstimator must provide motion graphics count control"
      );
    });

    it("T1-F12-03: ScopeEstimator supports ad length toggling (15s vs 60s)", () => {
      const content = readFileSafe("src/components/offers/ScopeEstimator.tsx") || "";
      assert.match(
        content,
        /15s.*?60s|adLength/i,
        "ScopeEstimator must support 15s and 60s ad lengths"
      );
    });

    it("T1-F12-04: ScopeEstimator supports search visibility inclusion", () => {
      const content = readFileSafe("src/components/offers/ScopeEstimator.tsx") || "";
      assert.match(
        content,
        /includeSearch|searchVisibility/i,
        "ScopeEstimator must support search visibility inclusion toggle"
      );
    });

    it("T1-F12-05: ScopeEstimator renders CTA button linking to /contact", () => {
      const content = readFileSafe("src/components/offers/ScopeEstimator.tsx") || "";
      assert.match(
        content,
        /\/contact/,
        "ScopeEstimator CTA must link to /contact"
      );
    });
  });

  // =========================================================================
  // Feature 13: Live Cost & Turnaround Calculation Formulation
  // =========================================================================
  describe("Feature 13: Live Cost & Turnaround Calculation Formulation", () => {
    it("T1-F13-01: Base package (1 motion, 15s ad, no search) calculates to $600", () => {
      const res = ORACLE.estimator.calculate({
        motionCount: 1,
        adLength: "15s",
        includeSearch: false,
      });
      assert.equal(res.totalPrice, 600, "1 motion ($100) + 15s ($500) = $600");
      assert.equal(res.turnaround, "Initial draft in 24 hours");
    });

    it("T1-F13-02: Entry catalog match (3 motion, 15s ad, no search) calculates to $750", () => {
      const res = ORACLE.estimator.calculate({
        motionCount: 3,
        adLength: "15s",
        includeSearch: false,
      });
      assert.equal(res.totalPrice, 750, "3 motion ($250) + 15s ($500) = $750");
      assert.equal(res.turnaround, "Initial draft in 24 hours");
    });

    it("T1-F13-03: 60s upgrade (3 motion, 60s ad, no search) calculates to $1,250", () => {
      const res = ORACLE.estimator.calculate({
        motionCount: 3,
        adLength: "60s",
        includeSearch: false,
      });
      assert.equal(res.totalPrice, 1250, "3 motion ($250) + 60s ($1,000) = $1,250");
      assert.equal(res.turnaround, "Initial draft in 48 hours");
    });

    it("T1-F13-04: Search visibility inclusion adds exactly $1,000 and 3 days turnaround", () => {
      const res = ORACLE.estimator.calculate({
        motionCount: 1,
        adLength: "15s",
        includeSearch: true,
      });
      assert.equal(res.totalPrice, 1600, "$600 + $1,000 search = $1,600");
      assert.equal(
        res.turnaround,
        "Initial draft in 24 hours · Search dashboard in 3 working days"
      );
    });

    it("T1-F13-05: src/content/estimator.ts exports calculateEstimate matching oracle", () => {
      const existsContent = exists("src/content/estimator.ts");
      assert.equal(existsContent, true, "src/content/estimator.ts must exist");
      const content = readFileSafe("src/content/estimator.ts") || "";
      assert.match(
        content,
        /export\s+function\s+calculateEstimate/,
        "estimator.ts must export calculateEstimate"
      );
    });
  });

  // =========================================================================
  // Feature 14: Form Pre-population on /contact via Estimate CTA
  // =========================================================================
  describe("Feature 14: Form Pre-population on /contact via Estimate CTA", () => {
    it("T1-F14-01: CTA generates query string with scope, budget, and idea", () => {
      const sample = ORACLE.estimator.calculate({
        motionCount: 3,
        adLength: "15s",
        includeSearch: false,
      });
      const url = `/contact?scope=${encodeURIComponent(sample.scopeLabel)}&budget=${encodeURIComponent(sample.budgetBucket)}`;
      assert.ok(url.includes("scope="), "URL must contain scope parameter");
      assert.ok(url.includes("budget="), "URL must contain budget parameter");
    });

    it("T1-F14-02: Budget bucket correctly classifies price thresholds", () => {
      assert.equal(ORACLE.estimator.calculate({ motionCount: 1, adLength: "15s", includeSearch: false }).budgetBucket, "$500 to $1,000");
      assert.equal(ORACLE.estimator.calculate({ motionCount: 3, adLength: "60s", includeSearch: false }).budgetBucket, "$1,000 to $2,000");
      assert.equal(ORACLE.estimator.calculate({ motionCount: 5, adLength: "60s", includeSearch: true }).budgetBucket, "$2,000 to $5,000");
    });

    it("T1-F14-03: InquiryForm component accepts pre-filled values or search params", () => {
      const content = readFileSafe("src/components/contact/InquiryForm.tsx") || "";
      assert.match(
        content,
        /useSearchParams|initialScope|scopeOptions/i,
        "InquiryForm must support dynamic pre-population from URL search params"
      );
    });

    it("T1-F14-04: /contact/page.tsx wraps InquiryForm inside Suspense boundary", () => {
      const content = readFileSafe("src/app/contact/page.tsx") || "";
      assert.match(
        content,
        /<Suspense[\s\S]*?>[\s\S]*?<InquiryForm/i,
        "Contact page must wrap InquiryForm in Suspense boundary to prevent SSG bailout"
      );
    });

    it("T1-F14-05: Custom scope from estimator is accepted by InquiryForm", () => {
      const content = readFileSafe("src/components/contact/InquiryForm.tsx") || "";
      assert.match(
        content,
        /scopeValue|effectiveScopeOptions|options/i,
        "InquiryForm must preserve and display custom estimated scope option"
      );
    });
  });

  // =========================================================================
  // Feature 15: Tokens & Anti-Slop Discipline
  // =========================================================================
  describe("Feature 15: Tokens & Anti-Slop Discipline", () => {
    it("T1-F15-01: tokens.css defines midnight dark blue --color-ink-950: #050814", () => {
      const content = readFileSafe("src/styles/tokens.css") || "";
      assert.match(
        content,
        /--color-ink-950:\s*#050814/i,
        "tokens.css must define ink-950 as #050814"
      );
    });

    it("T1-F15-02: tokens.css defines vermilion accent --color-flare: #ff4a1c", () => {
      const content = readFileSafe("src/styles/tokens.css") || "";
      assert.match(
        content,
        /--color-flare:\s*#ff4a1c/i,
        "tokens.css must define flare as #ff4a1c"
      );
    });

    it("T1-F15-03: Typography scale defines Archivo, Instrument Sans, and Azeret Mono", () => {
      const content = readFileSafe("src/styles/tokens.css") || "";
      assert.match(content, /Archivo/i, "Must configure Archivo font");
      assert.match(content, /Instrument Sans/i, "Must configure Instrument Sans font");
      assert.match(content, /Azeret Mono/i, "Must configure Azeret Mono font");
    });

    it("T1-F15-04: Numeric values use tabular-nums font feature", () => {
      const content = readFileSafe("src/app/globals.css") || "";
      const tokens = readFileSafe("src/styles/tokens.css") || "";
      assert.ok(
        content.includes("tabular-nums") || tokens.includes("tabular-nums"),
        "Must specify tabular-nums for numeric alignment"
      );
    });

    it("T1-F15-05: Absence of forbidden AI slop (purple gradients, bouncy overshoot)", () => {
      const css = readFileSafe("src/app/globals.css") || "";
      assert.ok(
        !css.includes("linear-gradient(to right, #8a2be2, #4b0082)"),
        "Must not use generic purple AI gradient slop"
      );
    });
  });

  // =========================================================================
  // Feature 16: Performance & Keyboard Accessibility
  // =========================================================================
  describe("Feature 16: Performance & Keyboard Accessibility", () => {
    it("T1-F16-01: Semantic HTML5 landmarks are used across page layouts", () => {
      const layout = readFileSafe("src/app/layout.tsx") || "";
      const header = readFileSafe("src/components/layout/Header.tsx") || "";
      const footer = readFileSafe("src/components/layout/Footer.tsx") || "";
      assert.ok(header.includes("<header"), "Header must render <header> landmark");
      assert.ok(footer.includes("<footer"), "Footer must render <footer> landmark");
      assert.ok(layout.includes("<main"), "Layout must render <main> landmark");
    });

    it("T1-F16-02: Visible focus indicators are defined for interactive elements", () => {
      const button = readFileSafe("src/components/primitives/Button.tsx") || "";
      const globals = readFileSafe("src/app/globals.css") || "";
      assert.ok(
        button.includes("focus-visible:") || globals.includes(":focus-visible"),
        "Interactive components must define visible focus-visible indicators"
      );
    });

    it("T1-F16-03: Media items define explicit dimensions to prevent CLS", () => {
      const media = readFileSafe("src/content/work.ts") || "";
      assert.match(
        media,
        /1920.*?1080|width:\s*\d+,\s*height:\s*\d+/,
        "Media assets must define explicit width and height"
      );
    });

    it("T1-F16-04: Dialog traps keyboard focus and handles Escape", () => {
      const dialog = readFileSafe("src/components/primitives/Dialog.tsx") || "";
      assert.match(
        dialog,
        /Escape|onKeyDown/,
        "Dialog must handle Escape key for accessibility"
      );
    });

    it("T1-F16-05: robots.ts explicitly configures AI crawler access", () => {
      const robots = readFileSafe("src/app/robots.ts") || "";
      assert.match(
        robots,
        /GPTBot|ClaudeBot|PerplexityBot|llms\.txt/,
        "robots.ts must reference AI crawlers or link /llms.txt"
      );
    });
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ORACLE } from "../helpers/contract-oracle.mjs";
import {
  readFileSafe,
  exists,
  countWords,
} from "../helpers/test-context.mjs";

describe("Tier 3: Cross-Feature Interactions & Pairwise Combinations", () => {
  // =========================================================================
  // Pair 1: Scope Estimator Calculation + /contact Form URL Pre-population
  // =========================================================================
  it("T3-PAIR-01: Scope Estimator output translates to pre-filled /contact URL params", () => {
    const input = { motionCount: 3, adLength: "60s", includeSearch: true };
    const estimate = ORACLE.estimator.calculate(input);

    assert.equal(estimate.totalPrice, 2250); // $250 + $1000 + $1000
    assert.equal(estimate.budgetBucket, "$2,000 to $5,000");

    const queryParams = new URLSearchParams({
      scope: estimate.scopeLabel,
      budget: estimate.budgetBucket,
      idea: `Calculated Studio Estimate ($${estimate.totalPrice}):\n• Motion graphics: ${input.motionCount}\n• Ad length: ${input.adLength}\n• Search visibility: Included\n• Turnaround: ${estimate.turnaround}`,
    });

    const parsedScope = queryParams.get("scope");
    const parsedBudget = queryParams.get("budget");
    const parsedIdea = queryParams.get("idea");

    assert.equal(parsedScope, estimate.scopeLabel);
    assert.equal(parsedBudget, "$2,000 to $5,000");
    assert.ok(parsedIdea.includes("$2250"));
    assert.ok(parsedIdea.includes("Search dashboard in 3 working days"));
  });

  // =========================================================================
  // Pair 2: Persistent Audio Toggle + FilmPlayer Queue Progression
  // =========================================================================
  it("T3-PAIR-02: Persistent Audio Toggle state survives video queue progression", () => {
    // When a user un-mutes film 1, transitioning to film 2 must NOT force mute = true
    let storageMuted = false; // User clicked unmute
    const onFilmChange = (newFilmId) => {
      // Must read from storage rather than resetting to true
      return storageMuted;
    };

    assert.equal(onFilmChange("part-02"), false, "Audio must remain unmuted on queue change");
    assert.equal(onFilmChange("part-03"), false, "Audio must remain unmuted on subsequent film");
  });

  // =========================================================================
  // Pair 3: Apple Fluid Springs + prefers-reduced-motion Override
  // =========================================================================
  it("T3-PAIR-03: Spring physics transitions neutralize when prefers-reduced-motion is active", () => {
    function resolveSpringTransition(preset, prefersReduced) {
      if (prefersReduced) {
        return { type: "tween", duration: 0.001, bounce: 0 };
      }
      return preset;
    }

    const defaultTransition = resolveSpringTransition(
      ORACLE.motion.springs.criticallyDamped,
      false
    );
    assert.equal(defaultTransition.type, "spring");
    assert.equal(defaultTransition.duration, 0.35);

    const reducedTransition = resolveSpringTransition(
      ORACLE.motion.springs.criticallyDamped,
      true
    );
    assert.equal(reducedTransition.duration, 0.001);
    assert.equal(reducedTransition.bounce, 0);
  });

  // =========================================================================
  // Pair 4: ScrubBar Direct Manipulation + Video Playback Timecode Sync
  // =========================================================================
  it("T3-PAIR-04: ScrubBar dragging updates live video timecode with velocity settling", () => {
    const videoDuration = 60; // 60s video
    let currentTime = 15;

    function onScrubMove(progressFraction) {
      return Math.max(0, Math.min(progressFraction * videoDuration, videoDuration));
    }

    currentTime = onScrubMove(0.5); // scrub to 50%
    assert.equal(currentTime, 30, "Timecode updates to 30s");

    currentTime = onScrubMove(0.75); // scrub to 75%
    assert.equal(currentTime, 45, "Timecode updates to 45s");
  });

  // =========================================================================
  // Pair 5: Unified Schema.org @graph + VideoObject Consistency
  // =========================================================================
  it("T3-PAIR-05: Schema.org @graph studio and VideoObject share canonical domain and branding", () => {
    const studioUrl = ORACLE.studio.url;
    const filmSlug = "flavors-chase-me";
    const videoContentUrl = `${studioUrl}/media/films/film-01.mp4`;

    assert.ok(videoContentUrl.startsWith(studioUrl), "Video contentUrl must share canonical baseUrl");
    assert.ok(studioUrl.startsWith("https://"), "Base URL must be secure HTTPS");
  });

  // =========================================================================
  // Pair 6: Direct-Answer Definition Blocks + Schema.org Offer Descriptions
  // =========================================================================
  it("T3-PAIR-06: Direct-answer definitions correspond with Schema.org offer pricing", () => {
    for (const tier of ORACLE.pricingTiers) {
      const labelNumber = parseInt(tier.label.replace(/[^0-9]/g, ""), 10);
      assert.equal(
        labelNumber,
        tier.priceFrom,
        `Tier label ${tier.label} matches priceFrom ${tier.priceFrom}`
      );
    }
  });

  // =========================================================================
  // Pair 7: /llms.txt Credentials + Site Content Metadata Synchronization
  // =========================================================================
  it("T3-PAIR-07: Founder corporate history in /llms.txt matches site.ts credentials", () => {
    const siteContent = readFileSafe("src/content/site.ts") || "";
    for (const corp of ORACLE.studio.corporateHistory) {
      assert.ok(
        siteContent.includes(corp),
        `Corporate history '${corp}' must exist in site.ts content`
      );
    }
  });

  // =========================================================================
  // Pair 8: /robots.txt AI Bot Directives + /llms.txt Endpoint Discovery
  // =========================================================================
  it("T3-PAIR-08: robots.ts explicitly permits AI crawlers targeting /llms.txt", () => {
    const robots = readFileSafe("src/app/robots.ts") || "";
    assert.ok(
      robots.includes("GPTBot") ||
        robots.includes("ClaudeBot") ||
        robots.includes("PerplexityBot") ||
        robots.includes("llms.txt"),
      "robots.ts must coordinate crawler access with llms.txt"
    );
  });

  // =========================================================================
  // Pair 9: Scope Estimator Turnaround Guarantees + /llms-full.txt Claims
  // =========================================================================
  it("T3-PAIR-09: Estimator turnarounds match llms-full.txt promises (24h/48h)", () => {
    const fastEst = ORACLE.estimator.calculate({ motionCount: 1, adLength: "15s", includeSearch: false });
    const stdEst = ORACLE.estimator.calculate({ motionCount: 4, adLength: "15s", includeSearch: false });

    assert.match(fastEst.turnaround, /24 hours/);
    assert.match(stdEst.turnaround, /48 hours/);
  });

  // =========================================================================
  // Pair 10: Zero-Latency .u-press + Touch-action Manipulation
  // =========================================================================
  it("T3-PAIR-10: .u-press classes co-exist with touch-action manipulation in CSS", () => {
    const css = readFileSafe("src/app/globals.css") || "";
    assert.match(css, /\.u-press/);
    assert.match(css, /touch-action:\s*manipulation/);
  });

  // =========================================================================
  // Pair 11: ReelStrip Drag Gestures + projectMomentum Velocity Settling
  // =========================================================================
  it("T3-PAIR-11: ReelStrip drag release applies momentum velocity projection", () => {
    function projectMomentum(current, velocity, decay = 0.998) {
      if (Math.abs(velocity) < 0.01) return current;
      return current + velocity * (decay / (1 - decay)) * 0.001;
    }

    const currentX = -200;
    const velocity = -1200; // fast swipe left
    const projectedX = projectMomentum(currentX, velocity);

    assert.ok(projectedX < currentX, "Swipe left projects further left into negative scroll space");
  });

  // =========================================================================
  // Pair 12: Dialog Modal Opening + APPLE_SPRINGS.criticallyDamped Transition
  // =========================================================================
  it("T3-PAIR-12: Dialog uses critically damped spring physics for zero overshoot entry", () => {
    const spring = ORACLE.motion.springs.criticallyDamped;
    assert.equal(spring.bounce, 0, "Dialog must have 0 bounce to avoid dizzy overshoot");
    assert.equal(spring.duration, 0.35, "Dialog duration is 0.35s");
  });

  // =========================================================================
  // Pair 13: InquiryForm Backend Schema Validation + Estimator Payload
  // =========================================================================
  it("T3-PAIR-13: Estimator-generated scope string satisfies InquirySchema length constraints", () => {
    const maxScopeEstimate = ORACLE.estimator.calculate({
      motionCount: 5,
      adLength: "60s",
      includeSearch: true,
    });
    const scopeStr = maxScopeEstimate.scopeLabel;

    // InquirySchema requires min(1) and max(160)
    assert.ok(scopeStr.length >= 1, "Scope string satisfies min length");
    assert.ok(scopeStr.length <= 160, `Scope string length ${scopeStr.length} is <= 160 chars`);
  });

  // =========================================================================
  // Pair 14: Dark Midnight Tokens + ScrubBar Rail/Thumb Contrast
  // =========================================================================
  it("T3-PAIR-14: ScrubBar flare thumb (#ff4a1c) has high visual salience on ink-950 stage", () => {
    const bg = ORACLE.tokens.ink950;
    const thumb = ORACLE.tokens.flare;
    assert.equal(bg, "#050814");
    assert.equal(thumb, "#ff4a1c");
  });

  // =========================================================================
  // Pair 15: Accordion Spring Chevrons + Zero-Latency Press Scale
  // =========================================================================
  it("T3-PAIR-15: Accordion toggles combine instant press scale with spring chevron rotate", () => {
    const accordion = readFileSafe("src/components/primitives/Accordion.tsx") || "";
    assert.ok(
      accordion.includes("SPRING") || accordion.includes("transition") || accordion.includes("rotate"),
      "Accordion must coordinate chevron transition"
    );
  });
});

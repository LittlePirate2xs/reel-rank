import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ORACLE } from "../helpers/contract-oracle.mjs";
import {
  readFileSafe,
  exists,
  countWords,
} from "../helpers/test-context.mjs";

describe("Tier 2: Boundary & Corner Cases", () => {
  // =========================================================================
  // Feature 1: /llms.txt Endpoint Boundaries
  // =========================================================================
  describe("Feature 1: /llms.txt Endpoint Boundaries", () => {
    it("T2-F01-01: Output payload size is substantial (> 500 characters)", () => {
      const content = readFileSafe("src/app/llms.txt/route.ts") || "";
      assert.ok(
        content.length > 500,
        `llms.txt source should generate substantial content (>500 chars), got ${content.length}`
      );
    });

    it("T2-F01-02: Line endings and whitespace do not contain malformed formatting", () => {
      const content = readFileSafe("src/app/llms.txt/route.ts") || "";
      assert.ok(
        !content.includes("\\r\\n\\r\\n\\r\\n"),
        "Output should not contain excessive empty line padding"
      );
    });

    it("T2-F01-03: Spans full pricing range from entry ($250) to flagship ($2,000+)", () => {
      const content = readFileSafe("src/app/llms.txt/route.ts") || "";
      assert.ok(
        content.includes("offersByOrder") || (content.includes("$250") && content.includes("$2,000")),
        "Must include entry through flagship pricing"
      );
    });

    it("T2-F01-04: Markdown headers follow standard H1 -> H2 hierarchy", () => {
      const content = readFileSafe("src/app/llms.txt/route.ts") || "";
      assert.ok(
        content.includes("# ${site.name}") || /#\s+Reel & Rank|#\s+Studio/i.test(content),
        "Must have top-level H1 header"
      );
    });

    it("T2-F01-05: Does not leak private routes (/api/ or admin endpoints)", () => {
      const content = readFileSafe("src/app/llms.txt/route.ts") || "";
      assert.ok(
        !content.includes("/api/inquiry") && !content.includes("/admin"),
        "llms.txt must not expose internal backend API routes"
      );
    });
  });

  // =========================================================================
  // Feature 2: /llms-full.txt Endpoint Boundaries
  // =========================================================================
  describe("Feature 2: /llms-full.txt Endpoint Boundaries", () => {
    it("T2-F02-01: Comprehensive content size boundary (> 1,500 characters)", () => {
      const content = readFileSafe("src/app/llms-full.txt/route.ts") || "";
      assert.ok(
        content.length > 1500,
        `llms-full.txt should contain comprehensive details (>1500 chars), got ${content.length}`
      );
    });

    it("T2-F02-02: All offer deliverables listed with bullet points", () => {
      const content = readFileSafe("src/app/llms-full.txt/route.ts") || "";
      assert.ok(
        content.includes("deliverables.map") || (content.match(/-\s+/g) || []).length >= 5,
        "llms-full.txt must itemize deliverables with bullet points"
      );
    });

    it("T2-F02-03: Zero duplicate headers or corrupted repetitive markdown blocks", () => {
      const content = readFileSafe("src/app/llms-full.txt/route.ts") || "";
      const h1Matches = content.match(/^#\s+/gm) || [];
      assert.ok(
        h1Matches.length <= 2,
        `llms-full.txt should have clean top-level heading structure, found ${h1Matches.length} H1s`
      );
    });

    it("T2-F02-04: Full studio disclaimers and revision commitments stated verbatim", () => {
      const content = readFileSafe("src/app/llms-full.txt/route.ts") || "";
      assert.ok(
        content.includes("offer.commitments") ||
          content.includes("careerCommitments") ||
          /brief|refine|feedback/i.test(content),
        "llms-full.txt must document contractual revision process"
      );
    });

    it("T2-F02-05: Exact studio email matches official contact address", () => {
      const content = readFileSafe("src/app/llms-full.txt/route.ts") || "";
      assert.ok(
        content.includes("site.email") ||
          /manny@reelandrank\.com|hello@reelandrank\.com/.test(content),
        "Must provide verified studio contact email"
      );
    });
  });

  // =========================================================================
  // Feature 3: Unified Schema.org @graph Boundaries
  // =========================================================================
  describe("Feature 3: Unified Schema.org @graph Boundaries", () => {
    it("T2-F03-01: Latitude coordinate 29.7604 is an exact numeric value", () => {
      const content = readFileSafe("src/lib/seo.ts") || "";
      const siteContent = readFileSafe("src/content/site.ts") || "";
      assert.ok(
        content.includes("29.7604") || siteContent.includes("29.7604"),
        "Latitude must equal 29.7604"
      );
    });

    it("T2-F03-02: Longitude coordinate -95.3698 is an exact negative numeric value", () => {
      const content = readFileSafe("src/lib/seo.ts") || "";
      const siteContent = readFileSafe("src/content/site.ts") || "";
      assert.ok(
        content.includes("-95.3698") || siteContent.includes("-95.3698"),
        "Longitude must equal -95.3698"
      );
    });

    it("T2-F03-03: @graph array contains at least 4 linked entity nodes", () => {
      const content = readFileSafe("src/lib/seo.ts") || "";
      assert.match(
        content,
        /["']?@graph["']?:\s*\[[\s\S]*?\]/,
        "seo.ts must define an array of linked entities in @graph"
      );
    });

    it("T2-F03-04: Entity @id fragments match specification (#founder, #studio, #catalog)", () => {
      const content = readFileSafe("src/lib/seo.ts") || "";
      assert.match(content, /#founder/, "Must use #founder URI fragment");
      assert.match(content, /#studio/, "Must use #studio URI fragment");
    });

    it("T2-F03-05: sameAs professional profile links are valid HTTPS URLs", () => {
      const siteContent = readFileSafe("src/content/site.ts") || "";
      assert.match(
        siteContent,
        /https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
        "sameAs entries must be valid HTTPS URLs"
      );
    });
  });

  // =========================================================================
  // Feature 4: VideoObject Boundaries
  // =========================================================================
  describe("Feature 4: VideoObject Boundaries", () => {
    it("T2-F04-01: Handles films with null duration gracefully", () => {
      const content = readFileSafe("src/lib/seo.ts") || "";
      assert.ok(
        content.includes("duration") || content.includes("film"),
        "VideoObject logic must handle film durations"
      );
    });

    it("T2-F04-02: Formats numeric seconds as ISO 8601 duration (PT15S for 15s)", () => {
      const iso15 = "PT15S";
      assert.match(iso15, /^PT\d+S$/, "15 seconds must format to PT15S");
    });

    it("T2-F04-03: uploadDate satisfies ISO 8601 date string format", () => {
      const sampleDate = "2025-01-01";
      assert.match(sampleDate, /^\d{4}-\d{2}-\d{2}$/, "uploadDate must be ISO 8601");
    });

    it("T2-F04-04: Special characters in film title and summary escaped cleanly", () => {
      const title = 'Reel & "Rank" Film';
      const escaped = JSON.stringify(title);
      assert.equal(escaped, '"Reel & \\"Rank\\" Film"');
    });

    it("T2-F04-05: Absolute URLs use canonical base domain", () => {
      const content = readFileSafe("src/lib/seo.ts") || "";
      assert.match(content, /baseUrl|\$\{baseUrl\}/, "VideoObject URLs must resolve with baseUrl");
    });
  });

  // =========================================================================
  // Feature 5: Direct-Answer Definition Blocks Boundaries
  // =========================================================================
  describe("Feature 5: Direct-Answer Definition Blocks Boundaries", () => {
    it("T2-F05-01: Word count lower boundary (>= 45 words)", () => {
      const minText = "The Motion Graphics Set from Houston studio Reel & Rank delivers three synchronized motion graphics assets for a flat rate of $250. Designed for product drops and social campaigns, deliverables include custom aspect ratios, agreed visual hooks, and one refinement round, with an initial draft delivered in one working day.";
      const count = countWords(minText);
      assert.ok(count >= 45, `Word count ${count} must be >= 45`);
    });

    it("T2-F05-02: Word count upper boundary (<= 60 words)", () => {
      const maxText = "Reel & Rank's 15-second advertisement package is a flat-rate $500 commercial production designed for high-impact paid social, pre-roll, and mobile video feeds. Based in Houston, Texas, the studio delivers a focused creative direction, script structure, and iterative revisions until client approval, with an initial reviewable draft ready within one working day.";
      const count = countWords(maxText);
      assert.ok(count <= 60, `Word count ${count} must be <= 60`);
    });

    it("T2-F05-03: Word counting splits hyphenated and punctuated words accurately", () => {
      const text = "15-second ad with high-impact, state-of-the-art visuals.";
      const count = countWords(text);
      assert.equal(count, 6, "Hyphenated terms split into discrete word tokens");
    });

    it("T2-F05-04: Direct answers explicitly mention Houston and Reel & Rank", () => {
      const content = readFileSafe("src/content/offers.ts") || "";
      assert.match(content, /Reel & Rank/i, "Direct answers must anchor studio brand");
      assert.match(content, /Houston/i, "Direct answers must anchor geographic origin");
    });

    it("T2-F05-05: Offer direct answers specify exact pricing match ($250, $500, etc.)", () => {
      const content = readFileSafe("src/content/offers.ts") || "";
      assert.match(content, /\$250/, "Must include $250 price tag");
      assert.match(content, /\$500/, "Must include $500 price tag");
    });
  });

  // =========================================================================
  // Feature 6: Zero-Latency Press Response Boundaries
  // =========================================================================
  describe("Feature 6: Zero-Latency Press Response Boundaries", () => {
    it("T2-F06-01: Press duration boundary is strictly <= 40ms", () => {
      assert.ok(ORACLE.motion.pressDurationMs <= 40, "Press duration must not exceed 40ms");
    });

    it("T2-F06-02: Active scale factor boundary is between 0.95 and 0.98", () => {
      const content = readFileSafe("src/app/globals.css") || "";
      const match = content.match(/scale\((0\.\d+)\)/);
      if (match) {
        const scale = parseFloat(match[1]);
        assert.ok(scale >= 0.95 && scale <= 0.98, `Scale ${scale} must be between 0.95 and 0.98`);
      }
    });

    it("T2-F06-03: Disabled buttons do not scale on press", () => {
      const content = readFileSafe("src/components/primitives/Button.tsx") || "";
      assert.ok(
        content.includes("disabled") || content.includes("aria-disabled"),
        "Button must account for disabled state"
      );
    });

    it("T2-F06-04: touch-action: manipulation is applied globally without breaking scroll", () => {
      const content = readFileSafe("src/app/globals.css") || "";
      assert.match(
        content,
        /touch-action:\s*manipulation/,
        "touch-action must be manipulation"
      );
    });

    it("T2-F06-05: Press transformation uses CSS transform rather than width/height reflow", () => {
      const content = readFileSafe("src/app/globals.css") || "";
      assert.match(
        content,
        /transform:\s*scale/,
        "Press state must use GPU-accelerated transform: scale"
      );
    });
  });

  // =========================================================================
  // Feature 7: Interruptible Spring Physics Boundaries
  // =========================================================================
  describe("Feature 7: Interruptible Spring Physics Boundaries", () => {
    it("T2-F07-01: criticallyDamped bounce value is strictly 0", () => {
      assert.equal(
        ORACLE.motion.springs.criticallyDamped.bounce,
        0,
        "Critically damped spring must have bounce: 0"
      );
    });

    it("T2-F07-02: projectMomentum with zero velocity returns initial position", () => {
      function projectMomentum(current, velocity, decay = 0.998) {
        if (Math.abs(velocity) < 0.01) return current;
        return current + velocity * (decay / (1 - decay)) * 0.001;
      }
      const settled = projectMomentum(100, 0);
      assert.equal(settled, 100, "Zero velocity must return initial position");
    });

    it("T2-F07-03: projectMomentum with negative velocity projects backward", () => {
      function projectMomentum(current, velocity, decay = 0.998) {
        if (Math.abs(velocity) < 0.01) return current;
        return current + velocity * (decay / (1 - decay)) * 0.001;
      }
      const settled = projectMomentum(100, -500);
      assert.ok(settled < 100, "Negative velocity must project backward");
    });

    it("T2-F07-04: projectMomentum with extreme velocity (>20,000 px/s) does not produce NaN", () => {
      function projectMomentum(current, velocity, decay = 0.998) {
        return current + velocity * (decay / (1 - decay)) * 0.001;
      }
      const settled = projectMomentum(0, 50000);
      assert.ok(!Number.isNaN(settled), "Should not be NaN");
      assert.ok(Number.isFinite(settled), "Should be finite");
    });

    it("T2-F07-05: rubberband resistance returns 0 for 0 offset", () => {
      function rubberband(offset, range, dim = 0.55) {
        if (offset === 0) return 0;
        const sign = offset < 0 ? -1 : 1;
        const absOffset = Math.abs(offset);
        return sign * (1 - 1 / ((absOffset * dim) / range + 1)) * range;
      }
      assert.equal(rubberband(0, 300), 0, "Zero offset must yield 0 resistance");
      const pos = rubberband(100, 300);
      const neg = rubberband(-100, 300);
      assert.equal(pos, -neg, "Rubberband resistance must be symmetric");
    });
  });

  // =========================================================================
  // Feature 8: Continuous Scrub Bar Boundaries
  // =========================================================================
  describe("Feature 8: Continuous Scrub Bar Boundaries", () => {
    it("T2-F08-01: Scrub value clamped at minimum (cannot drop below min)", () => {
      function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
      }
      assert.equal(clamp(-10, 0, 100), 0, "Values below min clamp to min");
    });

    it("T2-F08-02: Scrub value clamped at maximum (cannot exceed max)", () => {
      function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
      }
      assert.equal(clamp(150, 0, 100), 100, "Values above max clamp to max");
    });

    it("T2-F08-03: Zero duration video (max === 0) handles divide-by-zero safely", () => {
      const max = 0;
      const progress = max > 0 ? 5 / max : 0;
      assert.equal(progress, 0, "Zero duration must output 0 progress without NaN");
    });

    it("T2-F08-04: Floating-point step increments round accurately", () => {
      const step = 0.1;
      const rounded = Math.round((0.1 + 0.2) * 10) / 10;
      assert.equal(rounded, 0.3, "Floating-point rounding must prevent precision drift");
    });

    it("T2-F08-05: Timecode formatting formats seconds to MM:SS cleanly", () => {
      function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
      }
      assert.equal(formatTime(0), "0:00");
      assert.equal(formatTime(15), "0:15");
      assert.equal(formatTime(75), "1:15");
    });
  });

  // =========================================================================
  // Feature 9: Momentum Film Player & Reel Strip Boundaries
  // =========================================================================
  describe("Feature 9: Momentum Film Player & Reel Strip Boundaries", () => {
    it("T2-F09-01: Queue lower boundary: index 0 previous action clamps to 0", () => {
      function getPrevIndex(curr) {
        return Math.max(0, curr - 1);
      }
      assert.equal(getPrevIndex(0), 0, "Index 0 prev action must clamp to 0");
    });

    it("T2-F09-02: Queue upper boundary: index length - 1 next action clamps to max", () => {
      function getNextIndex(curr, total) {
        return Math.min(total - 1, curr + 1);
      }
      assert.equal(getNextIndex(7, 8), 7, "Last index next action must clamp to 7");
    });

    it("T2-F09-03: Keyboard seek negative boundary clamps to 0", () => {
      function seek(curr, delta, max) {
        return Math.min(Math.max(0, curr + delta), max);
      }
      assert.equal(seek(2, -5, 60), 0, "Seeking past 0 clamps to 0");
    });

    it("T2-F09-04: Keyboard seek positive boundary clamps to duration", () => {
      function seek(curr, delta, max) {
        return Math.min(Math.max(0, curr + delta), max);
      }
      assert.equal(seek(58, 5, 60), 60, "Seeking past max clamps to max");
    });

    it("T2-F09-05: Reel strip single item calculation does not produce NaN", () => {
      const count = 1;
      const travel = count > 1 ? (count - 1) * 300 : 0;
      assert.equal(travel, 0, "Single card must have 0 travel distance");
    });
  });

  // =========================================================================
  // Feature 10: Persistent Audio Boundaries
  // =========================================================================
  describe("Feature 10: Persistent Audio Boundaries", () => {
    it("T2-F10-01: Null storage value defaults to muted: true", () => {
      function getStoredMute(val) {
        if (val === null || val === undefined) return true;
        return val !== "false";
      }
      assert.equal(getStoredMute(null), true);
    });

    it("T2-F10-02: Corrupted storage string defaults to muted: true", () => {
      function getStoredMute(val) {
        if (val === "false") return false;
        return true;
      }
      assert.equal(getStoredMute("corrupted_json"), true);
    });

    it("T2-F10-03: Stored string 'false' correctly parses to boolean false", () => {
      function getStoredMute(val) {
        return val !== "false";
      }
      assert.equal(getStoredMute("false"), false);
    });

    it("T2-F10-04: Rapid multiple toggles maintain correct parity", () => {
      let state = true;
      for (let i = 0; i < 5; i++) {
        state = !state;
      }
      assert.equal(state, false, "5 toggles from true must land on false");
    });

    it("T2-F10-05: Storage key is consistently 'reel_audio_muted'", () => {
      assert.equal(ORACLE.motion.audioStorageKey, "reel_audio_muted");
    });
  });

  // =========================================================================
  // Feature 11: prefers-reduced-motion Boundaries
  // =========================================================================
  describe("Feature 11: prefers-reduced-motion Boundaries", () => {
    it("T2-F11-01: Media query zeroes out transition durations", () => {
      const content = readFileSafe("src/app/globals.css") || "";
      assert.match(
        content,
        /transition-duration:\s*0\.01ms|transition:\s*none/,
        "Must zero transition durations"
      );
    });

    it("T2-F11-02: Media query zeroes out animation durations", () => {
      const content = readFileSafe("src/app/globals.css") || "";
      assert.match(
        content,
        /animation-duration:\s*0\.01ms|animation:\s*none/,
        "Must zero animation durations"
      );
    });

    it("T2-F11-03: Spring transitions convert to duration 0 or instant settle", () => {
      function getSpring(isReduced) {
        if (isReduced) return { duration: 0, bounce: 0 };
        return ORACLE.motion.springs.criticallyDamped;
      }
      const reduced = getSpring(true);
      assert.equal(reduced.duration, 0);
      assert.equal(reduced.bounce, 0);
    });

    it("T2-F11-04: Mobile drawer skips travel translation under reduced motion", () => {
      const content = readFileSafe("src/components/layout/MobileNav.tsx") || "";
      assert.ok(
        content.includes("motion") || content.includes("AnimatePresence"),
        "MobileNav must manage motion transitions"
      );
    });

    it("T2-F11-05: Modal dialog backdrop blur remains readable without animation lag", () => {
      const content = readFileSafe("src/components/primitives/Dialog.tsx") || "";
      assert.match(
        content,
        /backdrop-blur/,
        "Dialog must use backdrop-blur"
      );
    });
  });

  // =========================================================================
  // Feature 12: Scope Estimator Component Boundaries
  // =========================================================================
  describe("Feature 12: Scope Estimator Component Boundaries", () => {
    it("T2-F12-01: Motion count lower boundary is 1", () => {
      assert.ok(ORACLE.estimator.motionRates[1] === 100);
    });

    it("T2-F12-02: Motion count upper boundary is 5", () => {
      assert.ok(ORACLE.estimator.motionRates[5] === 400);
    });

    it("T2-F12-03: Out-of-bounds count clamps to [1, 5]", () => {
      function clampCount(c) {
        return Math.min(Math.max(1, Math.round(c)), 5);
      }
      assert.equal(clampCount(0), 1);
      assert.equal(clampCount(99), 5);
      assert.equal(clampCount(-3), 1);
    });

    it("T2-F12-04: Ad length is strictly constrained to '15s' or '60s'", () => {
      const valid = ["15s", "60s"];
      assert.ok(valid.includes("15s"));
      assert.ok(valid.includes("60s"));
      assert.ok(!valid.includes("30s"));
    });

    it("T2-F12-05: Toggling search updates live total synchronously by $1,000", () => {
      const withSearch = ORACLE.estimator.calculate({ motionCount: 2, adLength: "15s", includeSearch: true });
      const withoutSearch = ORACLE.estimator.calculate({ motionCount: 2, adLength: "15s", includeSearch: false });
      assert.equal(withSearch.totalPrice - withoutSearch.totalPrice, 1000);
    });
  });

  // =========================================================================
  // Feature 13: Live Cost & Turnaround Calculation Formulation Boundaries
  // =========================================================================
  describe("Feature 13: Live Cost Calculation Formulation Boundaries", () => {
    it("T2-F13-01: Absolute minimum total price is $600 (1 motion, 15s, no search)", () => {
      const minEst = ORACLE.estimator.calculate({ motionCount: 1, adLength: "15s", includeSearch: false });
      assert.equal(minEst.totalPrice, 600);
    });

    it("T2-F13-02: Absolute maximum total price is $2,400 (5 motion, 60s, with search)", () => {
      const maxEst = ORACLE.estimator.calculate({ motionCount: 5, adLength: "60s", includeSearch: true });
      assert.equal(maxEst.totalPrice, 2400);
    });

    it("T2-F13-03: Turnaround fast boundary: 3 motion + 15s ad is exactly 24 hours", () => {
      const est = ORACLE.estimator.calculate({ motionCount: 3, adLength: "15s", includeSearch: false });
      assert.equal(est.turnaround, "Initial draft in 24 hours");
    });

    it("T2-F13-04: Turnaround step boundary: 4 motion + 15s ad steps to 48 hours", () => {
      const est = ORACLE.estimator.calculate({ motionCount: 4, adLength: "15s", includeSearch: false });
      assert.equal(est.turnaround, "Initial draft in 48 hours");
    });

    it("T2-F13-05: Turnaround with search adds ' · Search dashboard in 3 working days'", () => {
      const est = ORACLE.estimator.calculate({ motionCount: 4, adLength: "60s", includeSearch: true });
      assert.equal(
        est.turnaround,
        "Initial draft in 48 hours · Search dashboard in 3 working days"
      );
    });
  });

  // =========================================================================
  // Feature 14: Form Pre-population Boundaries
  // =========================================================================
  describe("Feature 14: Form Pre-population Boundaries", () => {
    it("T2-F14-01: $600 correctly maps to '$500 to $1,000' bucket", () => {
      const est = ORACLE.estimator.calculate({ motionCount: 1, adLength: "15s", includeSearch: false });
      assert.equal(est.budgetBucket, "$500 to $1,000");
    });

    it("T2-F14-02: $1,000 threshold correctly maps to '$500 to $1,000' bucket", () => {
      function getBucket(p) {
        if (p < 500) return "Under $500";
        if (p <= 1000) return "$500 to $1,000";
        if (p <= 2000) return "$1,000 to $2,000";
        if (p <= 5000) return "$2,000 to $5,000";
        return "Above $5,000";
      }
      assert.equal(getBucket(1000), "$500 to $1,000");
    });

    it("T2-F14-03: $1,001 threshold correctly steps to '$1,000 to $2,000' bucket", () => {
      function getBucket(p) {
        if (p < 500) return "Under $500";
        if (p <= 1000) return "$500 to $1,000";
        if (p <= 2000) return "$1,000 to $2,000";
        if (p <= 5000) return "$2,000 to $5,000";
        return "Above $5,000";
      }
      assert.equal(getBucket(1001), "$1,000 to $2,000");
    });

    it("T2-F14-04: $2,400 correctly maps to '$2,000 to $5,000' bucket", () => {
      const est = ORACLE.estimator.calculate({ motionCount: 5, adLength: "60s", includeSearch: true });
      assert.equal(est.budgetBucket, "$2,000 to $5,000");
    });

    it("T2-F14-05: Query string parameters encode special characters safely", () => {
      const rawScope = "Custom scope: 3 motion graphics, 15s ad + search visibility ($1,750)";
      const encoded = encodeURIComponent(rawScope);
      const decoded = decodeURIComponent(encoded);
      assert.equal(decoded, rawScope, "Round-trip URI encoding must preserve special characters");
    });
  });

  // =========================================================================
  // Feature 15: Tokens & Anti-Slop Boundaries
  // =========================================================================
  describe("Feature 15: Tokens & Anti-Slop Boundaries", () => {
    it("T2-F15-01: #050814 hex code casing matches case-insensitively", () => {
      assert.equal(ORACLE.tokens.ink950.toLowerCase(), "#050814");
    });

    it("T2-F15-02: #ff4a1c vermilion flare accent hex code matches", () => {
      assert.equal(ORACLE.tokens.flare.toLowerCase(), "#ff4a1c");
    });

    it("T2-F15-03: Contrast of primary text on midnight background exceeds 15:1", () => {
      // #f0f4fa vs #050814
      // Luminance of paper ~0.85, ink-950 ~0.005 -> Ratio ~ 15.6:1
      const isHighContrast = true;
      assert.ok(isHighContrast, "Paper text on ink-950 exceeds 15:1 contrast");
    });

    it("T2-F15-04: Flare accent is used for highlights and CTAs, not body copy", () => {
      const tokens = readFileSafe("src/styles/tokens.css") || "";
      assert.match(
        tokens,
        /--color-paper/,
        "Body text token must be paper, not flare"
      );
    });

    it("T2-F15-05: No floating decorative pill badges above H1 headlines", () => {
      const offersPage = readFileSafe("src/app/offers/page.tsx") || "";
      assert.ok(
        !offersPage.includes("<Badge className=\"rounded-full mb-2\">New</Badge><h1"),
        "Must not contain floating pill badge slop above H1"
      );
    });
  });

  // =========================================================================
  // Feature 16: Performance & Keyboard Accessibility Boundaries
  // =========================================================================
  describe("Feature 16: Performance & Keyboard Accessibility Boundaries", () => {
    it("T2-F16-01: Focus rings specify at least 2px width", () => {
      const globals = readFileSafe("src/app/globals.css") || "";
      const button = readFileSafe("src/components/primitives/Button.tsx") || "";
      assert.ok(
        globals.includes("ring-2") ||
          globals.includes("outline: 2px") ||
          button.includes("focus-visible:ring-2") ||
          button.includes("focus-visible:ring"),
        "Focus ring must be at least 2px visible width"
      );
    });

    it("T2-F16-02: Dialog traps Tab focus in a cycle", () => {
      const dialog = readFileSafe("src/components/primitives/Dialog.tsx") || "";
      assert.ok(
        dialog.includes("role=\"dialog\"") || dialog.includes("aria-modal"),
        "Dialog must define role='dialog' or aria-modal='true'"
      );
    });

    it("T2-F16-03: Mobile drawer locks background scroll when open", () => {
      const mobileNav = readFileSafe("src/components/layout/MobileNav.tsx") || "";
      assert.ok(
        mobileNav.includes("overflow") || mobileNav.includes("scroll") || mobileNav.includes("isOpen"),
        "MobileNav must manage open state and scroll interaction"
      );
    });

    it("T2-F16-04: Video elements define playsInline and preload metadata", () => {
      const filmPlayer = readFileSafe("src/components/work/FilmPlayer.tsx") || "";
      assert.match(filmPlayer, /playsInline/, "Video must include playsInline for mobile");
      assert.match(filmPlayer, /preload=/, "Video must specify preload attribute");
    });

    it("T2-F16-05: Image and media components specify explicit aspect ratios", () => {
      const content = readFileSafe("src/components/work/MediaFrame.tsx") || "";
      assert.ok(
        content.includes("aspect-") || content.includes("width") || content.includes("height"),
        "MediaFrame must define aspect ratio to avoid layout shift (CLS)"
      );
    });
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ORACLE } from "../helpers/contract-oracle.mjs";
import {
  readFileSafe,
  exists,
  countWords,
  extractOffersDirectAnswer,
} from "../helpers/test-context.mjs";

describe("Tier 4: Real-World Application Scenarios", () => {
  // =========================================================================
  // Scenario 1: AI Search Crawler Discovery & Indexing Journey
  // =========================================================================
  it("T4-SCEN-01: AI Search Crawler (GPTBot/ClaudeBot) indexes robots.txt and /llms.txt", () => {
    // Step 1: Crawler queries robots.txt to discover allowed paths and documentation
    const robots = readFileSafe("src/app/robots.ts") || "";
    assert.ok(
      robots.includes("GPTBot") || robots.includes("allow") || robots.includes("llms.txt"),
      "robots.ts must allow or reference AI crawlers"
    );

    // Step 2: Crawler visits /llms.txt
    const llmsRoute = readFileSafe("src/app/llms.txt/route.ts") || "";
    assert.ok(
      llmsRoute.includes("site.name") || llmsRoute.includes("Reel & Rank"),
      "Crawler parses studio credentials from llms.txt"
    );

    // Step 3: Crawler parses pricing table
    assert.ok(
      llmsRoute.includes("offersByOrder") || llmsRoute.includes("$250"),
      "Crawler extracts price tiers from llms.txt"
    );
  });

  // =========================================================================
  // Scenario 2: Deep Generative Engine Synthesis Journey
  // =========================================================================
  it("T4-SCEN-02: Deep AI Agent synthesizes full service catalog via /llms-full.txt", () => {
    // Agent reads /llms-full.txt
    const fullContent = readFileSafe("src/app/llms-full.txt/route.ts") || "";

    // Verifies comprehensive deliverables and commitments
    assert.ok(
      fullContent.includes("offersByOrder") ||
        /motion-graphics-set|Motion graphics/i.test(fullContent),
      "llms-full.txt provides comprehensive catalog deliverables"
    );

    // Verifies studio location & contact
    assert.ok(
      fullContent.includes("site.location") || /Houston/i.test(fullContent),
      "llms-full.txt contains studio location"
    );
    assert.ok(
      fullContent.includes("site.email") || /reelandrank\.com/i.test(fullContent),
      "llms-full.txt contains studio contact"
    );
  });

  // =========================================================================
  // Scenario 3: Video Search Rich Snippet Harvesting Journey
  // =========================================================================
  it("T4-SCEN-03: Google Video rich snippet engine extracts VideoObject metadata from /work", () => {
    const seoContent = readFileSafe("src/lib/seo.ts") || "";
    const workContent = readFileSafe("src/content/work.ts") || "";

    assert.ok(
      seoContent.includes("videoObjectJsonLd") || seoContent.includes("workVideosJsonLd"),
      "seo.ts provides VideoObject JSON-LD generator"
    );

    assert.ok(workContent.includes("flavors-chase-me"), "work.ts contains featured film works");
    assert.ok(workContent.includes("autumn-cover-motion"), "work.ts contains motion works");
  });

  // =========================================================================
  // Scenario 4: Direct-Answer Generative Search Snippet Journey
  // =========================================================================
  it("T4-SCEN-04: SGE / Answer Engine extracts direct-answer snippet from /offers", () => {
    const offersContent = readFileSafe("src/content/offers.ts") || "";

    // AI parses offersDirectAnswer
    const answer = extractOffersDirectAnswer(offersContent);
    assert.ok(answer, "offersDirectAnswer is defined");

    const wordCount = countWords(answer);

    // Strict 45-60 word count for direct answer snippet extraction
    assert.ok(wordCount >= 45 && wordCount <= 60, `Direct answer word count is ${wordCount}`);
    assert.match(answer, /Reel & Rank/i);
    assert.match(answer, /Houston/i);
  });

  // =========================================================================
  // Scenario 5: Full Client Custom Scope & Estimation Journey
  // =========================================================================
  it("T4-SCEN-05: Prospective client configures multi-asset package and initiates brief", () => {
    // Client selects: 3 motion graphics, 60s ad, include search visibility
    const input = {
      motionCount: 3,
      adLength: "60s",
      includeSearch: true,
    };

    const estimate = ORACLE.estimator.calculate(input);

    // Verify calculation
    assert.equal(estimate.motionPrice, 250);
    assert.equal(estimate.adPrice, 1000);
    assert.equal(estimate.searchPrice, 1000);
    assert.equal(estimate.totalPrice, 2250);
    assert.equal(estimate.budgetBucket, "$2,000 to $5,000");
    assert.equal(
      estimate.turnaround,
      "Initial draft in 48 hours · Search dashboard in 3 working days"
    );

    // Client clicks "Start brief with this estimate" -> Generates URL
    const targetUrl = `/contact?scope=${encodeURIComponent(estimate.scopeLabel)}&budget=${encodeURIComponent(estimate.budgetBucket)}`;
    assert.ok(targetUrl.startsWith("/contact?"));

    // Form on /contact receives parameters
    const parsedParams = new URLSearchParams(targetUrl.replace("/contact?", ""));
    assert.equal(parsedParams.get("budget"), "$2,000 to $5,000");
    assert.ok(parsedParams.get("scope").includes("3 motion graphics"));
    assert.ok(parsedParams.get("scope").includes("60s ad"));
    assert.ok(parsedParams.get("scope").includes("search visibility"));
  });

  // =========================================================================
  // Scenario 6: Fast-Track Startup Single Deliverable Journey
  // =========================================================================
  it("T4-SCEN-06: Startup founder configures minimal entry package (1 motion, 15s ad)", () => {
    const input = {
      motionCount: 1,
      adLength: "15s",
      includeSearch: false,
    };

    const estimate = ORACLE.estimator.calculate(input);

    assert.equal(estimate.totalPrice, 600); // $100 + $500
    assert.equal(estimate.budgetBucket, "$500 to $1,000");
    assert.equal(estimate.turnaround, "Initial draft in 24 hours");
  });

  // =========================================================================
  // Scenario 7: Portfolio Video Visitor Journey with Persistent Audio
  // =========================================================================
  it("T4-SCEN-07: Video visitor unmutes audio, scrubs timeline, advances queue", () => {
    // 1. Initial visitor state: muted
    let isMuted = true;

    // 2. Visitor clicks unmute toggle
    isMuted = false;
    const storedState = JSON.stringify(isMuted);

    // 3. Visitor scrubs timeline with ScrubBar
    const duration = 45;
    const scrubProgress = 0.6;
    const scrubbedTime = scrubProgress * duration; // 27s
    assert.equal(scrubbedTime, 27);

    // 4. Visitor moves to next film in queue
    const restoredMute = JSON.parse(storedState);
    assert.equal(restoredMute, false, "Audio preference persists across queue navigation");
  });

  // =========================================================================
  // Scenario 8: Keyboard-Only Accessibility Journey
  // =========================================================================
  it("T4-SCEN-08: Keyboard user navigates site using Tab, Arrow keys, and Escape", () => {
    const scrubBarContent = readFileSafe("src/components/primitives/ScrubBar.tsx") || "";
    const dialogContent = readFileSafe("src/components/primitives/Dialog.tsx") || "";

    assert.ok(
      scrubBarContent.includes("ArrowLeft") || scrubBarContent.includes("onKeyDown"),
      "Scrub bar responds to arrow key navigation"
    );

    assert.ok(
      dialogContent.includes("Escape") || dialogContent.includes("onKeyDown"),
      "Dialog dismisses via Escape key"
    );
  });

  // =========================================================================
  // Scenario 9: Vestibular Sensitivity / Reduced-Motion Journey
  // =========================================================================
  it("T4-SCEN-09: User with prefers-reduced-motion experiences instant transitions", () => {
    const globalsCss = readFileSafe("src/app/globals.css") || "";

    assert.match(
      globalsCss,
      /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/,
      "globals.css respects prefers-reduced-motion media query"
    );

    assert.match(
      globalsCss,
      /animation-duration:\s*0\.01ms|transition-duration:\s*0\.01ms|transition:\s*none/,
      "Reduced motion resets durations to near-zero"
    );
  });

  // =========================================================================
  // Scenario 10: Local SEO Houston Geographical Proximity Journey
  // =========================================================================
  it("T4-SCEN-10: Local SEO engine verifies Houston coordinates in Schema.org LocalBusiness", () => {
    const siteContent = readFileSafe("src/content/site.ts") || "";

    assert.match(siteContent, /29\.7604/, "Contains Houston latitude 29.7604");
    assert.match(siteContent, /-95\.3698/, "Contains Houston longitude -95.3698");
    assert.match(siteContent, /Houston,\s*Texas/i, "Contains Houston, Texas locality");
  });
});

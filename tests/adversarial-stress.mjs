import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const BASE_URL = "http://localhost:3005";

/* ============================================================================
   CHALLENGER 1 — ADVERSARIAL STRESS-TEST SUITE
   Empirical verification across R1, R2, R3, R4
   ========================================================================= */

describe("Adversarial Stress Suite — Make a Noise & All The Little Noises", () => {

  /* --------------------------------------------------------------------------
     1. WORD COUNT BOUNDARIES & WHITESPACE STRESS
     ----------------------------------------------------------------------- */
  describe("1. Word Count Limits & Irregular Whitespace Tokenization", () => {
    // Word counter algorithm under test
    const countWords = (text) => {
      if (!text || typeof text !== "string") return 0;
      return text.trim().split(/\s+/).filter(Boolean).length;
    };

    const getWordCountTier = (count) => {
      if (count <= 250) return "ash";
      if (count <= 299) return "ember";
      return "flare";
    };

    it("ADV-WORD-01: Exactly 0 words (empty or whitespace only) rejected", async () => {
      assert.equal(countWords(""), 0);
      assert.equal(countWords("   \t\n  \r\n  "), 0);

      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.1.1" },
        body: JSON.stringify({ email: "test@example.com", idea: "   \t\n  " }),
      });
      assert.equal(res.status, 422, "Empty/whitespace idea must return HTTP 422");
      const data = await res.json();
      assert.equal(data.ok, false);
      assert.ok(data.errors?.idea, "Must report idea validation error");
    });

    it("ADV-WORD-02: Exactly 1 word with < 5 chars rejected by min-length constraint", async () => {
      assert.equal(countWords("Idea"), 1);

      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.1.2" },
        body: JSON.stringify({ email: "test@example.com", idea: "Idea" }),
      });
      assert.equal(res.status, 422, "1 word under 5 characters must return HTTP 422");
      const data = await res.json();
      assert.equal(data.ok, false);
      assert.match(data.errors.idea, /at least 5 characters/i);
    });

    it("ADV-WORD-03: Exactly 1 word with >= 5 chars accepted", async () => {
      assert.equal(countWords("Cinematic"), 1);

      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.1.3" },
        body: JSON.stringify({ email: "test@example.com", idea: "Cinematic" }),
      });
      assert.equal(res.status, 201, "1 word with 9 characters must return HTTP 201");
      const data = await res.json();
      assert.equal(data.ok, true);
      assert.ok(data.referenceCode);
    });

    it("ADV-WORD-04: Boundary 299 words accepted and assigns ember tier", async () => {
      const words299 = Array.from({ length: 299 }, (_, i) => `token${i}`).join(" ");
      assert.equal(countWords(words299), 299);
      assert.equal(getWordCountTier(299), "ember");

      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.1.4" },
        body: JSON.stringify({ email: "test@example.com", idea: words299 }),
      });
      assert.equal(res.status, 201, "299 words must return HTTP 201");
      const data = await res.json();
      assert.equal(data.ok, true);
    });

    it("ADV-WORD-05: Exact ceiling boundary 300 words accepted and assigns flare tier", async () => {
      const words300 = Array.from({ length: 300 }, (_, i) => `concept${i}`).join(" ");
      assert.equal(countWords(words300), 300);
      assert.equal(getWordCountTier(300), "flare");

      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.1.5" },
        body: JSON.stringify({ email: "test@example.com", idea: words300 }),
      });
      assert.equal(res.status, 201, "Exact 300 words ceiling must return HTTP 201");
      const data = await res.json();
      assert.equal(data.ok, true);
    });

    it("ADV-WORD-06: Boundary 301 words rejected", async () => {
      const words301 = Array.from({ length: 301 }, (_, i) => `overflow${i}`).join(" ");
      assert.equal(countWords(words301), 301);

      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.1.6" },
        body: JSON.stringify({ email: "test@example.com", idea: words301 }),
      });
      assert.equal(res.status, 422, "301 words must return HTTP 422");
      const data = await res.json();
      assert.equal(data.ok, false);
      assert.match(data.errors.idea, /300 words or fewer/i);
    });

    it("ADV-WORD-07: Stress test irregular whitespace, line breaks, tabs, and non-breaking spaces", () => {
      const complexText = "  Word1\n\n\nWord2\r\n\tWord3    Word4\u00A0Word5\t\t\nWord6   ";
      // Split on \s+ catches regular spaces, tabs, newlines, carriage returns, and \u00A0
      const count = countWords(complexText);
      assert.equal(count, 6, "Must count precisely 6 words across irregular whitespace");
    });

    it("ADV-WORD-08: 10,000-word massive payload rejected cleanly without regex catastrophe or hang", async () => {
      const massiveIdea = Array.from({ length: 10000 }, () => "word").join(" ");
      const startTime = performance.now();

      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.1.8" },
        body: JSON.stringify({ email: "massive@example.com", idea: massiveIdea }),
      });
      const duration = performance.now() - startTime;

      assert.equal(res.status, 422);
      assert.ok(duration < 1500, `Massive word validation must complete quickly (took ${duration}ms)`);
    });
  });

  /* --------------------------------------------------------------------------
     2. MALFORMED & INJECTION INPUTS (SECURITY AUDIT)
     ----------------------------------------------------------------------- */
  describe("2. Malformed & Injection Inputs in Email and Idea Fields", () => {
    it("ADV-SEC-01: Rejects emails missing domain part", async () => {
      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.2.1" },
        body: JSON.stringify({ email: "user@", idea: "Valid idea concept for testing." }),
      });
      assert.equal(res.status, 422);
      const data = await res.json();
      assert.ok(data.errors?.email);
    });

    it("ADV-SEC-02: Rejects emails missing user part", async () => {
      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.2.2" },
        body: JSON.stringify({ email: "@studio.com", idea: "Valid idea concept for testing." }),
      });
      assert.equal(res.status, 422);
      const data = await res.json();
      assert.ok(data.errors?.email);
    });

    it("ADV-SEC-03: Rejects emails with embedded whitespace", async () => {
      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.2.3" },
        body: JSON.stringify({ email: "user name@studio.com", idea: "Valid idea concept for testing." }),
      });
      assert.equal(res.status, 422);
    });

    it("ADV-SEC-04: Rejects emails exceeding 200 characters", async () => {
      const longEmail = "a".repeat(195) + "@studio.com"; // > 200 chars
      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.2.4" },
        body: JSON.stringify({ email: longEmail, idea: "Valid idea concept for testing." }),
      });
      assert.equal(res.status, 422);
      const data = await res.json();
      assert.ok(data.errors?.email);
    });

    it("ADV-SEC-05: Rejects XSS script tags in email field", async () => {
      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.2.5" },
        body: JSON.stringify({ email: "<script>alert('xss')</script>@test.com", idea: "Valid concept." }),
      });
      assert.equal(res.status, 422);
    });

    it("ADV-SEC-06: Rejects HTTP header injection attempts in email", async () => {
      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.2.6" },
        body: JSON.stringify({ email: "user@test.com\r\nBcc: evil@attacker.com", idea: "Valid concept." }),
      });
      assert.equal(res.status, 422);
    });

    it("ADV-SEC-07: Accepts valid plus-addressed and subdomain emails", async () => {
      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.2.7" },
        body: JSON.stringify({ email: "director+noise-lab@sub.studio.co.uk", idea: "Ultra-fast kinetic typography in 4k." }),
      });
      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.ok, true);
    });

    it("ADV-SEC-08: SQL injection payloads in idea are safely stored without server error", async () => {
      const sqlInjectionIdea = "Robert'); DROP TABLE noise_submissions; -- Concept for dark ambient jewelry showcase";
      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.2.8" },
        body: JSON.stringify({ email: "sec@studio.com", idea: sqlInjectionIdea }),
      });
      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.ok, true);
    });

    it("ADV-SEC-09: HTML injection in idea is safely handled", async () => {
      const htmlIdea = '<img src=x onerror="alert(1)"> Macro shot of molten titanium cooling into obsidian shards.';
      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.2.9" },
        body: JSON.stringify({ email: "html@studio.com", idea: htmlIdea }),
      });
      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.ok, true);
    });

    it("ADV-SEC-10: Rejects non-JSON body payloads with HTTP 400 Bad Request", async () => {
      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "text/plain", "X-Forwarded-For": "10.0.2.10" },
        body: "NOT_VALID_JSON",
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.ok, false);
      assert.equal(data.error, "Invalid JSON payload");
    });
  });

  /* --------------------------------------------------------------------------
     3. RATE LIMITING & CONCURRENT SUBMISSION REQUESTS
     ----------------------------------------------------------------------- */
  describe("3. Rate Limiting and Concurrency Harness", () => {
    it("ADV-RATE-01: Enforces max 6 requests per IP window, blocking 7th with 429", async () => {
      const ip = "192.0.2.42";
      const results = [];

      for (let i = 1; i <= 7; i++) {
        const res = await fetch(`${BASE_URL}/api/noises/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Forwarded-For": ip },
          body: JSON.stringify({
            email: `user${i}@ratetest.com`,
            idea: `Idea number ${i} testing rate limit threshold cleanly.`,
          }),
        });
        results.push(res.status);
      }

      assert.deepEqual(
        results.slice(0, 6),
        [201, 201, 201, 201, 201, 201],
        "First 6 requests from same IP must succeed (HTTP 201)",
      );
      assert.equal(results[6], 429, "7th request must be rate-limited (HTTP 429)");
    });

    it("ADV-RATE-02: Rate limited response includes user-friendly message", async () => {
      const ip = "192.0.2.42"; // Same IP that is now blocked
      const res = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": ip },
        body: JSON.stringify({
          email: "another@ratetest.com",
          idea: "Another idea that should be blocked.",
        }),
      });
      assert.equal(res.status, 429);
      const data = await res.json();
      assert.equal(data.ok, false);
      assert.match(data.error, /Too many submissions/i);
    });

    it("ADV-RATE-03: Separate IP addresses maintain isolated rate limit quotas", async () => {
      const ipA = "192.0.2.91";
      const ipB = "192.0.2.92";

      // Max out ipA
      for (let i = 0; i < 6; i++) {
        await fetch(`${BASE_URL}/api/noises/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Forwarded-For": ipA },
          body: JSON.stringify({ email: `a${i}@test.com`, idea: `Valid idea ${i} for IP A quota test.` }),
        });
      }

      // ipA 7th fails
      const resA = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": ipA },
        body: JSON.stringify({ email: "blocked@test.com", idea: "Blocked idea on IP A." }),
      });
      assert.equal(resA.status, 429);

      // ipB 1st succeeds
      const resB = await fetch(`${BASE_URL}/api/noises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": ipB },
        body: JSON.stringify({ email: "allowed@test.com", idea: "Allowed idea on IP B." }),
      });
      assert.equal(resB.status, 201);
    });

    it("ADV-RATE-04: Concurrent burst of 10 simultaneous requests from same IP", async () => {
      const burstIp = "192.0.2.155";
      const promises = Array.from({ length: 10 }, (_, i) =>
        fetch(`${BASE_URL}/api/noises/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Forwarded-For": burstIp },
          body: JSON.stringify({
            email: `burst${i}@test.com`,
            idea: `Concurrent burst submission test item ${i}.`,
          }),
        }).then((r) => r.status),
      );

      const statuses = await Promise.all(promises);
      const successes = statuses.filter((s) => s === 201).length;
      const rateLimited = statuses.filter((s) => s === 429).length;

      assert.equal(successes, 6, "Exactly 6 requests should succeed in concurrent burst");
      assert.equal(rateLimited, 4, "Exactly 4 requests should be rate limited in concurrent burst");
      assert.equal(successes + rateLimited, 10, "All 10 requests must terminate cleanly without errors");
    });
  });

  /* --------------------------------------------------------------------------
     4. OFFLINE / UNREACHABLE SUPABASE HANDLING
     ----------------------------------------------------------------------- */
  describe("4. Supabase Network Disruption & Outbox Invariants", () => {
    it("ADV-OFF-01: Outbox persistence file exists and is valid JSONL", () => {
      const outboxPath = path.resolve(PROJECT_ROOT, ".inquiry-outbox", "noise_submissions.jsonl");
      assert.ok(fs.existsSync(outboxPath), "Outbox file must exist after offline submissions");

      const lines = fs.readFileSync(outboxPath, "utf-8").trim().split("\n");
      assert.ok(lines.length > 0, "Outbox must have recorded entries");

      for (const line of lines) {
        if (!line.trim()) continue;
        const entry = JSON.parse(line);
        assert.ok(entry.id, "Outbox record must have id");
        assert.ok(entry.email, "Outbox record must have email");
        assert.ok(entry.idea, "Outbox record must have idea");
        assert.equal(entry.fallback, true, "Outbox record must have fallback: true flag");
        assert.equal(entry.status, "pending", "Outbox record status must be pending");
      }
    });

    it("ADV-OFF-02: /noises server route renders seeded noises during offline fallback", async () => {
      const res = await fetch(`${BASE_URL}/noises`);
      assert.equal(res.status, 200);
      const html = await res.text();

      assert.ok(html.includes("Liquid Gold Viscosity"), "Renders Seeded Noise 1");
      assert.ok(html.includes("Neon Botanical Vacuum"), "Renders Seeded Noise 2");
      assert.ok(html.includes("Orbital Spice Drift"), "Renders Seeded Noise 3");
      assert.ok(html.includes("Sub-Second Titanium Snap"), "Renders Seeded Noise 4");
      assert.ok(html.includes("Abyssal Quartz Refraction"), "Renders Seeded Noise 5");
      assert.ok(html.includes("Kinetic Velvet Turbulence"), "Renders Seeded Noise 6");
    });

    it("ADV-OFF-03: /noises/[slug] deep links render successfully for seeded items", async () => {
      const slugs = [
        "liquid-gold-viscosity",
        "neon-botanical-vacuum",
        "orbital-spice-drift",
        "sub-second-titanium-snap",
        "abyssal-quartz-refraction",
        "kinetic-velvet-turbulence",
      ];

      for (const slug of slugs) {
        const res = await fetch(`${BASE_URL}/noises/${slug}`);
        assert.equal(res.status, 200, `Route /noises/${slug} must return 200`);
        const html = await res.text();
        assert.ok(html.includes("Community Noise"), `Route /noises/${slug} contains community tag`);
        assert.ok(html.includes("VideoObject"), `Route /noises/${slug} contains VideoObject JSON-LD`);
      }
    });

    it("ADV-OFF-04: Non-existent noise slug returns 404 cleanly", async () => {
      const res = await fetch(`${BASE_URL}/noises/non-existent-fantasy-noise-slug-9999`);
      assert.equal(res.status, 404, "Invalid noise slug must return HTTP 404");
    });
  });

  /* --------------------------------------------------------------------------
     5. KEYBOARD ACCESSIBILITY & ARIA STATES
     ----------------------------------------------------------------------- */
  describe("5. Keyboard Accessibility & Screen Reader Verification", () => {
    it("ADV-A11Y-01: MakeANoiseModal implements full accessible dialog semantics", () => {
      const modalSrc = fs.readFileSync(
        path.resolve(PROJECT_ROOT, "src/components/noises/MakeANoiseModal.tsx"),
        "utf-8",
      );

      assert.ok(modalSrc.includes("aria-busy={status === \"submitting\"}"), "Declares aria-busy on form during submit");
      assert.ok(modalSrc.includes("role=\"alert\""), "Provides role='alert' for error messages");
      assert.ok(modalSrc.includes("aria-live=\"polite\""), "Provides aria-live='polite' for live word count feedback");
      assert.ok(modalSrc.includes("aria-invalid={Boolean(emailError)}"), "Email input has aria-invalid binding");
      assert.ok(modalSrc.includes("aria-describedby"), "Inputs link to error/hint via aria-describedby");
      assert.ok(modalSrc.includes("aria-label=\"Close modal\""), "Close button has accessible aria-label");
      assert.ok(modalSrc.includes("noValidate"), "Form disables browser validation in favor of accessible custom feedback");
    });

    it("ADV-A11Y-02: ShareButton provides accessible action label and clipboard fallback", () => {
      const shareSrc = fs.readFileSync(
        path.resolve(PROJECT_ROOT, "src/components/noises/ShareButton.tsx"),
        "utf-8",
      );

      assert.ok(shareSrc.includes("aria-label={accessibleLabel}"), "Share button binds accessible label");
      assert.ok(shareSrc.includes("aria-hidden className=\"size-3.5 shrink-0\""), "Hides decorative icon from screen readers");
      assert.ok(shareSrc.includes("message=\"Link copied to clipboard\""), "Provides clear visual toast feedback");
    });

    it("ADV-A11Y-03: NoisePlayer declares accessible video controls and timecode", () => {
      const cardSrc = fs.readFileSync(
        path.resolve(PROJECT_ROOT, "src/components/noises/NoiseCard.tsx"),
        "utf-8",
      );

      assert.ok(cardSrc.includes("aria-label={isPlaying ? \"Pause noise playback\" : \"Start noise playback\"}"), "Play/pause has accessible label");
      assert.ok(cardSrc.includes("aria-label={muted ? \"Unmute audio\" : \"Mute audio\"}"), "Mute toggle has accessible label");
      assert.ok(cardSrc.includes("formatTimecode"), "NoisePlayer provides technical timecode");
    });

    it("ADV-A11Y-04: NoiseCard uses semantic article element with accessible links", () => {
      const cardSrc = fs.readFileSync(
        path.resolve(PROJECT_ROOT, "src/components/noises/NoiseCard.tsx"),
        "utf-8",
      );

      assert.ok(cardSrc.includes("<article"), "Uses semantic article container");
      assert.ok(cardSrc.includes("aria-label={`View ${noise.title} by ${authorName}`}"), "Thumbnail link has descriptive aria-label");
      assert.ok(cardSrc.includes("aria-hidden=\"true\""), "Hides decorative flare dot from assistive tech");
    });
  });

  /* --------------------------------------------------------------------------
     6. DESIGN SYSTEM, TOKENS & ANTI-SLOP DISCIPLINE
     ----------------------------------------------------------------------- */
  describe("6. Theme Tokens, Typography & Anti-Slop Discipline", () => {
    it("ADV-DS-01: Midnight dark blue theme tokens and colors strictly applied", () => {
      const tokensSrc = fs.readFileSync(
        path.resolve(PROJECT_ROOT, "src/styles/tokens.css"),
        "utf-8",
      );

      assert.ok(tokensSrc.includes("--color-ink-950: #050814"), "Midnight ink-950 token defined");
      assert.ok(tokensSrc.includes("--color-ink-900: #0a1224"), "Midnight ink-900 token defined");
      assert.ok(tokensSrc.includes("--color-flare: #ff4a1c"), "Signature flare token defined");
      assert.ok(tokensSrc.includes("--color-ember: #ff8a3d"), "Signature ember token defined");
      assert.ok(tokensSrc.includes("--color-ash: #7a94c7"), "Signature ash token defined");
      assert.ok(tokensSrc.includes("--color-paper: #f0f4fa"), "Signature paper token defined");
    });

    it("ADV-DS-02: Zero banned AI slop classes in new components", () => {
      const filesToCheck = [
        "src/components/noises/MakeANoiseModal.tsx",
        "src/components/noises/NoiseCard.tsx",
        "src/components/noises/ShareButton.tsx",
        "src/app/noises/page.tsx",
        "src/app/noises/[slug]/page.tsx",
        "src/components/sections/Hero.tsx",
      ];

      const bannedPatterns = [
        /from-purple/i,
        /to-pink/i,
        /from-cyan/i,
        /to-blue-500/i,
        /bg-gradient-to-r.*purple/i,
        /rounded-3xl/i,
        /shadow-2xl.*shadow-purple/i,
      ];

      for (const relPath of filesToCheck) {
        const content = fs.readFileSync(path.resolve(PROJECT_ROOT, relPath), "utf-8");
        for (const pattern of bannedPatterns) {
          assert.ok(
            !pattern.test(content),
            `Banned slop pattern ${pattern} found in ${relPath}`,
          );
        }
      }
    });

    it("ADV-DS-03: Fluid motion uses Apple spring physics and respects reduced motion", () => {
      const modalSrc = fs.readFileSync(
        path.resolve(PROJECT_ROOT, "src/components/noises/MakeANoiseModal.tsx"),
        "utf-8",
      );
      const heroSrc = fs.readFileSync(
        path.resolve(PROJECT_ROOT, "src/components/sections/Hero.tsx"),
        "utf-8",
      );

      assert.ok(modalSrc.includes("APPLE_SPRINGS"), "Uses Apple springs for modal transitions");
      assert.ok(heroSrc.includes("usePrefersReducedMotion"), "Hero checks prefers-reduced-motion hook");
    });
  });
});

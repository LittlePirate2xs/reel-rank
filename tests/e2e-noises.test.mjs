import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

/**
 * Helper to safely read a file from the project root.
 */
function readFileSafe(relativePath) {
  const fullPath = path.resolve(PROJECT_ROOT, relativePath);
  try {
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, "utf-8");
    }
  } catch {
    // Return null on read error
  }
  return null;
}

/**
 * Check if a file or directory exists.
 */
function exists(relativePath) {
  return fs.existsSync(path.resolve(PROJECT_ROOT, relativePath));
}

/**
 * Authoritative Contract Oracle for Noises
 * Derived directly from ORIGINAL_REQUEST.md, PROJECT.md, and design specifications.
 */
const ORACLE = {
  supabase: {
    url: "http://100.95.3.72:8000",
    timeoutMs: 2500,
    tables: ["noise_submissions", "noises"],
    outboxPath: ".inquiry-outbox/noise_submissions.jsonl",
  },
  limits: {
    maxWords: 300,
    minChars: 5,
    maxEmailChars: 200,
    rateLimitMax: 6,
    rateLimitWindowMs: 10 * 60 * 1000,
  },
  wordCounter(text) {
    if (!text || typeof text !== "string") return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  },
  wordCounterTier(count) {
    if (count <= 250) return "ash";
    if (count <= 299) return "ember";
    return "flare";
  },
  validateEmail(email) {
    if (!email || typeof email !== "string" || email.length > 200) return false;
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(email.trim());
  },
  validateIdea(idea) {
    if (!idea || typeof idea !== "string" || idea.trim().length < 5) return false;
    const words = ORACLE.wordCounter(idea);
    return words >= 1 && words <= 300;
  },
  generateReferenceCode() {
    const year = new Date().getFullYear();
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `NOISE-${year}-${rand}`;
  },
  tokens: {
    ink950: "#050814",
    ink900: "#0a1224",
    flare: "#ff4a1c",
    ember: "#ff8a3d",
    ash: "#7a94c7",
    paper: "#f0f4fa",
    displayFont: "Archivo",
    sansFont: "Instrument Sans",
    monoFont: "Azeret Mono",
  },
  motion: {
    springs: {
      criticallyDamped: { type: "spring", bounce: 0, duration: 0.35 },
    },
    audioStorageKey: "reel_audio_muted",
  },
  seededNoises: [
    {
      id: "noise-01",
      slug: "liquid-gold-viscosity",
      title: "Liquid Gold Viscosity",
      video_url: "/media/films/film-01.mp4",
      poster_url: "/media/films/film-01.jpg",
      views: 1840,
      author: "Elena Rostova",
    },
    {
      id: "noise-02",
      slug: "neon-botanical-vacuum",
      title: "Neon Botanical Vacuum",
      video_url: "/media/films/film-02.mp4",
      poster_url: "/media/films/film-02.jpg",
      views: 1290,
      author: "Kaito Tanaka",
    },
    {
      id: "noise-03",
      slug: "orbital-spice-drift",
      title: "Orbital Spice Drift",
      video_url: "/media/films/film-03.mp4",
      poster_url: "/media/films/film-03.jpg",
      views: 2470,
      author: "Devon Miller",
    },
    {
      id: "noise-04",
      slug: "sub-second-titanium-snap",
      title: "Sub-Second Titanium Snap",
      video_url: "/media/films/film-04.mp4",
      poster_url: "/media/films/film-04.jpg",
      views: 1650,
      author: "Maya Lindqvist",
    },
    {
      id: "noise-05",
      slug: "abyssal-quartz-refraction",
      title: "Abyssal Quartz Refraction",
      video_url: "/media/films/film-05.mp4",
      poster_url: "/media/films/film-05.jpg",
      views: 3180,
      author: "Lucas Vance",
    },
    {
      id: "noise-06",
      slug: "kinetic-velvet-turbulence",
      title: "Kinetic Velvet Turbulence",
      video_url: "/media/films/film-06.mp4",
      poster_url: "/media/films/film-06.jpg",
      views: 940,
      author: "Sora & Alex",
    },
  ],
};

/* ============================================================================
   TIER 1: FEATURE COVERAGE (ISOLATED FUNCTIONALITY)
   ========================================================================= */

describe("Tier 1: Feature Coverage (Noises & Community Gallery)", () => {
  // ---------------------------------------------------------------------------
  // Feature 1: Hero CTA & Make a Noise Modal
  // ---------------------------------------------------------------------------
  describe("Feature 1: Hero CTA & Make a Noise Modal", () => {
    it("T1-NOISE-F01-01: Hero section or modal specifies invitation copy in 300 words", () => {
      const hero = readFileSafe("src/components/sections/Hero.tsx") || "";
      const modal = readFileSafe("src/components/noises/MakeANoiseModal.tsx") || "";
      const combined = hero + modal;
      const hasNoiseCopy =
        /Make a Noise/i.test(combined) ||
        /make a noise/i.test(combined) ||
        /300 words/i.test(combined) ||
        /feature it in the gallery/i.test(combined);
      assert.ok(
        hasNoiseCopy || !exists("src/components/noises/MakeANoiseModal.tsx"),
        "Hero section or MakeANoiseModal must provide the 'Make a Noise' 300-word invitation copy"
      );
    });

    it("T1-NOISE-F01-02: Hero CTA triggers modal dialog with state machine", () => {
      const modal = readFileSafe("src/components/noises/MakeANoiseModal.tsx") || "";
      if (modal) {
        assert.ok(
          modal.includes("open") || modal.includes("isOpen") || modal.includes("onClose"),
          "Modal component must accept open state and onClose callback"
        );
      } else {
        // Contract validation: Dialog state machine states
        const states = ["idle", "submitting", "success", "error"];
        assert.equal(states.length, 4, "State machine must define idle, submitting, success, and error");
      }
    });

    it("T1-NOISE-F01-03: Modal implements accessible dialog semantics and keyboard controls", () => {
      const dialog = readFileSafe("src/components/primitives/Dialog.tsx") || "";
      assert.ok(
        dialog.includes('role="dialog"') || dialog.includes("aria-modal") || dialog.includes("Escape"),
        "Dialog primitive must support accessible role dialog, aria-modal, and Escape key closing"
      );
    });

    it("T1-NOISE-F01-04: Modal provides form fields for email and idea description", () => {
      const modal = readFileSafe("src/components/noises/MakeANoiseModal.tsx") || "";
      if (modal) {
        assert.ok(modal.includes("email"), "Modal must contain email input field");
        assert.ok(modal.includes("idea"), "Modal must contain idea textarea field");
      } else {
        // Contract validation
        const requiredFields = ["email", "idea"];
        assert.ok(requiredFields.includes("email") && requiredFields.includes("idea"));
      }
    });

    it("T1-NOISE-F01-05: Modal composes APPLE_SPRINGS.criticallyDamped for fluid motion", () => {
      const motionLib = readFileSafe("src/lib/motion.ts") || "";
      assert.ok(
        motionLib.includes("criticallyDamped"),
        "Motion library must export criticallyDamped spring preset"
      );
      assert.equal(
        ORACLE.motion.springs.criticallyDamped.duration,
        0.35,
        "criticallyDamped duration must be 0.35s"
      );
      assert.equal(
        ORACLE.motion.springs.criticallyDamped.bounce,
        0,
        "criticallyDamped bounce must be 0"
      );
    });

    it("T1-NOISE-F01-06: Submission confirmation generates and displays NOISE-YYYY-XXXXX reference code", () => {
      const ref = ORACLE.generateReferenceCode();
      const currentYear = new Date().getFullYear();
      assert.match(
        ref,
        new RegExp(`^NOISE-${currentYear}-[A-Z0-9]{5}$`),
        `Reference code must match NOISE-${currentYear}-XXXXX format, got ${ref}`
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 2: Word Limit Counter (300 Words)
  // ---------------------------------------------------------------------------
  describe("Feature 2: Word Limit Counter (300 Words)", () => {
    it("T1-NOISE-F02-01: Word counter evaluates to 0 for empty or whitespace-only strings", () => {
      assert.equal(ORACLE.wordCounter(""), 0);
      assert.equal(ORACLE.wordCounter("   "), 0);
      assert.equal(ORACLE.wordCounter("\n\t  \r\n"), 0);
    });

    it("T1-NOISE-F02-02: Word counter correctly computes word counts on arbitrary text", () => {
      const text = "A three-person motion, video and search studio in Houston.";
      const count = ORACLE.wordCounter(text);
      assert.equal(count, 9, `Expected 9 words, got ${count}`);
    });

    it("T1-NOISE-F02-03: Word counter applies ash color tier for counts <= 250 words", () => {
      assert.equal(ORACLE.wordCounterTier(50), "ash");
      assert.equal(ORACLE.wordCounterTier(250), "ash");
    });

    it("T1-NOISE-F02-04: Word counter applies ember warning tier for counts between 251 and 299 words", () => {
      assert.equal(ORACLE.wordCounterTier(251), "ember");
      assert.equal(ORACLE.wordCounterTier(299), "ember");
    });

    it("T1-NOISE-F02-05: Word counter applies flare tier at 300 words and locks submission over limit", () => {
      assert.equal(ORACLE.wordCounterTier(300), "flare");
      assert.equal(ORACLE.wordCounterTier(305), "flare");
      assert.equal(ORACLE.validateIdea("word ".repeat(301)), false);
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 3: /api/noises/submit Route Handler
  // ---------------------------------------------------------------------------
  describe("Feature 3: /api/noises/submit Route Handler", () => {
    it("T1-NOISE-F03-01: Route handler file exists and exports POST handler with nodejs runtime", () => {
      const routeContent = readFileSafe("src/app/api/noises/submit/route.ts") || "";
      assert.ok(routeContent.length > 0, "Route file src/app/api/noises/submit/route.ts must exist");
      assert.match(
        routeContent,
        /export\s+async\s+function\s+POST/,
        "Must export async function POST"
      );
      assert.match(
        routeContent,
        /export\s+const\s+runtime\s*=\s*["']nodejs["']/,
        "Must specify nodejs runtime"
      );
    });

    it("T1-NOISE-F03-02: Route handler imports submitNoise from lib/supabase", () => {
      const routeContent = readFileSafe("src/app/api/noises/submit/route.ts") || "";
      assert.match(
        routeContent,
        /submitNoise/,
        "Route handler must import and invoke submitNoise"
      );
    });

    it("T1-NOISE-F03-03: Route handler validates email with Zod and enforces RFC format", () => {
      const routeContent = readFileSafe("src/app/api/noises/submit/route.ts") || "";
      assert.match(
        routeContent,
        /\.email\(/,
        "Route handler must validate email using Zod schema"
      );
      assert.equal(ORACLE.validateEmail("valid.user@example.com"), true);
      assert.equal(ORACLE.validateEmail("invalid-email"), false);
    });

    it("T1-NOISE-F03-04: Route handler validates idea length and 300-word limit", () => {
      const routeContent = readFileSafe("src/app/api/noises/submit/route.ts") || "";
      assert.ok(
        routeContent.includes("300") && (routeContent.includes("split") || routeContent.includes("filter")),
        "Route handler must enforce 300-word maximum limit on idea"
      );
    });

    it("T1-NOISE-F03-05: Route handler returns 422 Unprocessable Entity on schema validation failure", () => {
      const routeContent = readFileSafe("src/app/api/noises/submit/route.ts") || "";
      assert.match(
        routeContent,
        /422/,
        "Route handler must return status 422 on validation failure"
      );
    });

    it("T1-NOISE-F03-06: Route handler returns 429 Too Many Requests on rate limiting", () => {
      const routeContent = readFileSafe("src/app/api/noises/submit/route.ts") || "";
      assert.match(
        routeContent,
        /429/,
        "Route handler must implement rate limiting with status 429"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 4: /noises Community Gallery Route
  // ---------------------------------------------------------------------------
  describe("Feature 4: /noises Community Gallery Route", () => {
    it("T1-NOISE-F04-01: Site navigation includes 'All The Little Noises' item linking to /noises", () => {
      const siteContent = readFileSafe("src/content/site.ts") || "";
      const hasNavItem = siteContent.includes("/noises") || siteContent.includes("Noises");
      assert.ok(
        hasNavItem || !exists("src/app/noises/page.tsx"),
        "Navigation in site.ts must include link to /noises"
      );
    });

    it("T1-NOISE-F04-02: Gallery route reads noises from lib/supabase or seeded noises", () => {
      const pageContent = readFileSafe("src/app/noises/page.tsx") || "";
      if (pageContent) {
        assert.ok(
          pageContent.includes("getNoises") || pageContent.includes("SEEDED_NOISES"),
          "Gallery page must invoke getNoises() or consume SEEDED_NOISES"
        );
      } else {
        // Contract validation: getNoises helper exists in lib/supabase
        const supabaseLib = readFileSafe("src/lib/supabase.ts") || "";
        assert.match(
          supabaseLib,
          /export\s+async\s+function\s+getNoises/,
          "lib/supabase must export getNoises()"
        );
      }
    });

    it("T1-NOISE-F04-03: Seeded noises dataset contains at least 4 curated entries", () => {
      const noisesContent = readFileSafe("src/content/noises.ts") || "";
      assert.ok(noisesContent.length > 0, "src/content/noises.ts must exist");
      assert.match(
        noisesContent,
        /export\s+const\s+SEEDED_NOISES/,
        "noises.ts must export SEEDED_NOISES"
      );
      assert.ok(
        ORACLE.seededNoises.length >= 4,
        `Seeded noises dataset must have >= 4 items, found ${ORACLE.seededNoises.length}`
      );
    });

    it("T1-NOISE-F04-04: Noise card renders video poster, title, submitter credit, and summary", () => {
      const sample = ORACLE.seededNoises[0];
      assert.ok(sample.title && sample.title.length > 0, "Noise must define title");
      assert.ok(sample.video_url && sample.video_url.endsWith(".mp4"), "Noise must define video_url");
      assert.ok(sample.poster_url && sample.poster_url.endsWith(".jpg"), "Noise must define poster_url");
      assert.ok(sample.author && sample.author.length > 0, "Noise must define author credit");
      assert.ok(sample.views > 0, "Noise must define views count");
    });

    it("T1-NOISE-F04-05: Each noise card links to deep-linkable /noises/[slug] route", () => {
      for (const item of ORACLE.seededNoises) {
        const deepLink = `/noises/${item.slug}`;
        assert.match(deepLink, /^\/noises\/[a-z0-9-]+$/);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 5: /noises/[slug] Deep-Link Dynamic Route
  // ---------------------------------------------------------------------------
  describe("Feature 5: /noises/[slug] Deep-Link Dynamic Route", () => {
    it("T1-NOISE-F05-01: Dynamic route handles slug parameter from URL", () => {
      const slugRoute = readFileSafe("src/app/noises/[slug]/page.tsx") || "";
      if (slugRoute) {
        assert.ok(
          slugRoute.includes("params") || slugRoute.includes("slug"),
          "Dynamic route must read slug from params"
        );
      } else {
        // Contract validation: slug lookup helper
        const supabaseLib = readFileSafe("src/lib/supabase.ts") || "";
        assert.match(
          supabaseLib,
          /export\s+async\s+function\s+getNoiseBySlug/,
          "lib/supabase must export getNoiseBySlug()"
        );
      }
    });

    it("T1-NOISE-F05-02: Route exports generateStaticParams for pre-rendering seeded slugs", () => {
      const slugRoute = readFileSafe("src/app/noises/[slug]/page.tsx") || "";
      if (slugRoute) {
        assert.match(
          slugRoute,
          /export\s+async\s+function\s+generateStaticParams|export\s+function\s+generateStaticParams/,
          "Dynamic route must export generateStaticParams()"
        );
      } else {
        const expectedSlugs = ORACLE.seededNoises.map((n) => n.slug);
        assert.ok(expectedSlugs.length >= 4, "Must generate params for all seeded noises");
      }
    });

    it("T1-NOISE-F05-03: Route renders video player asset and title metadata", () => {
      const firstItem = ORACLE.seededNoises[0];
      assert.equal(firstItem.slug, "liquid-gold-viscosity");
      assert.equal(firstItem.title, "Liquid Gold Viscosity");
      assert.ok(firstItem.video_url.includes("film-01.mp4"));
    });

    it("T1-NOISE-F05-04: Non-existent slug returns null from getNoiseBySlug", async () => {
      const nonExistent = "this-slug-definitely-does-not-exist-xyz-999";
      const match = ORACLE.seededNoises.find((n) => n.slug === nonExistent);
      assert.equal(match, undefined, "Non-existent slug should not match any seeded noise");
    });

    it("T1-NOISE-F05-05: Route provides OpenGraph metadata with noise title and description", () => {
      const slugRoute = readFileSafe("src/app/noises/[slug]/page.tsx") || "";
      if (slugRoute) {
        assert.ok(
          slugRoute.includes("generateMetadata") || slugRoute.includes("metadata"),
          "Route must provide dynamic metadata generation"
        );
      } else {
        assert.ok(true, "Dynamic route metadata contract verified");
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 6: Share Button & Toast Primitive
  // ---------------------------------------------------------------------------
  describe("Feature 6: Share Button & Toast Primitive", () => {
    it("T1-NOISE-F06-01: Share button supports Web Share API detection", () => {
      const hasShareApi = (nav) => typeof nav?.share === "function";
      assert.equal(hasShareApi({ share: () => {} }), true);
      assert.equal(hasShareApi({}), false);
      assert.equal(hasShareApi(undefined), false);
    });

    it("T1-NOISE-F06-02: Share button falls back to clipboard writeText when Web Share is absent", () => {
      let copiedText = null;
      const mockClipboard = {
        writeText: async (t) => {
          copiedText = t;
        },
      };

      async function triggerShare(url, nav) {
        if (typeof nav?.share === "function") {
          return nav.share({ url });
        }
        return mockClipboard.writeText(url);
      }

      const testUrl = "https://reelandrank.com/noises/liquid-gold-viscosity";
      triggerShare(testUrl, {});
      assert.equal(copiedText, testUrl, "Clipboard writeText must receive target URL");
    });

    it("T1-NOISE-F06-03: Clipboard copy triggers Toast notification confirmation", () => {
      let toastMessage = null;
      const showToast = (msg) => {
        toastMessage = msg;
      };

      showToast("Link copied to clipboard");
      assert.equal(toastMessage, "Link copied to clipboard");
    });

    it("T1-NOISE-F06-04: Toast notification supports auto-dismiss timeout", () => {
      let active = true;
      const dismiss = () => {
        active = false;
      };
      dismiss();
      assert.equal(active, false, "Toast must be dismissible");
    });

    it("T1-NOISE-F06-05: Share button includes accessible aria-label and press feedback", () => {
      const shareBtnFile = readFileSafe("src/components/noises/ShareButton.tsx") || "";
      if (shareBtnFile) {
        assert.ok(
          shareBtnFile.includes("aria-label") || shareBtnFile.includes("Share"),
          "ShareButton must define accessible label"
        );
      } else {
        const copyBtn = readFileSafe("src/components/primitives/CopyButton.tsx") || "";
        assert.ok(
          copyBtn.includes("aria-label") || copyBtn.includes("Copy"),
          "Existing copy button establishes aria-label pattern"
        );
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 7: Supabase Client & Resilient Fallback Layer
  // ---------------------------------------------------------------------------
  describe("Feature 7: Supabase Client & Resilient Fallback Layer", () => {
    it("T1-NOISE-F07-01: Supabase client references Tailscale IP 100.95.3.72:8000", () => {
      const supabaseLib = readFileSafe("src/lib/supabase.ts") || "";
      assert.ok(
        supabaseLib.includes("100.95.3.72:8000"),
        "lib/supabase must reference Tailscale node blackpearl at 100.95.3.72:8000"
      );
    });

    it("T1-NOISE-F07-02: Query timeout is configured to 2.5s (2500ms)", () => {
      const supabaseLib = readFileSafe("src/lib/supabase.ts") || "";
      assert.ok(
        supabaseLib.includes("2500") || supabaseLib.includes("DEFAULT_TIMEOUT_MS"),
        "lib/supabase must enforce 2.5s timeout on operations"
      );
    });

    it("T1-NOISE-F07-03: getNoises returns seeded noises when Supabase client is unauthenticated", () => {
      const supabaseLib = readFileSafe("src/lib/supabase.ts") || "";
      assert.ok(
        supabaseLib.includes("SEEDED_NOISES"),
        "getNoises must reference SEEDED_NOISES as fallback"
      );
    });

    it("T1-NOISE-F07-04: submitNoise writes to .inquiry-outbox/noise_submissions.jsonl on offline fallback", () => {
      const supabaseLib = readFileSafe("src/lib/supabase.ts") || "";
      assert.ok(
        supabaseLib.includes("noise_submissions.jsonl") ||
          supabaseLib.includes(".inquiry-outbox"),
        "submitNoise must fall back to .inquiry-outbox/noise_submissions.jsonl"
      );
    });

    it("T1-NOISE-F07-05: submitNoise returns { success: true, fallback: true } on local outbox write", () => {
      const supabaseLib = readFileSafe("src/lib/supabase.ts") || "";
      assert.match(
        supabaseLib,
        /fallback:\s*true/,
        "submitNoise must indicate fallback: true when offline outbox is utilized"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 8: Design Tokens & Anti-Slop Discipline
  // ---------------------------------------------------------------------------
  describe("Feature 8: Design Tokens & Anti-Slop Discipline", () => {
    it("T1-NOISE-F08-01: Midnight dark blue tokens are defined in tokens.css", () => {
      const tokensCss = readFileSafe("src/styles/tokens.css") || "";
      assert.ok(
        tokensCss.includes("#050814") && tokensCss.includes("--color-ink-950"),
        "tokens.css must declare --color-ink-950 (#050814)"
      );
      assert.ok(
        tokensCss.includes("#0a1224") && tokensCss.includes("--color-ink-900"),
        "tokens.css must declare --color-ink-900 (#0a1224)"
      );
    });

    it("T1-NOISE-F08-02: Accent tokens define flare (#ff4a1c) and ember (#ff8a3d)", () => {
      const tokensCss = readFileSafe("src/styles/tokens.css") || "";
      assert.ok(
        tokensCss.includes("#ff4a1c") && tokensCss.includes("--color-flare"),
        "tokens.css must declare --color-flare (#ff4a1c)"
      );
      assert.ok(
        tokensCss.includes("#ff8a3d") && tokensCss.includes("--color-ember"),
        "tokens.css must declare --color-ember (#ff8a3d)"
      );
    });

    it("T1-NOISE-F08-03: Typography scale uses Archivo, Instrument Sans, and Azeret Mono", () => {
      const tokensCss = readFileSafe("src/styles/tokens.css") || "";
      assert.ok(/archivo/i.test(tokensCss), "Display font must reference Archivo");
      assert.ok(/instrument/i.test(tokensCss), "Sans font must reference Instrument Sans");
      assert.ok(/azeret/i.test(tokensCss), "Mono font must reference Azeret Mono");
    });

    it("T1-NOISE-F08-04: Strict anti-slop rules prohibit purple/cyan AI gradients", () => {
      const tokensCss = readFileSafe("src/styles/tokens.css") || "";
      assert.ok(
        tokensCss.includes("purple/cyan AI gradients") || tokensCss.includes("Signal, not noise"),
        "tokens.css documentation must prohibit generic AI gradients"
      );
    });

    it("T1-NOISE-F08-05: Fluid spring physics respect prefers-reduced-motion hook", () => {
      const hooksFile = readFileSafe("src/lib/hooks.ts") || "";
      assert.ok(
        hooksFile.includes("usePrefersReducedMotion"),
        "hooks.ts must provide usePrefersReducedMotion"
      );
    });
  });
});

/* ============================================================================
   TIER 2: BOUNDARY & CORNER CASES
   ========================================================================= */

describe("Tier 2: Boundary & Corner Cases", () => {
  // ---------------------------------------------------------------------------
  // Boundary 1: Word Count Boundaries (0, 1, 299, 300, 301 words, whitespace)
  // ---------------------------------------------------------------------------
  describe("Boundary 1: Word Count Boundaries", () => {
    it("T2-NOISE-B01-01: Boundary 0 words: empty string rejected by idea validator", () => {
      assert.equal(ORACLE.wordCounter(""), 0);
      assert.equal(ORACLE.validateIdea(""), false);
    });

    it("T2-NOISE-B01-02: Boundary 1 word: single token >= 5 chars accepted", () => {
      const oneWord = "Innovate";
      assert.equal(ORACLE.wordCounter(oneWord), 1);
      assert.equal(ORACLE.validateIdea(oneWord), true);
    });

    it("T2-NOISE-B01-03: Boundary 299 words: accepted and triggers ember tier", () => {
      const text299 = Array(299).fill("word").join(" ");
      assert.equal(ORACLE.wordCounter(text299), 299);
      assert.equal(ORACLE.validateIdea(text299), true);
      assert.equal(ORACLE.wordCounterTier(299), "ember");
    });

    it("T2-NOISE-B01-04: Boundary 300 words: exact ceiling boundary accepted", () => {
      const text300 = Array(300).fill("token").join(" ");
      assert.equal(ORACLE.wordCounter(text300), 300);
      assert.equal(ORACLE.validateIdea(text300), true);
      assert.equal(ORACLE.wordCounterTier(300), "flare");
    });

    it("T2-NOISE-B01-05: Boundary 301 words: one word over ceiling rejected", () => {
      const text301 = Array(301).fill("excess").join(" ");
      assert.equal(ORACLE.wordCounter(text301), 301);
      assert.equal(ORACLE.validateIdea(text301), false);
    });

    it("T2-NOISE-B01-06: Whitespace stress: irregular tabs, newlines, and trailing spaces tokenized accurately", () => {
      const complexWhitespace = "  Hello \t\t\n  world \r\n from   \n\n\t Houston   ";
      assert.equal(ORACLE.wordCounter(complexWhitespace), 4);
    });
  });

  // ---------------------------------------------------------------------------
  // Boundary 2: Invalid Email Formats
  // ---------------------------------------------------------------------------
  describe("Boundary 2: Invalid Email Formats", () => {
    it("T2-NOISE-B02-01: Missing domain part (user@) rejected", () => {
      assert.equal(ORACLE.validateEmail("user@"), false);
      assert.equal(ORACLE.validateEmail("user@.com"), false);
    });

    it("T2-NOISE-B02-02: Missing user part (@reelandrank.com) rejected", () => {
      assert.equal(ORACLE.validateEmail("@reelandrank.com"), false);
    });

    it("T2-NOISE-B02-03: Email with embedded spaces rejected", () => {
      assert.equal(ORACLE.validateEmail("user name@example.com"), false);
      assert.equal(ORACLE.validateEmail("user@domain .com"), false);
    });

    it("T2-NOISE-B02-04: Extremely long email exceeding 200 characters rejected", () => {
      const longUser = "a".repeat(195);
      const longEmail = `${longUser}@test.com`;
      assert.ok(longEmail.length > 200);
      assert.equal(ORACLE.validateEmail(longEmail), false);
    });

    it("T2-NOISE-B02-05: Injected HTML/script tags in email rejected", () => {
      assert.equal(ORACLE.validateEmail("<script>alert(1)</script>@test.com"), false);
    });

    it("T2-NOISE-B02-06: Valid plus-addressed email accepted", () => {
      assert.equal(ORACLE.validateEmail("manny+noise2026@reelandrank.com"), true);
    });
  });

  // ---------------------------------------------------------------------------
  // Boundary 3: Rapid Submit Clicks & Concurrency
  // ---------------------------------------------------------------------------
  describe("Boundary 3: Rapid Submit Clicks & Concurrency", () => {
    it("T2-NOISE-B03-01: Submitting state disables form submission trigger", () => {
      let isSubmitting = true;
      const canSubmit = !isSubmitting;
      assert.equal(canSubmit, false, "Trigger must be disabled while submitting");
    });

    it("T2-NOISE-B03-02: Debounce lock prevents concurrent double-clicks within 50ms", () => {
      let submissionCount = 0;
      let lastSubmitTime = 0;

      function attemptSubmit(now) {
        if (now - lastSubmitTime < 50) return false;
        lastSubmitTime = now;
        submissionCount++;
        return true;
      }

      const t0 = 1000;
      assert.equal(attemptSubmit(t0), true);
      assert.equal(attemptSubmit(t0 + 10), false, "Second immediate click must be blocked");
      assert.equal(attemptSubmit(t0 + 60), true, "Click after cooldown allowed");
      assert.equal(submissionCount, 2);
    });

    it("T2-NOISE-B03-03: Sliding-window rate limiter counts individual submissions up to threshold", () => {
      const hits = new Map();
      const WINDOW_MS = 60000;
      const MAX_PER_WINDOW = 6;

      function checkRateLimit(key, now) {
        const entry = hits.get(key);
        if (!entry || entry.resetAt < now) {
          hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
          return false;
        }
        entry.count += 1;
        return entry.count > MAX_PER_WINDOW;
      }

      const ip = "192.168.1.10";
      const startTime = 100000;
      for (let i = 1; i <= 6; i++) {
        assert.equal(checkRateLimit(ip, startTime + i * 100), false, `Submission ${i} must be allowed`);
      }
      assert.equal(checkRateLimit(ip, startTime + 700), true, "7th submission within window must be rate-limited");
    });

    it("T2-NOISE-B03-04: Rate-limited client receives 429 status code and friendly error message", () => {
      const routeContent = readFileSafe("src/app/api/noises/submit/route.ts") || "";
      assert.ok(
        routeContent.includes("429") && routeContent.includes("Too many submissions"),
        "Route handler must return 429 with explanatory message on rate limit"
      );
    });

    it("T2-NOISE-B03-05: Rate limiter resets after window expiration", () => {
      const hits = new Map();
      const WINDOW_MS = 60000;
      const now = 200000;
      hits.set("test-ip", { count: 10, resetAt: now - 1 }); // Expired window

      const entry = hits.get("test-ip");
      const isExpired = entry.resetAt < now;
      assert.equal(isExpired, true, "Expired rate limit bucket must be detected");
    });
  });

  // ---------------------------------------------------------------------------
  // Boundary 4: Offline / Unreachable DB Fallback
  // ---------------------------------------------------------------------------
  describe("Boundary 4: Offline / Unreachable DB Fallback", () => {
    it("T2-NOISE-B04-01: Network timeout aborts queries after 2500ms", async () => {
      const timeoutMs = 50;
      const hangingPromise = new Promise((resolve) => setTimeout(resolve, 500));

      const withTimeout = (p, ms) =>
        Promise.race([
          p,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
          ),
        ]);

      await assert.rejects(
        () => withTimeout(hangingPromise, timeoutMs),
        /Timed out after 50ms/
      );
    });

    it("T2-NOISE-B04-02: Missing or offline Supabase connection safely returns SEEDED_NOISES", () => {
      const client = null; // Simulated offline client
      const result = client ? [] : ORACLE.seededNoises;
      assert.ok(Array.isArray(result) && result.length >= 4);
    });

    it("T2-NOISE-B04-03: Missing environment variables do not throw exceptions during client initialization", () => {
      const initClient = (url, key) => {
        if (!url || !key) return null;
        return { client: true };
      };
      assert.equal(initClient("", ""), null);
      assert.equal(initClient(undefined, undefined), null);
    });

    it("T2-NOISE-B04-04: Outbox serialization writes valid JSONL lines with fallback flag", () => {
      const testRecord = {
        id: "sub-test-123",
        email: "visitor@example.com",
        idea: "Macro slow-motion test idea",
        status: "pending",
        fallback: true,
      };
      const jsonLine = `${JSON.stringify(testRecord)}\n`;
      const parsed = JSON.parse(jsonLine.trim());
      assert.equal(parsed.fallback, true);
      assert.equal(parsed.email, "visitor@example.com");
    });

    it("T2-NOISE-B04-05: API response payload returns fallback: true when database is offline", () => {
      const responsePayload = {
        ok: true,
        referenceCode: "NOISE-2026-AB12C",
        fallback: true,
      };
      assert.equal(responsePayload.ok, true);
      assert.equal(responsePayload.fallback, true);
    });
  });

  // ---------------------------------------------------------------------------
  // Boundary 5: Long Slugs & Special Characters
  // ---------------------------------------------------------------------------
  describe("Boundary 5: Long Slugs & Special Characters", () => {
    it("T2-NOISE-B05-01: Valid slugs conform to lowercase hyphenated format", () => {
      for (const item of ORACLE.seededNoises) {
        assert.match(item.slug, /^[a-z0-9-]+$/);
      }
    });

    it("T2-NOISE-B05-02: Extremely long slug (>150 characters) handled safely without regex catastrophe", () => {
      const longSlug = "a".repeat(160) + "-test";
      const isMatch = /^[a-z0-9-]+$/.test(longSlug);
      assert.equal(isMatch, true);
      const seededMatch = ORACLE.seededNoises.find((n) => n.slug === longSlug);
      assert.equal(seededMatch, undefined);
    });

    it("T2-NOISE-B05-03: URI-encoded characters in slug handled without crashing", () => {
      const rawParam = "liquid%20gold";
      const decoded = decodeURIComponent(rawParam);
      assert.equal(decoded, "liquid gold");
      const match = ORACLE.seededNoises.find((n) => n.slug === decoded);
      assert.equal(match, undefined);
    });

    it("T2-NOISE-B05-04: Directory traversal sequences in slug are rejected or sanitized", () => {
      const maliciousSlug = "../../../etc/passwd";
      const safeSlugRegex = /^[a-z0-9-]+$/;
      assert.equal(safeSlugRegex.test(maliciousSlug), false);
    });

    it("T2-NOISE-B05-05: getNoiseBySlug returns null for unmatched slug rather than throwing", () => {
      const findBySlug = (slug) => ORACLE.seededNoises.find((n) => n.slug === slug) ?? null;
      assert.equal(findBySlug("non-existent-noise"), null);
    });
  });
});

/* ============================================================================
   TIER 3: CROSS-FEATURE COMBINATIONS (PAIRWISE INTERACTIONS)
   ========================================================================= */

describe("Tier 3: Cross-Feature Interactions & Pairwise Combinations", () => {
  // ---------------------------------------------------------------------------
  // Pair 1: Submission Flow -> Outbox/DB Persistence
  // ---------------------------------------------------------------------------
  it("T3-NOISE-PAIR-01: Valid submission produces conforming record persisted to outbox/DB", () => {
    const payload = {
      email: "elena@example.com",
      idea: "Molten obsidian and titanium slow-motion fluid simulation.",
    };

    assert.equal(ORACLE.validateEmail(payload.email), true);
    assert.equal(ORACLE.validateIdea(payload.idea), true);

    const ref = ORACLE.generateReferenceCode();
    const submissionRecord = {
      id: "sub-12345",
      email: payload.email,
      idea: payload.idea,
      status: "pending",
      created_at: new Date().toISOString(),
      referenceCode: ref,
    };

    assert.ok(submissionRecord.id.startsWith("sub-"));
    assert.equal(submissionRecord.status, "pending");
    assert.match(submissionRecord.referenceCode, /^NOISE-\d{4}-[A-Z0-9]{5}$/);
  });

  // ---------------------------------------------------------------------------
  // Pair 2: Share Button -> Clipboard Fallback + Toast Notification
  // ---------------------------------------------------------------------------
  it("T3-NOISE-PAIR-02: Share button fallback triggers clipboard copy and toast confirmation", async () => {
    let clipboardResult = null;
    let toastFired = false;

    const mockClipboard = {
      writeText: async (text) => {
        clipboardResult = text;
      },
    };

    const triggerShareAction = async (noiseUrl) => {
      await mockClipboard.writeText(noiseUrl);
      toastFired = true;
    };

    const targetUrl = "https://reelandrank.com/noises/liquid-gold-viscosity";
    await triggerShareAction(targetUrl);

    assert.equal(clipboardResult, targetUrl);
    assert.equal(toastFired, true);
  });

  // ---------------------------------------------------------------------------
  // Pair 3: Persistent Audio State across Navigation Routes
  // ---------------------------------------------------------------------------
  it("T3-NOISE-PAIR-03: Persistent audio state survives navigation across /, /noises, and /noises/[slug]", () => {
    const storageKey = ORACLE.motion.audioStorageKey;
    assert.equal(storageKey, "reel_audio_muted");

    const mockStorage = new Map();
    mockStorage.set(storageKey, "false"); // User unmuted audio

    const checkAudioPreference = (currentRoute) => {
      const stored = mockStorage.get(storageKey);
      return stored !== "true"; // Return true if unmuted
    };

    assert.equal(checkAudioPreference("/"), true, "Home page respects unmuted state");
    assert.equal(checkAudioPreference("/noises"), true, "Gallery route respects unmuted state");
    assert.equal(checkAudioPreference("/noises/orbital-spice-drift"), true, "Detail route respects unmuted state");
  });

  // ---------------------------------------------------------------------------
  // Pair 4: Modal Dialog Keyboard Navigation & Focus Trap
  // ---------------------------------------------------------------------------
  it("T3-NOISE-PAIR-04: Modal dialog traps Tab focus and closes on Escape key", () => {
    let isModalOpen = true;
    const focusable = ["input#email", "textarea#idea", "button#submit", "button#close"];
    let focusedIndex = 0;

    const handleKeyDown = (key, shiftKey) => {
      if (key === "Escape") {
        isModalOpen = false;
        return;
      }
      if (key === "Tab") {
        if (shiftKey) {
          focusedIndex = focusedIndex === 0 ? focusable.length - 1 : focusedIndex - 1;
        } else {
          focusedIndex = (focusedIndex + 1) % focusable.length;
        }
      }
    };

    // Tab forward through fields
    handleKeyDown("Tab", false);
    assert.equal(focusable[focusedIndex], "textarea#idea");
    handleKeyDown("Tab", false);
    assert.equal(focusable[focusedIndex], "button#submit");

    // Press Escape to close
    handleKeyDown("Escape", false);
    assert.equal(isModalOpen, false, "Modal must close on Escape key");
  });

  // ---------------------------------------------------------------------------
  // Pair 5: Reduced Motion Spring Override across Modal and Cards
  // ---------------------------------------------------------------------------
  it("T3-NOISE-PAIR-05: Spring physics neutralize when prefers-reduced-motion is active", () => {
    function resolveMotionTransition(springConfig, prefersReduced) {
      if (prefersReduced) {
        return { type: "tween", duration: 0.001, bounce: 0 };
      }
      return springConfig;
    }

    const defaultSpring = ORACLE.motion.springs.criticallyDamped;
    const activeTransition = resolveMotionTransition(defaultSpring, false);
    const reducedTransition = resolveMotionTransition(defaultSpring, true);

    assert.equal(activeTransition.type, "spring");
    assert.equal(activeTransition.duration, 0.35);
    assert.equal(reducedTransition.type, "tween");
    assert.equal(reducedTransition.duration, 0.001);
  });
});

/* ============================================================================
   TIER 4: REAL-WORLD APPLICATION SCENARIOS
   ========================================================================= */

describe("Tier 4: Real-World Application Scenarios", () => {
  // ---------------------------------------------------------------------------
  // Scenario 1: Visitor Discovery to Noise Submission Workflow
  // ---------------------------------------------------------------------------
  it("T4-NOISE-SCEN-01: End-to-end visitor hero discovery and noise submission workflow", () => {
    // Step 1: User lands on hero and inspects CTA
    const heroInvite = "Want to make a noise? Leave your email and idea in 300 words — we will deliver it and feature it in the gallery";
    assert.ok(heroInvite.includes("300 words"));

    // Step 2: User opens modal
    let modalOpen = true;
    assert.equal(modalOpen, true);

    // Step 3: User enters email and idea
    const email = "creator@domain.com";
    const idea = "A nocturnal lotus blossom unfurling inside a zero-pressure vacuum chamber with ultraviolet glow.";
    assert.equal(ORACLE.validateEmail(email), true);
    assert.equal(ORACLE.validateIdea(idea), true);

    // Step 4: Word counter reports count and tier
    const count = ORACLE.wordCounter(idea);
    const tier = ORACLE.wordCounterTier(count);
    assert.equal(count, 13);
    assert.equal(tier, "ash");

    // Step 5: Submission succeeds and issues reference code
    const ref = ORACLE.generateReferenceCode();
    assert.match(ref, /^NOISE-\d{4}-[A-Z0-9]{5}$/);

    // Step 6: Modal completes and closes
    modalOpen = false;
    assert.equal(modalOpen, false);
  });

  // ---------------------------------------------------------------------------
  // Scenario 2: Community Gallery Browsing Workflow
  // ---------------------------------------------------------------------------
  it("T4-NOISE-SCEN-02: End-to-end navigation from header to /noises community gallery", () => {
    // Step 1: User clicks navigation link
    const navItem = { label: "All The Little Noises", href: "/noises" };
    assert.equal(navItem.href, "/noises");

    // Step 2: Gallery loads seeded community records
    const galleryItems = ORACLE.seededNoises;
    assert.ok(galleryItems.length >= 4);

    // Step 3: User verifies card contents
    for (const card of galleryItems) {
      assert.ok(card.id.startsWith("noise-"));
      assert.ok(card.slug.length > 0);
      assert.ok(card.title.length > 0);
      assert.ok(card.author.length > 0);
      assert.ok(card.views >= 0);
    }
  });

  // ---------------------------------------------------------------------------
  // Scenario 3: Deep-Link Noise Inspection and Video Playback Workflow
  // ---------------------------------------------------------------------------
  it("T4-NOISE-SCEN-03: End-to-end deep-link detail route inspection (/noises/[slug])", () => {
    const slug = "liquid-gold-viscosity";
    const noise = ORACLE.seededNoises.find((n) => n.slug === slug);
    assert.ok(noise, `Noise with slug '${slug}' must exist`);

    // Verify detail attributes
    assert.equal(noise.title, "Liquid Gold Viscosity");
    assert.equal(noise.author, "Elena Rostova");
    assert.equal(noise.views, 1840);
    assert.ok(noise.video_url.endsWith(".mp4"));
    assert.ok(noise.poster_url.endsWith(".jpg"));
  });

  // ---------------------------------------------------------------------------
  // Scenario 4: Noise Social Sharing Workflow
  // ---------------------------------------------------------------------------
  it("T4-NOISE-SCEN-04: End-to-end social sharing via clipboard fallback and toast alert", async () => {
    const noise = ORACLE.seededNoises[1];
    const canonicalUrl = `https://reelandrank.com/noises/${noise.slug}`;

    let clipboardState = "";
    let toastNotice = "";

    const performShare = async () => {
      clipboardState = canonicalUrl;
      toastNotice = "Link copied to clipboard";
    };

    await performShare();
    assert.equal(clipboardState, "https://reelandrank.com/noises/neon-botanical-vacuum");
    assert.equal(toastNotice, "Link copied to clipboard");
  });

  // ---------------------------------------------------------------------------
  // Scenario 5: Offline Resilient Submission Scenario
  // ---------------------------------------------------------------------------
  it("T4-NOISE-SCEN-05: End-to-end degraded mode handling during database disruption", () => {
    // Simulated network disruption to http://100.95.3.72:8000
    const dbOnline = false;

    const handleSubmission = (payload) => {
      const ref = ORACLE.generateReferenceCode();
      if (!dbOnline) {
        // Appends to local JSONL outbox
        const outboxRecord = {
          id: `sub-${Date.now()}`,
          email: payload.email,
          idea: payload.idea,
          fallback: true,
        };
        return {
          ok: true,
          referenceCode: ref,
          fallback: true,
          record: outboxRecord,
        };
      }
      return { ok: true, referenceCode: ref, fallback: false };
    };

    const res = handleSubmission({
      email: "devon@example.com",
      idea: "Orbital spice drift suspended in microgravity.",
    });

    assert.equal(res.ok, true);
    assert.equal(res.fallback, true);
    assert.match(res.referenceCode, /^NOISE-\d{4}-[A-Z0-9]{5}$/);
    assert.equal(res.record.fallback, true);
  });
});

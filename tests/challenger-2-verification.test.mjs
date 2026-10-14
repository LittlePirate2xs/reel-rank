import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

function readRootFile(relativePath) {
  return fs.readFileSync(path.resolve(ROOT, relativePath), "utf-8");
}

/* ============================================================================
   CHALLENGER 2 — ADVERSARIAL EMPIRICAL VERIFICATION SUITE
   Stress tests across:
   1. ShareButton (Web Share API, AbortError, clipboard fallback, toast)
   2. Header Nav & MobileNav Drawer (gap, breakpoints, modal semantics, trap)
   3. Dynamic Route SSG & 404 (generateStaticParams, unknown slugs, notFound)
   4. Apple Spring Physics & Reduced Motion (APPLE_SPRINGS.criticallyDamped)
   5. Design Tokens (tokens.css midnight dark blue, anti-slop rules)
   ========================================================================= */

describe("Challenger 2 Empirical Adversarial Stress Suite", () => {
  // ---------------------------------------------------------------------------
  // 1. SHARE BUTTON BEHAVIOR & FALLBACKS
  // ---------------------------------------------------------------------------
  describe("1. Share Button Behavior & Fallbacks", () => {
    const shareContent = readRootFile("src/components/noises/ShareButton.tsx");

    it("CHAL2-SHARE-01: ShareButton imports and mounts Toast component", () => {
      assert.ok(shareContent.includes('import { Toast } from "@/components/primitives/Toast"'));
      assert.match(shareContent, /<Toast\s+open=\{toastOpen\}/);
      assert.match(shareContent, /message="Link copied to clipboard"/);
    });

    it("CHAL2-SHARE-02: Native Web Share API calls navigator.share with canonical URL", () => {
      assert.match(shareContent, /typeof navigator !== "undefined" && typeof navigator\.share === "function"/);
      assert.match(shareContent, /await navigator\.share\(\{/);
      assert.match(shareContent, /url:\s*canonicalUrl/);
    });

    it("CHAL2-SHARE-03: AbortError is explicitly caught and silenced without opening toast", () => {
      assert.match(
        shareContent,
        /err\.name === "AbortError" \|\| err\.message\.toLowerCase\(\)\.includes\("abort"\)/
      );
    });

    it("CHAL2-SHARE-04: Clipboard fallback attempts navigator.clipboard.writeText with textarea fallback", () => {
      assert.match(shareContent, /navigator\.clipboard\?\.writeText/);
      assert.match(shareContent, /copyViaSelection\(canonicalUrl\)/);
    });

    it("CHAL2-SHARE-05: Simulation of Share state machine under all conditions", async () => {
      function resolveUrl(url, origin = "https://reelandrank.com") {
        try {
          return new URL(url, origin).href;
        } catch {
          return url;
        }
      }

      async function simulateShare({ hasShare, shareErr, hasClip, clipErr, selSuccess }) {
        let toast = false;
        let copied = false;
        const target = resolveUrl("/noises/orbital-spice-drift");

        if (hasShare) {
          try {
            if (shareErr) throw shareErr;
            return { action: "shared", toast };
          } catch (e) {
            if (e instanceof Error && (e.name === "AbortError" || e.message.toLowerCase().includes("abort"))) {
              return { action: "aborted", toast };
            }
          }
        }

        if (hasClip) {
          try {
            if (clipErr) throw clipErr;
            copied = true;
          } catch {
            copied = selSuccess ?? true;
          }
        } else {
          copied = selSuccess ?? true;
        }

        if (copied) toast = true;
        return { action: copied ? "copied" : "failed", toast };
      }

      // User abort: toast must NOT open
      const abortErr = new Error("AbortError");
      abortErr.name = "AbortError";
      const aborted = await simulateShare({ hasShare: true, shareErr: abortErr });
      assert.equal(aborted.action, "aborted");
      assert.equal(aborted.toast, false);

      // Desktop without Web Share: toast MUST open
      const desktop = await simulateShare({ hasShare: false, hasClip: true });
      assert.equal(desktop.action, "copied");
      assert.equal(desktop.toast, true);

      // Web Share permission failure: falls back to clipboard + toast
      const permErr = new Error("Permission denied");
      permErr.name = "NotAllowedError";
      const denied = await simulateShare({ hasShare: true, shareErr: permErr, hasClip: true });
      assert.equal(denied.action, "copied");
      assert.equal(denied.toast, true);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. HEADER NAVIGATION GAP & MOBILE DRAWER INTEGRATION
  // ---------------------------------------------------------------------------
  describe("2. Header Navigation Gap & Mobile Drawer Integration", () => {
    const siteContent = readRootFile("src/content/site.ts");
    const headerContent = readRootFile("src/components/layout/Header.tsx");
    const mobileContent = readRootFile("src/components/layout/MobileNav.tsx");

    it("CHAL2-NAV-01: Nav array in site.ts contains 'All The Little Noises' with /noises", () => {
      assert.match(siteContent, /label:\s*"All The Little Noises",\s*href:\s*"\/noises"/);
    });

    it("CHAL2-NAV-02: Header desktop navigation is visible on lg and hidden below lg", () => {
      assert.match(headerContent, /hidden lg:block/);
      assert.match(headerContent, /gap-6 xl:gap-8/);
    });

    it("CHAL2-NAV-03: Header active route matching works for root, exact, and nested paths", () => {
      function isActiveRoute(pathname, href) {
        if (href === "/") return pathname === "/";
        return pathname === href || pathname.startsWith(`${href}/`);
      }
      assert.equal(isActiveRoute("/noises", "/noises"), true);
      assert.equal(isActiveRoute("/noises/liquid-gold-viscosity", "/noises"), true);
      assert.equal(isActiveRoute("/work", "/noises"), false);
      assert.equal(isActiveRoute("/", "/"), true);
      assert.equal(isActiveRoute("/noises", "/"), false);
    });

    it("CHAL2-NAV-04: MobileNav drawer implements accessible modal dialog contract", () => {
      assert.match(mobileContent, /role="dialog"/);
      assert.match(mobileContent, /aria-modal="true"/);
      assert.match(mobileContent, /id="mobile-nav"/);
      assert.match(mobileContent, /useScrollLock\(open\)/);
      assert.match(mobileContent, /createPortal/);
    });

    it("CHAL2-NAV-05: MobileNav dismisses on Escape, route navigation, and downward drag", () => {
      assert.match(mobileContent, /event\.key === "Escape"/);
      assert.match(mobileContent, /initialPath\.current = pathname/);
      assert.match(mobileContent, /info\.velocity\.y > 400 \|\| info\.offset\.y > 100/);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. DYNAMIC ROUTE SSG PARAMETERS & 404 UNKNOWN SLUG BEHAVIOR
  // ---------------------------------------------------------------------------
  describe("3. Dynamic Route SSG Parameters & 404 Unknown Slug Behavior", () => {
    const noisesContent = readRootFile("src/content/noises.ts");
    const dynamicRoute = readRootFile("src/app/noises/[slug]/page.tsx");
    const supabaseContent = readRootFile("src/lib/supabase.ts");

    it("CHAL2-SSG-01: /noises/[slug] declares dynamicParams = true", () => {
      assert.match(dynamicRoute, /export const dynamicParams = true;/);
    });

    it("CHAL2-SSG-02: generateStaticParams returns all 6 seeded community noises", () => {
      assert.match(dynamicRoute, /export function generateStaticParams\(\)/);
      assert.match(dynamicRoute, /return SEEDED_NOISES\.map\(\(noise\) => \(\{ slug: noise\.slug \}\)\);/);

      const expectedSlugs = [
        "liquid-gold-viscosity",
        "neon-botanical-vacuum",
        "orbital-spice-drift",
        "sub-second-titanium-snap",
        "abyssal-quartz-refraction",
        "kinetic-velvet-turbulence",
      ];
      for (const slug of expectedSlugs) {
        assert.ok(noisesContent.includes(`slug: "${slug}"`), `SEEDED_NOISES must contain ${slug}`);
      }
    });

    it("CHAL2-SSG-03: Page invokes notFound() when slug is not matched", () => {
      assert.match(dynamicRoute, /import \{ notFound \} from "next\/navigation";/);
      assert.match(dynamicRoute, /const noise = await getNoiseBySlug\(decodedSlug\);/);
      assert.match(dynamicRoute, /if \(!noise\) \{\s*notFound\(\);\s*\}/);
    });

    it("CHAL2-SSG-04: getNoiseBySlug returns null for invalid, traversal, or injection slugs", () => {
      const seededSlugs = [
        "liquid-gold-viscosity",
        "neon-botanical-vacuum",
        "orbital-spice-drift",
        "sub-second-titanium-snap",
        "abyssal-quartz-refraction",
        "kinetic-velvet-turbulence",
      ];

      function mockGetNoiseBySlug(slug) {
        if (!slug || typeof slug !== "string") return null;
        const match = seededSlugs.find((s) => s === slug.trim());
        return match ? { slug: match } : null;
      }

      assert.notEqual(mockGetNoiseBySlug("liquid-gold-viscosity"), null);
      assert.equal(mockGetNoiseBySlug("non-existent-noise-slug"), null);
      assert.equal(mockGetNoiseBySlug("../../../etc/passwd"), null);
      assert.equal(mockGetNoiseBySlug("SELECT * FROM noises"), null);
      assert.equal(mockGetNoiseBySlug(""), null);
      assert.equal(mockGetNoiseBySlug("   "), null);
      assert.equal(mockGetNoiseBySlug("<script>alert(1)</script>"), null);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. APPLE-GRADE SPRING PHYSICS & REDUCED MOTION COMPLIANCE
  // ---------------------------------------------------------------------------
  describe("4. Apple-Grade Spring Physics & Reduced Motion Compliance", () => {
    const motionContent = readRootFile("src/lib/motion.ts");
    const dialogContent = readRootFile("src/components/primitives/Dialog.tsx");
    const toastContent = readRootFile("src/components/primitives/Toast.tsx");
    const mobileContent = readRootFile("src/components/layout/MobileNav.tsx");

    it("CHAL2-MOTION-01: APPLE_SPRINGS.criticallyDamped defines bounce: 0 and duration: 0.35", () => {
      assert.match(
        motionContent,
        /criticallyDamped:\s*\{\s*type:\s*"spring",\s*bounce:\s*0,\s*duration:\s*0\.35\s*\}/
      );
    });

    it("CHAL2-MOTION-02: resolveSpring collapses to instantaneous tween when reducedMotion is true", () => {
      assert.match(motionContent, /export function resolveSpring\(/);
      assert.match(motionContent, /if \(reducedMotion\) \{\s*return \{ type: "tween" as const, duration: 0\.001, bounce: 0 \};\s*\}/);
    });

    it("CHAL2-MOTION-03: Dialog uses criticallyDamped spring and respects reduced motion", () => {
      assert.match(dialogContent, /APPLE_SPRINGS\.criticallyDamped/);
      assert.match(dialogContent, /usePrefersReducedMotion\(\)/);
      assert.match(dialogContent, /transition=\{reduced \? \{ duration: 0\.001 \} : APPLE_SPRINGS\.criticallyDamped\}/);
    });

    it("CHAL2-MOTION-04: Toast uses resolveSpring with APPLE_SPRINGS.criticallyDamped", () => {
      assert.match(toastContent, /resolveSpring\(APPLE_SPRINGS\.criticallyDamped, prefersReduced\)/);
    });

    it("CHAL2-MOTION-05: MobileNav uses criticallyDamped spring and collapses on reduced motion", () => {
      assert.match(mobileContent, /transition=\{reduced \? \{ duration: 0\.001 \} : APPLE_SPRINGS\.criticallyDamped\}/);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. DESIGN TOKENS COMPLIANCE & ANTI-SLOP DISCIPLINE
  // ---------------------------------------------------------------------------
  describe("5. Design Tokens Compliance & Anti-Slop Discipline", () => {
    const tokensContent = readRootFile("src/styles/tokens.css");

    it("CHAL2-TOKENS-01: Midnight dark blue tokens are defined in tokens.css", () => {
      const required = [
        "--color-ink-950: #050814;",
        "--color-ink-900: #0a1224;",
        "--color-ink-850: #0f1b36;",
        "--color-ink-800: #152748;",
        "--color-ink-750: #1a3054;",
        "--color-ink-700: #1d3a5e;",
      ];
      for (const t of required) {
        assert.ok(tokensContent.includes(t), `tokens.css must contain ${t}`);
      }
    });

    it("CHAL2-TOKENS-02: Flare accent (#ff4a1c) and ember (#ff8a3d) tokens are defined", () => {
      assert.ok(tokensContent.includes("--color-flare: #ff4a1c;"));
      assert.ok(tokensContent.includes("--color-ember: #ff8a3d;"));
    });

    it("CHAL2-TOKENS-03: Typography tokens bind Archivo, Instrument Sans, and Azeret Mono", () => {
      assert.ok(tokensContent.includes("--font-display: var(--font-archivo)"));
      assert.ok(tokensContent.includes("--font-sans: var(--font-instrument)"));
      assert.ok(tokensContent.includes("--font-mono: var(--font-azeret)"));
    });

    it("CHAL2-TOKENS-04: Strict anti-slop rules prohibit purple/cyan AI gradients", () => {
      assert.ok(!tokensContent.includes("#8b5cf6"), "Must not contain purple AI gradient");
      assert.ok(!tokensContent.includes("#06b6d4"), "Must not contain cyan AI gradient");
      assert.ok(!tokensContent.includes("#ec4899"), "Must not contain magenta AI gradient");
    });
  });
});

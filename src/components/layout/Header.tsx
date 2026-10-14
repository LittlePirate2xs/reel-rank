/* ============================================================================
   Header — the top chrome.

   Client component: it reads the active route, watches scroll direction and
   owns the mobile drawer's open state.

   Three behaviours, in priority order:
   1. Over the hero it is fully transparent, so the headline is not boxed in.
      Past 40px it takes a hairline bottom border and a translucent ink
      backdrop with a blur — the blur is doing real work here, separating
      moving content from the nav labels, not decorating the bar.
   2. It retreats on scroll-down and returns on scroll-up using `transform`
      only, so nothing reflows mid-scroll.
   3. Reduced motion or a coarse pointer: no hide/show at all, only the
      border/blur change. A bar that slides away on a phone is a bug, and a
      bar that slides under reduced motion is an accessibility failure.
   ========================================================================= */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/primitives/Button";
import { Container } from "@/components/layout/Container";
import { MobileNav } from "@/components/layout/MobileNav";
import { nav, site } from "@/content/site";
import { cn } from "@/lib/cn";
import { useIsPointerFine, usePrefersReducedMotion } from "@/lib/hooks";

/** Scroll distance after which the bar stops being transparent. */
const SOLID_AT = 40;
/** Ignore jitter smaller than this when reading scroll direction. */
const DIRECTION_EPSILON = 6;

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header(): React.JSX.Element {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  const pointerFine = useIsPointerFine();

  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const lastY = useRef(0);
  const frame = useRef(0);
  const menuButton = useRef<HTMLButtonElement>(null);
  /** Suppresses the return-focus effect on first render. */
  const hasOpened = useRef(false);

  /* --- scroll: one rAF-throttled read, direction taken from a delta ------ */
  useEffect(() => {
    lastY.current = window.scrollY;

    const read = () => {
      frame.current = 0;
      const y = window.scrollY;
      setSolid(y > SOLID_AT);

      const delta = y - lastY.current;
      if (Math.abs(delta) < DIRECTION_EPSILON) return;
      // Never hide while the drawer is open, and never hide at the very top.
      if (y <= SOLID_AT) {
        setHidden(false);
      } else if (delta > 0 && !menuOpen) {
        setHidden(true);
      } else if (delta < 0) {
        setHidden(false);
      }
      lastY.current = y;
    };

    const onScroll = () => {
      if (frame.current !== 0) return;
      frame.current = window.requestAnimationFrame(read);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame.current !== 0) window.cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [menuOpen]);

  /* --- focus returns to the trigger whenever the drawer closes ----------- */
  useEffect(() => {
    if (menuOpen) {
      hasOpened.current = true;
      return;
    }
    if (!hasOpened.current) return;
    hasOpened.current = false;
    menuButton.current?.focus();
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);

  // Transform-only retreat: `translateY` on the bar, never height or `top`.
  const retreat = hidden && !menuOpen && !reducedMotion && pointerFine;

  return (
    <>
      <header
        className="sticky top-0 w-full"
        style={{ zIndex: "var(--z-header)" }}
      >
        <div
          className={cn(
            "relative transition-transform duration-[var(--dur-ui)] ease-glide motion-reduce:transition-none",
            retreat ? "-translate-y-full" : "translate-y-0",
          )}
        >
          {/* Legibility scrim over the hero. It fades out exactly when the
              solid backdrop arrives, so the two never stack. */}
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-950/70 to-transparent transition-opacity duration-[var(--dur-ui)] ease-soft motion-reduce:transition-none",
              solid ? "opacity-0" : "opacity-100",
            )}
          />

          <div
            className={cn(
              "relative border-b bg-ink-950/80 backdrop-blur-md transition-[border-color,background-color] duration-[var(--dur-ui)] ease-soft motion-reduce:transition-none",
              solid ? "border-[var(--line)]" : "border-transparent",
            )}
          >
            <Container className="flex h-[4.5rem] items-center justify-between gap-6">
              <Link
                href="/"
                className="u-press u-display shrink-0 text-[1.0625rem] leading-none tracking-[-0.02em] text-paper transition-colors duration-[var(--dur-fast)] ease-soft hoverable:hover:text-flare"
              >
                {site.wordmark}
              </Link>

              <nav aria-label="Primary" className="hidden lg:block">
                <ul className="flex items-center gap-6 xl:gap-8">
                  {nav.map((item) => {
                    const active = isActiveRoute(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "u-press relative py-2 font-mono text-micro uppercase tracking-widest",
                            "transition-colors duration-[var(--dur-fast)] ease-soft hoverable:hover:text-paper",
                            active ? "text-paper" : "text-ash",
                          )}
                        >
                          {item.label}
                          <span
                            aria-hidden="true"
                            className={cn(
                              "pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-flare transition-transform duration-[var(--dur-ui)] ease-swift motion-reduce:transition-none",
                              active ? "scale-x-100" : "scale-x-0",
                            )}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="flex items-center gap-2">
                <Button href="/contact" size="sm" arrow>
                  Start a brief
                </Button>

                <button
                  ref={menuButton}
                  type="button"
                  aria-expanded={menuOpen}
                  aria-controls={menuOpen ? "mobile-nav" : undefined}
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  onClick={toggleMenu}
                  className="u-press flex size-11 items-center justify-center rounded-sm text-paper transition-colors duration-[var(--dur-fast)] ease-soft hoverable:hover:text-flare lg:hidden"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 14"
                    width="20"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    {menuOpen ? (
                      <path d="M2 2 L18 12 M18 2 L2 12" />
                    ) : (
                      <path d="M0 2 H20 M0 7 H20 M0 12 H14" />
                    )}
                  </svg>
                </button>
              </div>
            </Container>
          </div>
        </div>
      </header>

      <MobileNav open={menuOpen} onClose={closeMenu} />
    </>
  );
}

/* ============================================================================
   MobileNav — the full-height drawer below `lg`.

   Client component. Portalled to <body>: the header it is triggered from
   carries `backdrop-blur`, which makes that element a containing block and
   would trap a `fixed` child inside the bar.

   Motion is pure CSS (`.u-drawer-*` in globals.css) — a predetermined
   entrance, so it belongs off the main thread rather than in Motion. The
   backdrop fades, the panel wipes down on the iOS drawer curve, and the items
   stagger 40ms apart. Each one is a keyframe animation rather than a
   transition, because the global reduced-motion rule neutralises transition
   durations but still lands a one-shot animation on its end state — under
   reduced motion the drawer is simply there.

   Accessibility is the whole game for a drawer: dialog semantics, a focus
   trap, Escape to close, a scroll lock, a backdrop that can only close, and a
   close-on-navigation so the trap can never strand anyone.
   ========================================================================= */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/primitives/Button";
import { nav, site } from "@/content/site";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion, useScrollLock } from "@/lib/hooks";
import { APPLE_SPRINGS } from "@/lib/motion";

export type MobileNavProps = { open: boolean; onClose: () => void };

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/** Beat before focus moves in, so it does not fight the panel's entrance. */
const FOCUS_AFTER_MS = 30;

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav({
  open,
  onClose,
}: MobileNavProps): React.JSX.Element | null {
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const initialPath = useRef(pathname);
  const [mounted, setMounted] = useState(false);
  const reduced = usePrefersReducedMotion();

  useScrollLock(open);

  // A portal needs a document; gate on mount so the server renders nothing.
  useEffect(() => setMounted(true), []);

  /* --- remember the trigger, then move focus into the drawer ------------ */
  useEffect(() => {
    if (!open || !mounted) return;
    const active = document.activeElement;
    restoreTo.current = active instanceof HTMLElement ? active : null;

    const timer = window.setTimeout(() => {
      const first = panel.current?.querySelector<HTMLElement>(
        FOCUSABLE_SELECTOR,
      );
      (first ?? panel.current)?.focus();
    }, FOCUS_AFTER_MS);

    return () => window.clearTimeout(timer);
  }, [open, mounted]);

  /* --- hand focus back to whatever opened the drawer -------------------- */
  useEffect(() => {
    if (open) return;
    const target = restoreTo.current;
    restoreTo.current = null;
    target?.focus();
  }, [open]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const stops = panel.current?.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTOR,
      );
      if (!stops || stops.length === 0) {
        event.preventDefault();
        return;
      }

      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || active === panel.current) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  /* --- a navigation makes the trap pointless, so close ------------------ */
  useEffect(() => {
    if (pathname === initialPath.current) return;
    initialPath.current = pathname;
    onClose();
  }, [pathname, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[var(--z-overlay)] lg:hidden">
          {/* Backdrop with AnimatePresence */}
          <motion.div
            key="mobile-nav-backdrop"
            aria-hidden="true"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: reduced ? { duration: 0.001 } : { duration: 0.2 },
            }}
            transition={reduced ? { duration: 0.001 } : APPLE_SPRINGS.criticallyDamped}
            className="absolute inset-0 size-full bg-ink-950/90 backdrop-blur-md"
          />

          <motion.div
            key="mobile-nav-panel"
            ref={panel}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label={`${site.name} menu`}
            tabIndex={-1}
            onKeyDown={onKeyDown}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.4 }}
            onDragEnd={(_e, info) => {
              if (info.velocity.y > 400 || info.offset.y > 100) {
                onClose();
              }
            }}
            initial={{ y: reduced ? 0 : "-100%", opacity: reduced ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{
              y: reduced ? 0 : "-100%",
              opacity: reduced ? 0 : 1,
              transition: reduced ? { duration: 0.001 } : APPLE_SPRINGS.criticallyDamped,
            }}
            transition={reduced ? { duration: 0.001 } : APPLE_SPRINGS.criticallyDamped}
            className="absolute inset-0 flex flex-col overflow-y-auto bg-ink-950"
          >
            <div className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-[var(--line)] px-[var(--shell-pad)]">
              <span className="u-display text-[1.0625rem] leading-none tracking-[-0.02em] text-paper">
                {site.wordmark}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="u-press -mr-2 flex size-11 items-center justify-center rounded-sm text-paper transition-colors duration-[var(--dur-fast)] ease-soft hoverable:hover:text-flare"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 3 L17 17 M17 3 L3 17" />
                </svg>
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 px-[var(--shell-pad)] py-8">
              <ul>
                {nav.map((item, index) => (
                  <li
                    key={item.href}
                    className="border-b border-[var(--line)]"
                    style={
                      { "--drawer-delay": `${index * 40}ms` } as React.CSSProperties
                    }
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "u-press block py-5 transition-colors duration-[var(--dur-fast)] ease-soft hoverable:hover:text-flare",
                        isActiveRoute(pathname, item.href)
                          ? "text-flare"
                          : "text-paper",
                      )}
                    >
                      <span className="u-display block text-[1.75rem] leading-[1.05] tracking-[-0.02em]">
                        {item.label}
                      </span>
                      {item.hint ? (
                        <span className="mt-1.5 block font-mono text-micro uppercase text-ash">
                          {item.hint}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="shrink-0 border-t border-[var(--line)] px-[var(--shell-pad)] py-6">
              <Button href="/contact" size="lg" arrow className="w-full">
                Start a brief
              </Button>
              <a
                href={`mailto:${site.email}`}
                className="mt-4 block font-mono text-micro uppercase text-ash transition-colors duration-[var(--dur-fast)] ease-soft hoverable:hover:text-paper"
              >
                {site.email}
              </a>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";
import { useMounted, usePrefersReducedMotion, useScrollLock } from "@/lib/hooks";
import { APPLE_SPRINGS, DUR, EASE } from "@/lib/motion";

/* ============================================================================
   Dialog — the one modal surface.

   Portalled into <body>, `aria-modal`, focus moved in and returned to whatever
   was focused before, Tab trapped, Escape and backdrop both close, page scroll
   locked with its position preserved by useScrollLock.

   Enter is opacity + scale(0.96) at --dur-panel; exit is faster, at --dur-fast.
   transform-origin stays centred — modals are the documented exception to
   origin-aware scaling. Returns null once the exit animation has finished.
   ========================================================================= */

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Visually hidden title is allowed; `title` is still required. */
  hideTitle?: boolean;
  children: React.ReactNode;
  className?: string;
  /** Max width utility, default "max-w-5xl". */
  size?: string;
};

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "video[controls]",
  "audio[controls]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function focusableWithin(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
}

export function Dialog({ open, onClose, title, hideTitle = false, children, className, size = "max-w-5xl" }: DialogProps) {
  const mounted = useMounted();
  const reduced = usePrefersReducedMotion();
  const titleId = useId();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const [exiting, setExiting] = useState(false);

  useScrollLock(open);

  /* Keep the portal mounted while the exit animation runs. */
  useEffect(() => {
    if (open) setExiting(true);
  }, [open]);

  const handleExitComplete = useCallback(() => setExiting(false), []);

  /* Focus in on open, back to the trigger on close. */
  useEffect(() => {
    if (!open || !mounted) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    const first = focusableWithin(panel).at(0);
    (first ?? panel)?.focus();
    return () => {
      previous?.focus();
    };
  }, [open, mounted]);

  /* Escape closes; Tab cycles inside the panel. */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const items = focusableWithin(panel);
      const first = items.at(0);
      const last = items.at(-1);
      if (!first || !last) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const active = document.activeElement;
      const inside = active instanceof Node && panel.contains(active);
      if (event.shiftKey) {
        if (!inside || active === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }
      if (!inside || active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted || (!open && !exiting)) return null;

  return createPortal(
    <AnimatePresence onExitComplete={handleExitComplete}>
      {open ? (
        <div key="dialog" className="fixed inset-0 z-[var(--z-overlay)]">
          <motion.div
            key="backdrop"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: reduced ? { duration: 0.001 } : { duration: DUR.fast, ease: EASE.swift },
            }}
            transition={reduced ? { duration: 0.001 } : APPLE_SPRINGS.criticallyDamped}
            className="pointer-events-none absolute inset-0 bg-ink-950/80 backdrop-blur-md"
          />

          <div className="absolute inset-0 overflow-y-auto overscroll-contain">
            <div
              className="flex min-h-full items-center justify-center p-4 sm:p-6"
              onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
              }}
            >
              <motion.div
                key="panel"
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: reduced ? 1 : 0.98,
                  transition: reduced ? { duration: 0.001 } : { duration: DUR.fast, ease: EASE.swift },
                }}
                transition={reduced ? { duration: 0.001 } : APPLE_SPRINGS.criticallyDamped}
                className={cn(
                  "relative w-full origin-center rounded-md border border-[color:var(--line)] bg-ink-900 p-5 text-paper sm:p-6",
                  size,
                  className,
                )}
              >
                <h2 id={titleId} className={cn("u-display text-2xl text-paper", hideTitle && "sr-only")}>
                  {title}
                </h2>
                <div className={hideTitle ? undefined : "mt-4"}>{children}</div>
              </motion.div>
            </div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

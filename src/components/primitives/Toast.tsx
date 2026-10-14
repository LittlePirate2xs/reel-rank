"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

import { APPLE_SPRINGS, resolveSpring } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

/* ============================================================================
   Toast — Apple-grade visual feedback notification primitive.

   Design Decisions:
   - Critically damped spring physics (APPLE_SPRINGS.criticallyDamped)
     matching WWDC Designing Fluid Interfaces specifications.
   - Respects prefers-reduced-motion via resolveSpring.
   - Strictly midnight dark blue tokens (bg-ink-900, line-strong, text-paper).
   - Accessible status announcement via role="status" and aria-live="polite".
   - Auto-dismiss with configurable duration (defaults to 2500ms).
   ========================================================================= */

export type ToastProps = {
  open: boolean;
  message: string;
  onClose?: () => void;
  duration?: number;
  icon?: React.ReactNode;
  className?: string;
};

export const DEFAULT_TOAST_DURATION = 2500;

export function Toast({
  open,
  message,
  onClose,
  duration = DEFAULT_TOAST_DURATION,
  icon,
  className,
}: ToastProps) {
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      onClose?.();
    }, duration);
    return () => window.clearTimeout(timer);
  }, [open, duration, onClose]);

  const spring = resolveSpring(APPLE_SPRINGS.criticallyDamped, prefersReduced);

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          role="status"
          aria-live="polite"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={spring}
            className={cn(
              "pointer-events-auto flex items-center gap-2.5 rounded-md",
              "border border-[color:var(--line-strong)] bg-ink-900/95 px-4 py-2.5",
              "shadow-2xl shadow-ink-950/80 backdrop-blur-md",
              className,
            )}
          >
            {icon ?? <Check aria-hidden className="size-4 shrink-0 text-flare" />}
            <span className="font-mono text-micro uppercase tracking-wider text-paper">
              {message}
            </span>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

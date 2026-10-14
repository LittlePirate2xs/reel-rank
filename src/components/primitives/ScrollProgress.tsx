"use client";

import { motion, useScroll, useSpring } from "motion/react";

import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { SPRING } from "@/lib/motion";

/* ============================================================================
   ScrollProgress — a 2px vermilion hairline along the top of the viewport.

   `scaleX` is bound to document scroll progress, so the bar costs one composited
   transform per frame and never touches layout. Under reduced motion the spring
   is skipped but the progress is still tracked: the position still changes,
   it just stops easing.
   ========================================================================= */

export type ScrollProgressProps = { className?: string };

export function ScrollProgress({ className }: ScrollProgressProps) {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothed = useSpring(scrollYProgress, SPRING.settle);

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: reduced ? scrollYProgress : smoothed }}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[var(--z-header)] h-0.5 origin-left bg-flare will-change-transform",
        className,
      )}
    />
  );
}

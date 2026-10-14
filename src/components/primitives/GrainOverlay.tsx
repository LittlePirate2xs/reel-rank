"use client";

import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/hooks";

/* ============================================================================
   GrainOverlay — the film texture, laid over the whole stage.

   `.u-grain` carries the tiled noise and its 4-step drift animation. It paints
   its texture in an `::after` at a fixed 0.05, so that is neutralised here and
   the `opacity` prop becomes the single source of truth for how strong the
   grain reads.

   Renders nothing under reduced motion.
   ========================================================================= */

export type GrainOverlayProps = { opacity?: number; className?: string };

export function GrainOverlay({ opacity = 0.05, className }: GrainOverlayProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) return null;

  return (
    <div
      aria-hidden
      style={{ opacity }}
      className={cn(
        "u-grain pointer-events-none fixed inset-0 z-[var(--z-overlay)] overflow-hidden mix-blend-overlay",
        "[&::after]:opacity-100",
        className,
      )}
    />
  );
}

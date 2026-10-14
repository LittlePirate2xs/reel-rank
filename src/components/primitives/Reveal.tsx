"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { useInViewOnce, useInViewToggle, usePrefersReducedMotion } from "@/lib/hooks";

export type RevealProps = {
  children: React.ReactNode;
  /** Element to render. Defaults to "div". */
  as?: React.ElementType;
  className?: string;
  /** Delay in ms. Use stagger(i). */
  delay?: number;
  /** Travel distance in px. Reduced motion forces 0. */
  y?: number;
  /** Add a 2px blur during the transition to bridge the crossfade. */
  blur?: boolean;
  once?: boolean;
  threshold?: number;
};

/**
 * CSS-based entrance. No Motion here on purpose: one IntersectionObserver
 * toggles `data-reveal`, and a named-property CSS transition on opacity +
 * translate (+ optional 2px blur) does the work off the main thread, so the
 * reveal stays interruptible and never blocks a scroll or a click.
 *
 * Progressive enhancement: the server renders this element VISIBLE. The
 * `.reveal` rules in globals.css only hide it once `html[data-js="on"]` is set
 * by the inline script in the layout, which runs before first paint. So a
 * blocked script, a failed chunk or a hydration error leaves a readable page
 * rather than a blank one, and there is no flash because nothing is ever
 * painted in the hidden state.
 */
export function Reveal({
  children,
  as,
  className,
  delay = 0,
  y = 14,
  blur = false,
  once = true,
  threshold = 0.15,
}: RevealProps) {
  const reduced = usePrefersReducedMotion();

  // Both hooks always run (hooks are unconditional) but only one ref is ever
  // attached, so only one observer is ever created.
  const onceView = useInViewOnce<HTMLElement>({ threshold, margin: "0px 0px -8% 0px" });
  const toggleView = useInViewToggle<HTMLElement>({ margin: "0px 0px -8% 0px" });

  const ref = once ? onceView.ref : toggleView.ref;
  const inView = once ? onceView.inView : toggleView.inView;

  const Component = (as ?? "div") as React.ElementType;

  const style = {
    // Reduced motion collapses the shift to 0, so nothing travels, and drops
    // the stagger entirely so every element is simply present. A stagger is
    // choreography; with the motion gone there is nothing left to sequence.
    "--reveal-shift": reduced ? "0px" : `${y}px`,
    "--reveal-delay": reduced ? "0ms" : `${delay}ms`,
  } as React.CSSProperties;

  return (
    <Component
      ref={ref}
      data-reveal={inView ? "on" : "off"}
      style={style}
      className={cn("reveal", blur && "reveal-blur", className)}
    >
      {children}
    </Component>
  );
}

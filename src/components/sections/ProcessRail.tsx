"use client";

import { useRef } from "react";
import { motion, useScroll } from "motion/react";

import { Reveal } from "@/components/primitives/Reveal";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { process, processIntro } from "@/content/process";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { stagger } from "@/lib/motion";

/* ============================================================================
   Process — the one genuinely ordered sequence on the site, so this is the one
   place numbering is allowed and expected.

   A hairline rule runs down the left of the list. Its vermilion portion is a
   scroll-linked `scaleY` bound to the section, anchored at the top, so the rail
   fills as the reader moves down the three steps.

   Scroll-linked motion is one of the few legitimate uses of Motion: it cannot
   be expressed as a CSS transition. Under reduced motion the rule is drawn
   fully filled and nothing is bound to scroll — the fill is information (how
   far through the sequence you are), so it is kept, not zeroed.
   ========================================================================= */

/* One geometry for the track and its fill, so the two can never drift apart. */
const RAIL = "absolute inset-y-0 left-0 w-px origin-top";

export function ProcessRail() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    /* Begin as the section enters; complete while the last step is still read. */
    offset: ["start 0.85", "end 0.45"],
  });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="process"
      className="section-y relative"
    >
      <div className="shell">
        <SectionHeading
          id="process"
          title={processIntro.heading}
          lead={processIntro.body}
          split
        />

        <div className="relative mt-14 sm:mt-20">
          {/* The track. */}
          <div aria-hidden className={cn(RAIL, "bg-ink-700")} />

          {/* The fill. Two render paths so reduced motion never carries a
              stale transform: bound to scroll, or drawn full. */}
          {reduced ? (
            <div aria-hidden className={cn(RAIL, "bg-flare")} />
          ) : (
            <motion.div
              aria-hidden
              style={{ scaleY: scrollYProgress }}
              className={cn(RAIL, "bg-flare")}
            />
          )}

          <ol className="grid gap-14 pl-8 sm:gap-20 sm:pl-16">
            {process.map((step, index) => (
              <Reveal as="li" key={step.id} delay={stagger(index, 70)}>
                <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
                  <div>
                    <h3 className="flex items-baseline gap-4 text-display-4 text-paper">
                      <span
                        aria-hidden
                        className="font-mono text-micro tabular-nums text-flare"
                      >
                        {String(step.index).padStart(2, "0")}
                      </span>
                      {step.title}
                    </h3>
                    <p className="u-measure mt-4 text-lead text-paper">
                      {step.body}
                    </p>
                  </div>

                  <p className="u-measure text-sm text-ash lg:pt-3">
                    {step.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

import { Divider } from "@/components/primitives/Divider";
import { Reveal } from "@/components/primitives/Reveal";
import { manifesto } from "@/content/process";
import { cn } from "@/lib/cn";
import { stagger } from "@/lib/motion";

/* ============================================================================
   Manifesto — three points, three different weights.

   The first point is set as editorial display type under a heavy rule. The
   other two are smaller, sit under one shared hairline and are offset from each
   other, so the group never reads as three identical cards.
   ========================================================================= */

export function Manifesto() {
  const [lead, ...rest] = manifesto.points;

  return (
    <section id="manifesto" className="section-y">
      <div className="shell grid gap-x-16 gap-y-14 lg:grid-cols-12">
        {/* Left: the heading carries the section. */}
        <div className="lg:col-span-5">
          <Reveal>
            <p className="u-eyebrow">{manifesto.eyebrow}</p>
          </Reveal>

          <Reveal delay={stagger(1)}>
            <h2 className="u-display mt-5 text-display-3 text-paper">
              {manifesto.heading}
            </h2>
          </Reveal>

          <Reveal className="mt-8" delay={stagger(2)}>
            <Divider accent />
          </Reveal>
        </div>

        {/* Right: asymmetric. */}
        <div className="lg:col-span-7">
          <Reveal delay={stagger(2)}>
            <div className="border-t-2 border-ink-500 pt-7">
              <h3 className="u-display text-display-4 text-paper">
                {lead.title}
              </h3>
              <p className="u-measure mt-5 text-lead text-paper">
                {lead.body}
              </p>
            </div>
          </Reveal>

          <Reveal delay={stagger(3)}>
            <div className="mt-14 grid gap-x-12 gap-y-10 border-t border-ink-700 pt-8 sm:grid-cols-2">
              {rest.map((point, i) => (
                <div key={point.id} className={cn(i === 1 && "sm:mt-14")}>
                  <h3 className="font-display text-lg font-extrabold text-paper">
                    {point.title}
                  </h3>
                  <p className="mt-3 text-base text-ash">{point.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

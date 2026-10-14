import { Accordion } from "@/components/primitives/Accordion";
import { Reveal } from "@/components/primitives/Reveal";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { faq, faqIntro } from "@/content/faq";

/* ============================================================================
   Questions — heading on the left (sticky at lg), accordion on the right.

   The accordion is placed, never restyled: it owns its own markup, its own
   disclosure semantics and its own reduced-motion behaviour.

   Heading copy lives in `faqIntro` in `@/content/faq`, shared with the contact
   route so the two can never drift.
   ========================================================================= */

export function FaqSection() {
  return (
    <section aria-labelledby="faq" className="section-y">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            id="faq"
            eyebrow={faqIntro.eyebrow}
            title={faqIntro.heading}
            split
          />
        </div>

        <Reveal>
          <Accordion items={faq} defaultOpenId={faq[0]?.id} />
        </Reveal>
      </div>
    </section>
  );
}

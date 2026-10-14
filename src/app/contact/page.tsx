import type { Metadata } from "next";
import { Suspense } from "react";
import { InquiryForm } from "@/components/contact/InquiryForm";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { SplitText } from "@/components/primitives/SplitText";
import { Accordion } from "@/components/primitives/Accordion";
import { Reveal } from "@/components/primitives/Reveal";
import { Divider } from "@/components/primitives/Divider";
import { Tag } from "@/components/primitives/Tag";
import { faq, faqIntro } from "@/content/faq";
import { process } from "@/content/process";
import { site, contactIntro } from "@/content/site";
import { pageMetadata, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Start a brief",
  description:
    "Drop an idea and we come back with an initial example in one day. Tell us what you want to make, who it is for and where it will run.",
  path: "/contact",
  keywords: ["motion graphics quote Houston", "video ad brief", "start a project"],
});

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }}
      />

      {/* ---- Opening -------------------------------------------------- */}
      <section className="relative overflow-hidden pt-40 pb-20 sm:pt-48">
        <div className="shell">
          <Tag tone="flare">{contactIntro.tag}</Tag>

          <h1 className="mt-8 text-display-2">
            <SplitText text={contactIntro.heading} immediate />
          </h1>

          <p className="u-measure mt-8 text-lead text-ash">{contactIntro.lead}</p>

          <dl className="mt-12 grid gap-8 border-t border-ink-700 pt-8 sm:grid-cols-3">
            {contactIntro.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="u-eyebrow">{fact.label}</dt>
                <dd className="mt-2 text-paper">{fact.value}</dd>
              </div>
            ))}
            <div>
              <dt className="u-eyebrow">Direct</dt>
              <dd className="mt-2">
                <a
                  href={`mailto:${site.email}`}
                  className="text-paper underline decoration-ink-600 underline-offset-4 transition-colors duration-200 ease-swift hoverable:hover:decoration-flare"
                >
                  {site.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <Divider />

      {/* ---- Form ----------------------------------------------------- */}
      <section className="section-y" aria-labelledby="brief">
        <div className="shell grid gap-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              id="brief"
              eyebrow="The brief"
              title={
                <>
                  What are we
                  <br />
                  <span className="text-flare">making?</span>
                </>
              }
              lead="Everything below is optional except your idea, your name and your email. The more you tell us, the closer the first example lands."
            />

            <ol className="mt-12 grid gap-8">
              {process.map((step) => (
                <li key={step.id} className="flex gap-5">
                  <span
                    aria-hidden
                    className="mt-1 font-mono text-micro tabular-nums text-flare"
                  >
                    {String(step.index).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-extrabold uppercase tracking-tight text-paper">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-ash">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Reveal>
            <Suspense fallback={<div className="p-8 text-ash">Loading inquiry form...</div>}>
              <InquiryForm />
            </Suspense>
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ---- Questions ------------------------------------------------ */}
      <section className="section-y" aria-labelledby="questions">
        <div className="shell grid gap-16 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-24">
          <SectionHeading
            id="questions"
            eyebrow={faqIntro.eyebrow}
            title={faqIntro.heading}
          />
          <Accordion items={faq} defaultOpenId={faq[0]?.id} />
        </div>
      </section>
    </>
  );
}

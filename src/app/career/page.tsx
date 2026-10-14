import type { Metadata } from "next";
import { CareerTier } from "@/components/career/CareerTier";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { SplitText } from "@/components/primitives/SplitText";
import { Reveal } from "@/components/primitives/Reveal";
import { Divider } from "@/components/primitives/Divider";
import { Button } from "@/components/primitives/Button";
import { Tag } from "@/components/primitives/Tag";
import { Accordion } from "@/components/primitives/Accordion";
import { careerTiers, careerCommitments, careerBio } from "@/content/offers";
import { site } from "@/content/site";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Career services",
  description:
    "Interview video, résumé editing, work portfolio creation and tech and AI interview preparation with Manny Singh. Packages from $500, including the $1,500 complete package.",
  path: "/career",
  keywords: [
    "interview video",
    "resume editing Houston",
    "tech interview preparation",
    "career package",
  ],
});

const careerFaq = [
  {
    id: "career-package",
    q: "What does the $1,500 package actually guarantee?",
    a: careerCommitments.guarantee,
  },
  {
    id: "career-not-guaranteed",
    q: "What is not guaranteed?",
    a: careerCommitments.disclaimer,
  },
  {
    id: "career-how",
    q: "How does the work happen?",
    a: "Through video calls and on-site sessions, by arrangement. We start by agreeing the scope, the deliverables and the timing, then work through them together. As things change, we adjust the strategy with you.",
  },
  {
    id: "career-who",
    q: "Who will I be working with?",
    a: `Manny Singh, who founded ${site.name}. He has worked for Salesforce, United Airlines, Banco Santander and Morgan Stanley, on government contracts and in logistics, and has led technology teams.`,
  },
];

export default function CareerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Career services", path: "/career" },
            ]),
          ),
        }}
      />

      {/* ---- Opening -------------------------------------------------- */}
      <section className="relative overflow-hidden pt-40 pb-16 sm:pt-48">
        <div className="shell">
          <Tag tone="flare">Personal support</Tag>

          <h1 className="mt-8 text-display-2">
            <SplitText text="Hey, I'm Manny." immediate />
          </h1>

          <p className="u-measure mt-8 text-lead text-ash">
            Tell your story. Show your work. Prepare for the conversation. Then
            walk in knowing what you are going to say.
          </p>
        </div>
      </section>

      <Divider />

      {/* ---- Manny ----------------------------------------------------- */}
      <section className="section-y" aria-labelledby="manny">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="u-eyebrow">The person you work with</p>
            <h2 id="manny" className="u-display mt-4 text-display-3">
              {site.foundedBy}
            </h2>
            <p className="mt-3 font-mono text-sm uppercase tracking-[0.16em] text-flare">
              Founder, {site.name}
            </p>

            <div className="mt-8 rounded-lg border border-ink-700 bg-ink-900 p-6">
              <p className="u-eyebrow">The commitment</p>
              <p className="mt-3 text-paper">{careerCommitments.guarantee}</p>
              <p className="mt-4 border-t border-ink-700 pt-4 text-sm text-ash">
                {careerCommitments.disclaimer}
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {careerBio.map((paragraph, i) => (
              <Reveal key={paragraph.slice(0, 24)} delay={i * 70}>
                <p className="u-measure text-lg text-paper">{paragraph}</p>
              </Reveal>
            ))}

            <Reveal delay={careerBio.length * 70}>
              <p className="u-measure text-ash">{careerCommitments.scope}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <Divider />

      {/* ---- Packages --------------------------------------------------- */}
      <section className="section-y" aria-labelledby="packages">
        <div className="shell">
          <SectionHeading
            id="packages"
            eyebrow="Three packages"
            title="Pick the level of help you need"
            lead="All prices are in USD. Each package is agreed before work starts."
          />

          <div className="mt-14 grid gap-8">
            {careerTiers.map((tier, i) => (
              // CareerTier owns its own entrance; wrapping it in Reveal would
              // stack two opacity+translate transitions per tier.
              <CareerTier key={tier.slug} tier={tier} index={i} />
            ))}
          </div>

          <div className="mt-14">
            <Button href="/contact" size="lg" arrow>
              Let&rsquo;s talk
            </Button>
          </div>
        </div>
      </section>

      <Divider />

      {/* ---- Questions -------------------------------------------------- */}
      <section className="section-y" aria-labelledby="career-questions">
        <div className="shell grid gap-16 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-24">
          <SectionHeading
            id="career-questions"
            eyebrow="Straight answers"
            title="Questions worth asking"
          />
          <Accordion items={careerFaq} defaultOpenId={careerFaq[0]?.id} />
        </div>
      </section>
    </>
  );
}

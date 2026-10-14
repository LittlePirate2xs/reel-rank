import type { Metadata } from "next";
import { TeamWall } from "@/components/sections/TeamWall";
import { ProcessRail } from "@/components/sections/ProcessRail";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { SplitText } from "@/components/primitives/SplitText";
import { MediaFrame } from "@/components/primitives/MediaFrame";
import { Reveal } from "@/components/primitives/Reveal";
import { Divider } from "@/components/primitives/Divider";
import { Button } from "@/components/primitives/Button";
import { Tag } from "@/components/primitives/Tag";
import { manifesto } from "@/content/process";
import { disciplines, site } from "@/content/site";
import { studioStills } from "@/lib/media";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "The studio",
  description:
    "Reel & Rank is a dedicated team of three based in Houston, founded by Manny Singh. Motion graphics, video and search strategy under one roof.",
  path: "/about",
  keywords: ["Houston creative studio", "motion graphics team", "Manny Singh"],
});

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "The studio", path: "/about" },
            ]),
          ),
        }}
      />

      {/* ---- Opening -------------------------------------------------- */}
      <section className="relative overflow-hidden pt-40 pb-16 sm:pt-48">
        <div className="shell">
          <Tag tone="flare">{site.location.label}</Tag>

          <h1 className="mt-8 text-display-2">
            <SplitText text="Three people. One roof." immediate />
          </h1>

          <p className="u-measure mt-8 text-lead text-ash">
            {site.tagline} Personal attention is how we work, and it is the whole
            reason a team this size is worth hiring.
          </p>
        </div>
      </section>

      <Divider />

      <TeamWall />

      <Divider />

      {/* ---- What we do ------------------------------------------------ */}
      <section className="section-y" aria-labelledby="disciplines">
        <div className="shell">
          <SectionHeading
            id="disciplines"
            eyebrow="Four disciplines"
            title="Joined up, not bolted on"
            lead="Most studios do one of these. The interesting work happens where they meet: a film that knows how it will be found, and a search strategy that knows what the brand sounds like."
          />

          <ul className="mt-14 grid gap-px border-t border-ink-700 sm:grid-cols-2">
            {disciplines.map((item, i) => (
              <Reveal as="li" key={item.id} delay={i * 60}>
                <div className="border-b border-ink-700 py-8 sm:pr-10">
                  <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-paper">
                    {item.label}
                  </h3>
                  <p className="u-measure mt-3 text-ash">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- Studio stills --------------------------------------------- */}
      <section className="pb-8" aria-label="Inside the studio">
        <div className="shell">
          <div className="grid gap-4 sm:grid-cols-3">
            {studioStills.map((still, i) => (
              <Reveal key={still.id} delay={i * 70}>
                <MediaFrame
                  asset={still}
                  ratio="3 / 2"
                  className="rounded-md"
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      <ProcessRail />

      <Divider />

      {/* ---- How we work ------------------------------------------------ */}
      <section className="section-y" aria-labelledby="how">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-24">
          <SectionHeading
            id="how"
            eyebrow={manifesto.eyebrow}
            title={manifesto.heading}
          />

          <dl className="grid gap-10">
            {manifesto.points.map((point, i) => (
              <Reveal key={point.id} delay={i * 70}>
                <div className="border-t border-ink-700 pt-6">
                  <dt className="font-display text-lg font-extrabold uppercase tracking-tight text-paper">
                    {point.title}
                  </dt>
                  <dd className="u-measure mt-3 text-ash">{point.body}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <Divider />

      {/* ---- Closing ---------------------------------------------------- */}
      <section className="section-y">
        <div className="shell">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <p className="u-eyebrow">Next</p>
                <h2 className="u-display mt-4 text-display-3">
                  Tell us what
                  <br />
                  <span className="text-flare">you have in mind.</span>
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button href="/contact" size="lg" arrow>
                  Start a brief
                </Button>
                <Button href="/offers" variant="outline" size="lg">
                  See the offers
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

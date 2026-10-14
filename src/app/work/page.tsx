import type { Metadata } from "next";
import { WorkGrid } from "@/components/work/WorkGrid";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { SplitText } from "@/components/primitives/SplitText";
import { Tag } from "@/components/primitives/Tag";
import { work } from "@/content/work";
import { site } from "@/content/site";
import { pageMetadata, breadcrumbJsonLd, allWorkVideosJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description:
    "Motion graphics, films, advertisements and campaigns from Reel & Rank in Houston. Founder-owned RamanRasa creative, presented as portfolio work rather than client testimonials.",
  path: "/work",
  keywords: ["motion graphics portfolio", "video ad examples", "Houston video studio work"],
});

export default function WorkPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Work", path: "/work" },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(allWorkVideosJsonLd(work)),
        }}
      />

      <section className="relative overflow-hidden pt-40 pb-16 sm:pt-48">
        <div className="shell">
          <Tag tone="flare">Creative in motion</Tag>

          <h1 className="mt-8 text-display-2">
            <SplitText text="Ordinary is not the assignment." immediate />
          </h1>

          <p className="u-measure mt-8 text-lead text-ash">
            Characters, colour and a point of view. Everything here is
            RamanRasa, founder Manny Singh&rsquo;s own brand. It is
            AI-assisted creative shown as portfolio work, not as client
            testimonials or performance case studies.
          </p>
        </div>
      </section>

      <section className="section-y pt-0" aria-labelledby="work-index">
        <div className="shell">
          <SectionHeading
            id="work-index"
            eyebrow={`${work.length} projects`}
            title="Selected work"
            lead="Filter by what you are looking for, or scroll the lot."
          />
          <div className="mt-14">
            <WorkGrid items={work} />
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="shell">
          <p className="u-measure text-sm text-ash-dim">
            Interested in something you have seen here, or something adjacent to
            it? {site.foundedBy} and the team work from {site.location.label}.
          </p>
        </div>
      </section>
    </>
  );
}

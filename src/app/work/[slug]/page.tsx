import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignSeries } from "@/components/work/CampaignSeries";
import { Button } from "@/components/primitives/Button";
import { Tag } from "@/components/primitives/Tag";
import { Reveal } from "@/components/primitives/Reveal";
import { Divider } from "@/components/primitives/Divider";
import { work, getWork } from "@/content/work";
import { pageMetadata, breadcrumbJsonLd, workVideosJsonLd } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return work.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const item = getWork(slug);

  if (!item) {
    return pageMetadata({
      title: "Work not found",
      description: "That piece is not in the index.",
      path: `/work/${slug}`,
    });
  }

  return pageMetadata({
    title: item.title,
    description: item.summary,
    path: `/work/${item.slug}`,
    type: "article",
    keywords: [item.title, item.kind, "Houston", "motion graphics"],
  });
}

export default async function WorkDetailPage({ params }: Params) {
  const { slug } = await params;
  const item = getWork(slug);

  if (!item) notFound();

  const kindLabel =
    item.kind === "ad"
      ? "Advertisement"
      : item.kind === "motion"
        ? "Motion graphics"
        : item.kind === "campaign"
          ? "Campaign"
          : "Film";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Work", path: "/work" },
              { name: item.title, path: `/work/${item.slug}` },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(workVideosJsonLd(item)),
        }}
      />

      {/* ---- Opening -------------------------------------------------- */}
      <section className="relative overflow-hidden pt-40 pb-14 sm:pt-48">
        <div className="shell">
          <div className="flex flex-wrap items-center gap-3">
            <Tag tone="flare">{kindLabel}</Tag>
            <Tag tone="ash">{item.year}</Tag>
          </div>

          <h1 className="u-display mt-8 text-display-2">{item.title}</h1>

          <p className="u-measure mt-6 text-lead text-flare">{item.hook}</p>

          <p className="u-measure mt-8 text-ash">{item.summary}</p>

          <div className="mt-12 grid gap-8 border-t border-ink-700 pt-8 sm:grid-cols-3">
            <div>
              <p className="u-eyebrow">Collection</p>
              <p className="mt-2 text-paper">{item.client}</p>
            </div>
            <div>
              <p className="u-eyebrow">Credits</p>
              <p className="mt-2 text-paper">{item.credit}</p>
            </div>
            <div>
              <p className="u-eyebrow">Services</p>
              <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                {item.services.map((service) => (
                  <li key={service} className="text-paper after:content-['·'] after:ml-2 last:after:content-none">
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {item.founderOwned ? (
            <p className="u-measure mt-8 text-sm text-ash-dim">
              This is founder-owned portfolio work, not an independent client
              endorsement or a performance case study.
            </p>
          ) : null}
        </div>
      </section>

      <Divider />

      {/* ---- The films ------------------------------------------------- */}
      <section className="section-y" aria-labelledby="films">
        <div className="shell">
          <h2 id="films" className="sr-only">
            {item.films.length > 1 ? "The films" : "The film"}
          </h2>
          <CampaignSeries item={item} />
        </div>
      </section>

      <Divider />

      {/* ---- Next step ------------------------------------------------- */}
      <section className="section-y">
        <div className="shell">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <p className="u-eyebrow">Your turn</p>
                <h2 className="u-display mt-4 text-display-3">
                  Something like this,
                  <br />
                  <span className="text-flare">for your idea.</span>
                </h2>
                <p className="u-measure mt-6 text-ash">
                  Drop a rough thought and we come back with an initial example
                  in one day.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button href="/contact" size="lg" arrow>
                  Start a brief
                </Button>
                <Button href="/work" variant="outline" size="lg">
                  More work
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

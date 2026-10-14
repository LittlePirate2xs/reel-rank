import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/primitives/Button";
import { Tag } from "@/components/primitives/Tag";
import { Reveal } from "@/components/primitives/Reveal";
import { Divider } from "@/components/primitives/Divider";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { PriceTag } from "@/components/offers/PriceTag";
import { offers, getOffer, offersByOrder } from "@/content/offers";
import { pageMetadata, breadcrumbJsonLd, baseUrl } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return offers.map((offer) => ({ slug: offer.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const offer = getOffer(slug);

  if (!offer) {
    return pageMetadata({
      title: "Offer not found",
      description: "That offer is not on the list.",
      path: `/offers/${slug}`,
    });
  }

  return pageMetadata({
    title: `${offer.name} — ${offer.price}`,
    description: `${offer.tagline} ${offer.description}`.slice(0, 300),
    path: `/offers/${offer.slug}`,
    keywords: [offer.name, offer.tagline, "Houston", "Reel & Rank"],
  });
}

export default async function OfferDetailPage({ params }: Params) {
  const { slug } = await params;
  const offer = getOffer(slug);

  if (!offer) notFound();

  const others = offersByOrder.filter((o) => o.slug !== offer.slug);

  const offerJsonLd = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "@id": `${baseUrl}/offers/${offer.slug}#offer`,
    name: offer.name,
    description: offer.description,
    priceCurrency: "USD",
    price: offer.priceFrom,
    url: `${baseUrl}/offers/${offer.slug}`,
    seller: {
      "@type": "ProfessionalService",
      "@id": `${baseUrl}/#studio`,
      name: "Reel & Rank",
    },
    itemOffered: {
      "@type": "Service",
      name: offer.name,
      description: offer.directAnswer,
      provider: { "@id": `${baseUrl}/#studio` },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Offers", path: "/offers" },
              { name: offer.name, path: `/offers/${offer.slug}` },
            ]),
          ),
        }}
      />

      {/* ---- Opening -------------------------------------------------- */}
      <section className="relative overflow-hidden pt-40 pb-16 sm:pt-48">
        <div className="shell">
          <nav aria-label="Breadcrumb" className="u-eyebrow">
            <ol className="flex items-center gap-2">
              <li>
                <Link
                  href="/offers"
                  className="transition-colors duration-200 ease-swift hoverable:hover:text-paper"
                >
                  Offers
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-ash-dim">{offer.name}</li>
            </ol>
          </nav>

          <h1 className="u-display mt-8 max-w-[18ch] text-display-2">
            {offer.tagline}
          </h1>

          <div className="mt-10">
            <PriceTag price={offer.price} unit={offer.unit} size="lg" />
          </div>

          <div className="mt-8 max-w-3xl rounded-lg border border-ink-700 bg-ink-900/60 p-6 sm:p-8">
            <p className="u-eyebrow text-flare">Direct answer & deliverables</p>
            <p className="mt-3 text-base leading-relaxed text-paper">
              {offer.directAnswer}
            </p>
          </div>

          <p className="u-measure mt-8 text-lead text-ash">{offer.description}</p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/contact" size="lg" arrow>
              Start a brief
            </Button>
            <Button href="/work" variant="outline" size="lg">
              See the work
            </Button>
          </div>
        </div>
      </section>

      <Divider />

      {/* ---- Detail ---------------------------------------------------- */}
      <section className="section-y">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-24">
          <div>
            <h2 className="u-display text-display-4">What you get</h2>
            <ul className="mt-8 grid gap-4 border-t border-ink-700 pt-8">
              {offer.deliverables.map((item, i) => (
                <li key={item} className="flex gap-4">
                  <span
                    aria-hidden
                    className="mt-[0.45em] block h-px w-6 shrink-0 bg-flare"
                  />
                  <span className="flex-1 text-paper">{item}</span>
                  <span className="sr-only">Deliverable {i + 1}</span>
                </li>
              ))}
            </ul>

            {offer.commitments.length > 0 ? (
              <div className="mt-12">
                <h3 className="u-eyebrow">What we commit to</h3>
                <ul className="mt-4 grid gap-3">
                  {offer.commitments.map((c) => (
                    <li key={c} className="u-measure text-paper">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {offer.disclaimers.length > 0 ? (
              <div className="mt-10 border-t border-ink-700 pt-6">
                <h3 className="u-eyebrow">What we do not promise</h3>
                <ul className="mt-4 grid gap-3">
                  {offer.disclaimers.map((d) => (
                    <li key={d} className="u-measure text-ash">
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <Reveal>
            <dl className="grid gap-8 rounded-lg border border-ink-700 bg-ink-900 p-8">
              <div>
                <dt className="u-eyebrow">Best for</dt>
                <dd className="mt-2 text-paper">{offer.bestFor}</dd>
              </div>
              <div>
                <dt className="u-eyebrow">First response</dt>
                <dd className="mt-2 text-paper">{offer.turnaround}</dd>
              </div>
              <div>
                <dt className="u-eyebrow">Price</dt>
                <dd className="mt-2">
                  <PriceTag price={offer.price} unit={offer.unit} size="sm" />
                </dd>
              </div>
              <div>
                <dt className="u-eyebrow">Tier</dt>
                <dd className="mt-2">
                  <Tag tone={offer.tier === "flagship" ? "flare" : "outline"}>
                    {offer.tier === "flagship" ? "Flagship" : "Entry"}
                  </Tag>
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ---- Other offers ---------------------------------------------- */}
      <section className="section-y">
        <div className="shell">
          <SectionHeading
            eyebrow="Also available"
            title="The rest of the ladder"
            action={
              <Button href="/offers" variant="outline">
                All offers
              </Button>
            }
          />

          <ul className="mt-12 grid gap-px border-t border-ink-700 pt-2 sm:grid-cols-2">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/offers/${other.slug}`}
                  data-cursor="hover"
                  className="group flex items-baseline justify-between gap-6 border-b border-ink-700 py-6 transition-[transform,border-color] duration-200 ease-swift hoverable:hover:translate-x-1 hoverable:hover:border-flare/60"
                >
                  <span className="font-display text-lg font-extrabold uppercase tracking-tight text-paper">
                    {other.name}
                  </span>
                  <span className="font-mono text-sm tabular-nums text-ash">
                    {other.price}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

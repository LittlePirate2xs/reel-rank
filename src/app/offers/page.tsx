import type { Metadata } from "next";
import { OfferRow } from "@/components/offers/OfferRow";
import { OfferPanel } from "@/components/offers/OfferPanel";
import { SearchStack } from "@/components/offers/SearchStack";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { SplitText } from "@/components/primitives/SplitText";
import { Divider } from "@/components/primitives/Divider";
import { Tag } from "@/components/primitives/Tag";
import { Button } from "@/components/primitives/Button";
import { offersByOrder, offersDirectAnswer } from "@/content/offers";
import { ScopeEstimator } from "@/components/offers/ScopeEstimator";
import { ESTIMATOR_COPY } from "@/content/estimator";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Offers and prices",
  description:
    "Motion graphics from $250, a 15-second advertisement for $500, an advertisement up to one minute for $1,000, search visibility from $1,000 and selling campaigns from $2,000.",
  path: "/offers",
  keywords: [
    "motion graphics price",
    "video ad cost Houston",
    "SEO GEO AEO pricing",
    "selling campaign pricing",
  ],
});

export default function OffersPage() {
  const entry = offersByOrder.filter((o) => o.tier === "entry");
  const flagship = offersByOrder.filter((o) => o.tier === "flagship");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Offers", path: "/offers" },
            ]),
          ),
        }}
      />

      {/* ---- Opening -------------------------------------------------- */}
      <section className="relative overflow-hidden pt-40 pb-16 sm:pt-48">
        <div className="shell">
          <Tag tone="flare">All prices in USD</Tag>

          <h1 className="mt-8 text-display-2">
            <SplitText text="Big on ideas. Clear on the offer." immediate />
          </h1>

          <p className="u-measure mt-8 text-lead text-ash">
            Something quick, something cinematic, or the strategy that connects
            it all. Pick a starting point. We agree the scope before production
            begins, so there is nothing to discover halfway through.
          </p>

          <div className="mt-10 max-w-3xl rounded-lg border border-ink-700 bg-ink-900/60 p-6 sm:p-8">
            <p className="u-eyebrow text-flare">Studio summary & rates</p>
            <p className="mt-3 text-base leading-relaxed text-paper">
              {offersDirectAnswer}
            </p>
          </div>
        </div>
      </section>

      <Divider />

      {/* ---- The ladder ------------------------------------------------ */}
      <section className="section-y" aria-labelledby="ladder">
        <div className="shell">
          <SectionHeading
            id="ladder"
            eyebrow="Start small"
            title="A first impression, priced honestly"
            lead="Three offers you can start with today. Each one comes with an initial example within one working day."
          />

          <ul className="mt-14 border-t border-ink-700">
            {entry.map((offer, i) => (
              // OfferRow owns its own entrance, so the <li> must not add a
              // second one: two stacked opacity+translate transitions would
              // double the travel.
              <li key={offer.slug}>
                <OfferRow offer={offer} index={i} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- Flagship -------------------------------------------------- */}
      <section className="section-y pt-0" aria-labelledby="flagship">
        <div className="shell">
          <SectionHeading
            id="flagship"
            eyebrow="Go further"
            title="Strategy and campaigns"
            lead="Two larger engagements. Scope, channels and deliverables are agreed around your goals, in writing, before work starts."
          />

          <div className="mt-14 grid gap-8">
            {flagship.map((offer) => (
              <OfferPanel key={offer.slug} offer={offer} />
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ---- Scope Estimator ------------------------------------------- */}
      <section className="section-y" aria-labelledby="scope-estimator">
        <div className="shell">
          <SectionHeading
            id="scope-estimator"
            eyebrow={ESTIMATOR_COPY.eyebrow}
            title={ESTIMATOR_COPY.title}
            lead={ESTIMATOR_COPY.lead}
          />
          <div className="mt-14">
            <ScopeEstimator mode="standalone" />
          </div>
        </div>
      </section>

      <Divider />

      {/* ---- The three search disciplines ------------------------------ */}
      <section className="section-y" aria-labelledby="search-stack">
        <div className="shell">
          <SectionHeading
            id="search-stack"
            eyebrow="Search visibility"
            title="Three ways people find you now"
            lead="Search engines still matter. So do the generative engines that write answers, and the answer engines that give one directly. We work on all three."
          />
          <div className="mt-14">
            <SearchStack />
          </div>
        </div>
      </section>

      <Divider />

      {/* ---- Not covered ---------------------------------------------- */}
      <section className="section-y">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="u-eyebrow">Outside these offers</p>
            <h2 className="u-display mt-4 text-display-3">
              Bring the idea
              <br />
              <span className="text-flare">anyway.</span>
            </h2>
          </div>

          <div>
            <p className="text-ash">
              Product ads, brand stories, explainers, social video or TV
              commercial creative are all possible. Any additional scope and
              price are agreed before work starts. TV airtime and media buying
              are separate.
            </p>

            <dl className="mt-8 grid gap-6 border-t border-ink-700 pt-6">
              <div>
                <dt className="u-eyebrow">Included in every offer</dt>
                <dd className="mt-2 text-paper">
                  The brief, deliverables, formats and timing, agreed before
                  production starts.
                </dd>
              </div>
              <div>
                <dt className="u-eyebrow">Not included</dt>
                <dd className="mt-2 text-paper">
                  Media buying and ad spend, unless separately agreed. TV
                  airtime is always separate.
                </dd>
              </div>
            </dl>

            <div className="mt-10">
              <Button href="/contact" size="lg" arrow>
                Start a brief
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

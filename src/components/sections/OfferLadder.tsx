import Link from "next/link";

import { Divider } from "@/components/primitives/Divider";
import { Reveal } from "@/components/primitives/Reveal";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { offersByOrder } from "@/content/offers";
import { nav } from "@/content/site";
import { cn, pad, usd } from "@/lib/cn";
import { stagger } from "@/lib/motion";

/* ============================================================================
   OfferLadder — deliberately unequal weight.

   The entry offers are a compact list: order, name, tagline, price, one row
   each. The flagship offers open as full-width panels with the description,
   the deliverables and — verbatim and visible, because they are contractual —
   every commitment and disclaimer. Prices are named by the client, never
   reassembled.
   ========================================================================= */

const offersNav = nav.find((item) => item.href === "/offers");

export function OfferLadder() {
  const entry = offersByOrder.filter((offer) => offer.tier === "entry");
  const flagship = offersByOrder.filter((offer) => offer.tier === "flagship");
  const floorPrice = entry.length > 0 ? usd(entry[0].priceFrom) : null;

  return (
    <section id="offers" className="section-y">
      <div className="shell">
        <SectionHeading eyebrow={offersNav?.label} title={offersNav?.hint} />

        {/* Entry tier — one row per offer, separated by hairlines. */}
        <ul className="mt-14 border-t border-ink-700">
          {entry.map((offer, i) => (
            <Reveal
              as="li"
              key={offer.slug}
              delay={stagger(i)}
              className="group"
            >
              <Link
                href={`/offers/${offer.slug}`}
                data-cursor="hover"
                className={cn(
                  "grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-4 py-6",
                  "border-b border-ink-700",
                  "transition-colors duration-200 ease-swift",
                  "hoverable:group-hover:border-ink-500",
                  "sm:grid-cols-[3.5rem_1fr_auto] sm:gap-x-8",
                )}
              >
                <span className="font-mono text-sm tabular-nums text-ash">
                  {pad(offer.order)}
                </span>

                <span className="min-w-0">
                  <span className="block font-display text-xl leading-snug font-extrabold text-paper">
                    {offer.name}
                  </span>
                  <span className="mt-1.5 block text-base text-ash">
                    {offer.tagline}
                  </span>
                </span>

                <span className="font-mono text-lg tabular-nums text-paper">
                  {offer.price}
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>

        {/* Flagship tier — full-width panels with room to breathe. */}
        <div className="mt-20 flex flex-col gap-8 lg:mt-24 lg:gap-10">
          {flagship.map((offer, i) => (
            <Reveal key={offer.slug} delay={stagger(i, 80)} threshold={0.05}>
              <article className="rounded-md bg-ink-900 p-7 sm:p-10 lg:p-14">
                <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                    <h3 className="u-display text-display-3 text-paper">
                      <Link
                        href={`/offers/${offer.slug}`}
                        data-cursor="hover"
                        className="transition-colors duration-200 ease-swift hoverable:hover:text-flare"
                      >
                        {offer.name}
                      </Link>
                    </h3>

                    <p className="u-measure mt-6 text-lead text-paper">
                      {offer.description}
                    </p>

                    <p className="u-measure mt-6 text-base text-ash">
                      {offer.bestFor}
                    </p>
                  </div>

                  <div className="lg:col-span-5">
                    <p
                      className={cn(
                        "font-mono text-display-4 tabular-nums",
                        offer.accent ? "text-flare" : "text-paper",
                      )}
                    >
                      {offer.price}
                    </p>

                    <p className="mt-3 text-base text-ash">{offer.unit}</p>

                    <ul className="mt-8 grid gap-3 border-t border-ink-700 pt-6">
                      {offer.deliverables.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 text-base text-paper"
                        >
                          <span
                            aria-hidden
                            className="mt-3 h-px w-4 shrink-0 bg-ink-500"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <p className="u-eyebrow mt-8">{offer.turnaround}</p>
                  </div>
                </div>

                {/* Contractual. Rendered in full, never truncated. */}
                <div className="mt-12">
                  <Divider accent={offer.accent} />

                  <div className="grid gap-x-16 gap-y-8 pt-8 lg:grid-cols-12">
                    {offer.commitments.length > 0 ? (
                      <div className="lg:col-span-7">
                        <h4 className="u-eyebrow font-normal">Commitments</h4>
                        <ul className="mt-4 grid gap-3">
                          {offer.commitments.map((commitment) => (
                            <li
                              key={commitment}
                              className="text-base text-paper"
                            >
                              {commitment}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {offer.disclaimers.length > 0 ? (
                      <div className="lg:col-span-5">
                        <h4 className="u-eyebrow font-normal">Disclaimers</h4>
                        <ul className="mt-4 grid gap-3">
                          {offer.disclaimers.map((disclaimer) => (
                            <li
                              key={disclaimer}
                              className="text-base text-ash"
                            >
                              {disclaimer}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-20 border-t border-ink-700 pt-6 text-base text-ash">
          All prices are in USD.
          {floorPrice ? (
            <>
              {" "}
              The ladder starts at{" "}
              <span className="font-mono tabular-nums text-paper">
                {floorPrice}
              </span>
              .
            </>
          ) : null}
        </p>
      </div>
    </section>
  );
}

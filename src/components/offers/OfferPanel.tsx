import { PriceTag } from "@/components/offers/PriceTag";
import { Button } from "@/components/primitives/Button";
import { Divider } from "@/components/primitives/Divider";
import { Reveal } from "@/components/primitives/Reveal";
import { Tag } from "@/components/primitives/Tag";
import { cn, pad } from "@/lib/cn";
import { stagger } from "@/lib/motion";
import type { Offer } from "@/types";

/* ============================================================================
   OfferPanel — the full-width panel for `tier === "flagship"`.

   Considerably more room than `OfferRow`: the name, the line it turns on, the
   deliverables as a spec list, the turnaround, the commitments and the
   limitations, then one call to action.

   Contractual copy
   ----------------
   `offer.commitments` and `offer.disclaimers` are rendered verbatim, in full,
   always visible. There is no truncation, no line clamp, no "read more", no
   disclosure, and no softening. Commitments are set in `paper` (a promise);
   disclaimers are set in `ash` under a hairline (a limitation), so a reader can
   tell the two apart at a glance. If an offer carries no disclaimers the block
   is skipped entirely rather than shown empty.

   Accent
   ------
   When `offer.accent` is true the panel takes the vermilion rule and the
   primary CTA; otherwise the rule and the CTA stay neutral. Nothing else is
   tinted — not the tier label, not a price — so the accent still means
   something when it appears.
   ========================================================================= */

export type OfferPanelProps = {
  offer: Offer;
};

export function OfferPanel({ offer }: OfferPanelProps) {
  return (
    <article className="relative">
      <Reveal y={0}>
        <Divider tone="ink" accent={offer.accent} />
      </Reveal>

      <div className="grid gap-8 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-16">
        <Reveal y={12}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="u-eyebrow tabular-nums">{pad(offer.order)}</span>
            <Tag tone="outline">{offer.tier}</Tag>
          </div>

          <h3 className="mt-5 font-display text-display-4 uppercase">{offer.name}</h3>
          <p className="mt-4 font-display text-lg leading-snug text-paper-dim">{offer.tagline}</p>
        </Reveal>

        <Reveal y={12} delay={stagger(1)}>
          <PriceTag
            price={offer.price}
            unit={offer.unit}
            size="lg"
            className="lg:flex-col lg:items-end"
          />
        </Reveal>
      </div>

      <div className="grid gap-10 pt-10 sm:pt-12 lg:grid-cols-2 lg:gap-16">
        <Reveal y={10} delay={stagger(2)}>
          <p className="u-measure text-paper">{offer.description}</p>

          <dl className="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-x-10">
            <div>
              <dt className="u-eyebrow">Best for</dt>
              <dd className="mt-2 text-paper">{offer.bestFor}</dd>
            </div>
            <div>
              <dt className="u-eyebrow">Turnaround</dt>
              <dd className="mt-2 font-mono text-sm text-paper">{offer.turnaround}</dd>
            </div>
          </dl>
        </Reveal>

        <div>
          <h4 className="u-eyebrow font-normal">What you get</h4>
          <ul className="mt-4">
            {offer.deliverables.map((line, i) => (
              <Reveal
                as="li"
                key={line}
                delay={stagger(i, 50)}
                y={6}
                className={cn(
                  "border-b border-[color:var(--line)] py-3 text-paper",
                  i === 0 && "border-t",
                )}
              >
                {line}
              </Reveal>
            ))}
          </ul>
        </div>
      </div>

      {offer.commitments.length > 0 ? (
        <Reveal y={10} delay={stagger(3)} className="mt-12 sm:mt-16">
          <h4 className="u-eyebrow font-normal">Commitments</h4>
          <ul className="mt-4 space-y-3">
            {offer.commitments.map((line) => (
              <li key={line} className="u-measure text-paper">
                {line}
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}

      {offer.disclaimers.length > 0 ? (
        <Reveal y={8} delay={stagger(4)} className="mt-10 sm:mt-12">
          <Divider tone="ink" />
          <h4 className="u-eyebrow font-normal mt-6">Limitations</h4>
          <ul className="mt-4 space-y-3">
            {offer.disclaimers.map((line) => (
              <li key={line} className="u-measure text-ash">
                {line}
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}

      <Reveal y={8} delay={stagger(5)} className="mt-10 sm:mt-12">
        <Button
          href="/contact"
          variant={offer.accent ? "solid" : "outline"}
          size="lg"
          arrow
          aria-label={`Start a brief about ${offer.name}`}
        >
          Start a brief
        </Button>
      </Reveal>
    </article>
  );
}

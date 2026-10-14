import Link from "next/link";

import { PriceTag } from "@/components/offers/PriceTag";
import { Reveal } from "@/components/primitives/Reveal";
import { cn, pad } from "@/lib/cn";
import { stagger } from "@/lib/motion";
import type { Offer } from "@/types";

/* ============================================================================
   OfferRow — the compact row for `tier === "entry"`.

   One horizontal line: ladder number, name, tagline, and the price on the
   right. The whole row is the link to `/offers/{slug}`. On hover the content
   shifts a few pixels and the hairline warms to vermilion — nothing scales,
   nothing zooms, no arrow appears.

   Composition contract for the caller
   -----------------------------------
   - The root is a `<div>`, so the caller supplies the list semantics:
     `<ul><li><OfferRow /></li></ul>`. The `/offers` page already renders that
     `<li>`; adding an `<li>` inside this component would nest two of them.
   - Each row owns its entrance (`Reveal`) and staggers off `index`, so the
     caller must not wrap it in a second `Reveal` — that would stack two
     opacity transitions on the same row.
   - Only pass entry offers here. Flagship offers use `OfferPanel`.
   ========================================================================= */

export type OfferRowProps = {
  offer: Offer;
  index: number;
};

export function OfferRow({ offer, index }: OfferRowProps) {
  return (
    /*
     * The hairline and its hover warmth live here, on a plain element: putting
     * a `transition-colors` class on `Reveal` itself would collide with the
     * named transition properties Reveal needs for its own entrance.
     */
    <div
      className={cn(
        "border-b border-[color:var(--line)]",
        "transition-colors duration-[var(--dur-ui)] ease-swift",
        "hoverable:hover:border-flare focus-within:border-flare",
      )}
    >
      <Reveal delay={stagger(index, 60)} y={8}>
        <Link
          href={`/offers/${offer.slug}`}
          data-cursor="hover"
          className={cn(
            "u-press group/row flex items-baseline gap-x-4 py-5 sm:gap-x-8 sm:py-6",
            "transition-transform duration-[var(--dur-ui)] ease-swift",
            "motion-safe:hoverable:hover:translate-x-1",
          )}
        >
          {/* Position in the price ladder. Decorative: the link name reads better without it. */}
          <span
            aria-hidden
            className={cn(
              "w-6 shrink-0 font-mono text-micro tabular-nums text-ash",
              "transition-colors duration-[var(--dur-ui)] ease-swift",
              "hoverable:group-hover/row:text-flare",
            )}
          >
            {pad(offer.order)}
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-bold tracking-[-0.01em] text-paper sm:text-lg">
              {offer.name}
            </h3>
            <p className="mt-1 text-sm text-ash">{offer.tagline}</p>
          </div>

          {/*
            `max-w` on the small breakpoint keeps the price column narrow, so
            the unit wraps under the price instead of squeezing the offer name.
            Every unit value is a single word or a short phrase and fits.
          */}
          <PriceTag
            price={offer.price}
            unit={offer.unit}
            size="sm"
            className="max-w-[7.25rem] shrink-0 flex-wrap justify-end text-right sm:max-w-none"
          />
        </Link>
      </Reveal>
    </div>
  );
}

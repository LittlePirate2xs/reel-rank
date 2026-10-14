import { PriceTag } from "@/components/offers/PriceTag";
import { Divider } from "@/components/primitives/Divider";
import { Reveal } from "@/components/primitives/Reveal";
import { careerCommitments } from "@/content/offers";
import { cn } from "@/lib/cn";
import { stagger } from "@/lib/motion";
import type { CareerTier } from "@/types";

/* ============================================================================
   CareerTier — one career package.

   The three packages are not equal, so they are not drawn equal. The complete
   package leads with the guarantee from `careerCommitments` and sits on its own
   ink surface with more air, a larger name, a larger price and a vermilion
   marker per inclusion. The other two are list-like blocks under a hairline: no
   fill, no border box, no shadow. Anti-slop rule 15 — unequal content must not
   get identical cards.

   The disclaimer
   --------------
   `careerCommitments.disclaimer` renders in full on every tier, under a
   hairline, in `ash`. It is never truncated, never clamped and never omitted —
   it is the sentence that keeps the guarantee honest.

   Why the smaller tiers use `ash` at 14px
   ---------------------------------------
   Their copy is set one step below the complete package on purpose: the two
   cheaper packages are secondary products, and drawing them at the same weight
   is exactly the "identical cards for unequal content" tell. `ash` on `ink-950`
   clears 4.5:1 with room to spare (~7.4:1), so this is de-emphasis, not a
   legibility trade. Nothing contractual is ever set this way: the guarantee and
   the disclaimer stay at 16px and above.

   Composition contract for the caller: the root is an `<article>`, it owns its
   own entrance staggered off `index` (so do not wrap it in a second `Reveal`),
   and `careerCommitments.scope` is left to the page-level commitments block
   rather than repeated in all three tiers.
   ========================================================================= */

export type CareerTierProps = {
  tier: CareerTier;
  index: number;
};

export function CareerTier({ tier, index }: CareerTierProps) {
  const complete = tier.isComplete;

  return (
    <Reveal
      as="article"
      delay={stagger(index, 70)}
      y={12}
      className={cn(
        "u-press flex h-full flex-col",
        complete
          ? "bg-ink-900 px-6 py-8 sm:px-8 sm:py-10 lg:px-10"
          : "border-t border-[color:var(--line)] pt-8 sm:pt-10",
      )}
    >
      {complete ? (
        <div className="mb-8 sm:mb-10">
          <Divider tone="ink" accent />
          <p className="u-eyebrow mt-6">The guarantee</p>
          <p className="u-measure mt-3 text-lead text-paper">{careerCommitments.guarantee}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <h3
          className={cn(
            "font-display uppercase",
            complete ? "text-display-4" : "text-xl sm:text-2xl",
          )}
        >
          {tier.name}
        </h3>
        <PriceTag price={tier.price} unit={tier.unit} size={complete ? "lg" : "md"} />
      </div>

      <p
        className={cn(
          "mt-4 font-display leading-snug",
          complete ? "text-lg text-paper-dim" : "text-base text-ash",
        )}
      >
        {tier.tagline}
      </p>

      <p className={cn("mt-4", complete ? "u-measure text-paper" : "text-sm text-ash")}>
        {tier.description}
      </p>

      <div className={cn(complete ? "mt-10" : "mt-8")}>
        <h4 className="u-eyebrow font-normal">Includes</h4>
        <ul className={cn("mt-4", complete ? "space-y-3" : "space-y-2")}>
          {tier.includes.map((line) => (
            <li key={line} className="flex gap-3">
              <span
                aria-hidden
                className={cn(
                  "mt-[0.5em] size-1 shrink-0 rounded-xs",
                  complete ? "bg-flare" : "bg-ash-dim",
                )}
              />
              <span className={cn(complete ? "text-paper" : "text-sm text-ash")}>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-10">
        <Divider tone="ink" />
        <h4 className="u-eyebrow font-normal mt-5">Please note</h4>
        <p className="u-measure mt-3 text-ash">{careerCommitments.disclaimer}</p>
      </div>
    </Reveal>
  );
}

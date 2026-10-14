import Link from "next/link";

import { MediaFrame } from "@/components/primitives/MediaFrame";
import { cn } from "@/lib/cn";
import { workKinds } from "@/content/work";
import type { WorkItem } from "@/types";

/* ============================================================================
   WorkCard — one project in the index.

   Three deliberate decisions:

   1. Provenance is on the card. "RamanRasa · founder-owned creative ·
      AI-assisted" is a credit, not a footnote, so it sits inside the card
      rather than behind a detail route.
   2. Nothing zooms and nothing rotates on hover (a documented slop tell).
      The whole card shifts a few pixels and the hairline warms instead.
   3. One surface: a hairline edge *or* a shadow, never both. Here it is the
      hairline, and it carries a meaningful colour change on hover.

   Server component — no hooks, no events, no Motion.
   ========================================================================= */

export type WorkCardProps = {
  item: WorkItem;
  index: number;
  className?: string;
};

/** Reuse the shared kind vocabulary from `content/work.ts`. */
function kindLabel(kind: WorkItem["kind"]): string {
  const match = workKinds.find((entry) => entry.id === kind);
  return match ? match.label : kind;
}

export function WorkCard({ item, index, className }: WorkCardProps) {
  return (
    <Link
      href={`/work/${item.slug}`}
      data-cursor="hover"
      aria-label={`${item.title}. ${kindLabel(item.kind)}. ${item.year}.`}
      className={cn(
        "block overflow-hidden rounded-md bg-ink-900",
        "u-press",
        "[border:1px_solid_var(--line)]",
        /* Named properties only — never `transition: all`. Transform and
           border-colour run on the compositor and on the paint layer. */
        "transition-[transform,border-color] duration-200 ease-swift",
        "hoverable:hover:-translate-y-1 hoverable:hover:[border-color:var(--color-flare)]",
        className,
      )}
    >
      <MediaFrame
        asset={item.hero}
        sizes="(min-width: 1024px) 58vw, 100vw"
        /* The first card is the largest thing on the page; its image leads. */
        priority={index === 0}
      />

      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-6">
          <h3 className="text-display-4">{item.title}</h3>
          <span className="mt-1 shrink-0 font-mono text-micro uppercase tabular-nums text-paper">
            {kindLabel(item.kind)}
          </span>
        </div>

        <p className="u-measure-tight text-sm text-paper">{item.hook}</p>

        {/* `ash` at 14px: metadata below that size does not clear 4.5:1. */}
        <p className="font-mono text-sm tabular-nums text-ash">
          {item.year} · {item.client}
        </p>

        {/* Provenance, stated on the card itself. */}
        <p className="mt-1 flex items-start gap-2 border-t border-[color:var(--line)] pt-4">
          <span
            aria-hidden
            className="mt-[0.45em] block size-1.5 shrink-0 rounded-pill bg-flare"
          />
          {/* 14px minimum: `ash` must clear 4.5:1 on `ink-900`. */}
          <span className="text-sm leading-relaxed text-ash">{item.credit}</span>
        </p>
      </div>
    </Link>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

import { WorkCard } from "@/components/work/WorkCard";
import { Divider } from "@/components/primitives/Divider";
import { cn } from "@/lib/cn";
import { workKinds } from "@/content/work";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { DUR, EASE, SPRING, stagger } from "@/lib/motion";
import type { WorkItem, WorkKind } from "@/types";

/* ============================================================================
   WorkGrid — the filterable index.

   Structure:
   - One real <button role="tab" aria-selected> per kind, inside role="tablist".
     Tab presses (and clicks) move the selection; focus is never left on a
     card that has just been hidden, and it never leaves the grid either.
   - Filtering is a Motion `display`/layout transition at DUR.ui. Nothing
     animates width, height, padding or margin — Motion's layout animation
     writes transforms only.
   - Reduced motion: the swap is instant and the offset/scale go. Opacity is
     kept, because reducing motion must not mean removing feedback.
   - The grid is deliberately uneven: the first item spans more columns and
     the rest step down, so a campaign does not carry the same weight as a
     fifteen-second loop.
   ========================================================================= */

export type WorkGridProps = {
  items: WorkItem[];
};

/** Where the real <button>s live, for focus restoration. */
const TABLIST_ID = "work-filter";

/** First column span wins the eye, so the flagship work leads. */
const SPAN = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"] as const;

export function WorkGrid({ items }: WorkGridProps) {
  const [active, setActive] = useState<string>(workKinds[0].id);
  const reduced = usePrefersReducedMotion();

  /* `hidden` is an instant, layout-safe swap. Motion then animates the cards
     that remain into their new positions. */
  const visible = useMemo(() => {
    if (active === "all") return items.map(() => true);
    return items.map((item) => item.kind === (active as WorkKind));
  }, [active, items]);

  const visibleCount = visible.filter(Boolean).length;

  /* The tablist's accessible name is the filter dimension plus the options that
     genuinely exist — no invented label copy. */
  const tablistLabel = `Filter work by kind: ${workKinds
    .map((kind) => kind.id)
    .join(", ")}`;

  /* Selecting a tab must move focus off anything that is about to be hidden. */
  useEffect(() => {
    const node = document.getElementById(TABLIST_ID);
    if (node === null) return;

    const focused = document.activeElement;
    if (focused === null || node.contains(focused)) return;

    const selected = node.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]');
    selected?.focus({ preventScroll: true });
  }, [active]);

  const itemTransition = reduced
    ? { duration: 0 }
    : { duration: DUR.ui, ease: EASE.swift };

  const layoutTransition = reduced
    ? { duration: 0 }
    : { layout: SPRING.settle, opacity: { duration: DUR.fast }, transform: { duration: DUR.fast } };

  return (
    <div className="flex flex-col gap-10">
      <div
        id={TABLIST_ID}
        role="tablist"
        aria-label={tablistLabel}
        aria-orientation="horizontal"
        className="flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-[color:var(--line)] pb-1"
      >
        {workKinds.map((kind) => {
          const selected = active === kind.id;
          const count =
            kind.id === "all"
              ? items.length
              : items.filter((item) => item.kind === kind.id).length;

          return (
            <button
              key={kind.id}
              type="button"
              role="tab"
              id={`work-filter-${kind.id}`}
              aria-selected={selected}
              aria-label={`${kind.label}, ${count}`}
              onClick={() => setActive(kind.id)}
              className={cn(
                "u-press -mb-1 inline-flex items-baseline gap-2 border-b-2 px-3 py-3",
                "font-mono text-micro uppercase tracking-[0.14em]",
                "transition-[color,border-color] duration-[120ms] ease-swift",
                selected
                  ? "border-flare text-paper"
                  : "border-transparent text-ash hoverable:hover:text-paper",
              )}
            >
              {kind.label}
              <span aria-hidden className={cn("tabular-nums", selected ? "text-flare" : "text-ash-dim")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <ul
        /* Uneven by design: proximity and weight do the grouping. */
        className="grid grid-cols-1 items-start gap-x-8 gap-y-10 lg:grid-cols-12"
      >
        {items.map((item, index) => {
          const shown = visible[index] ?? true;
          const rank = visible.slice(0, index).filter(Boolean).length;

          return (
            <motion.li
              key={item.slug}
              layout={reduced ? false : "position"}
              initial={false}
              animate={
                shown
                  ? { opacity: 1, transform: "translate3d(0,0,0)" }
                  : { opacity: 0, transform: "translate3d(0,10px,0)" }
              }
              transition={layoutTransition}
              style={shown ? undefined : { display: "none" }}
              className={cn("min-w-0", SPAN[index % SPAN.length])}
            >
              {shown ? (
                <motion.div
                  initial={reduced ? false : { opacity: 0, transform: "translate3d(0,14px,0)" }}
                  animate={{ opacity: 1, transform: "translate3d(0,0,0)" }}
                  transition={{ ...itemTransition, delay: reduced ? 0 : stagger(rank, 60, 240) / 1000 }}
                  className="h-full"
                >
                  <WorkCard item={item} index={index} className="h-full" />
                </motion.div>
              ) : null}
            </motion.li>
          );
        })}
      </ul>

      <Divider tone="ink" />

      {/* Filtering is a visual change; this is its announcement. The number is
          the whole message, so no extra copy is invented. */}
      <div aria-live="polite" role="status" className="sr-only">
        {visibleCount}
      </div>

      {visibleCount === 0 ? (
        /* Unreachable with the current content: every kind in `workKinds` has
           at least one item. The lead should add an `emptyLabel` to
           `content/work.ts` before any kind is allowed to be empty. */
        <Divider tone="ink" accent />
      ) : null}
    </div>
  );
}

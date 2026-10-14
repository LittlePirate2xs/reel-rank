"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { useInViewToggle, usePrefersReducedMotion } from "@/lib/hooks";

export type MarqueeProps = {
  items: React.ReactNode[];
  /** Seconds for one full loop. */
  speed?: number;
  reverse?: boolean;
  className?: string;
  itemClassName?: string;
  /** Must default true — an un-pausable marquee is a documented slop tell. */
  pauseOnHover?: boolean;
  ariaLabel?: string;
  /** Optional separator rendered between items. */
  separator?: React.ReactNode;
};

type LaneProps = {
  items: React.ReactNode[];
  itemClassName?: string;
  separator?: React.ReactNode;
  /** The second copy exists only to make -50% seamless. Hide it from AT. */
  duplicate?: boolean;
};

function Lane({ items, itemClassName, separator, duplicate = false }: LaneProps) {
  // A separator is only useful with room around it. Without one, the items
  // themselves have to carry the gap, or adjacent labels run together into one
  // unreadable string.
  const hasSeparator = separator !== undefined && separator !== null;

  // `inert` on the duplicate copy keeps any interactive item from being
  // focusable twice, and is a belt to the aria-hidden braces.
  return (
    <div
      className="flex shrink-0 items-center"
      aria-hidden={duplicate || undefined}
      inert={duplicate || undefined}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <div
            className={cn(
              "shrink-0 whitespace-nowrap",
              !hasSeparator && "pe-10",
              itemClassName,
            )}
          >
            {item}
          </div>
          {hasSeparator ? (
            <div className="shrink-0 px-5 sm:px-7" aria-hidden="true">
              {separator}
            </div>
          ) : null}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Translates -50% across a duplicated item list.
 *
 * The animation is a CSS keyframe (compositor-friendly) and pauses on hover
 * (fine pointers only), on focus-within, and whenever the strip leaves the
 * viewport, so nothing animates off-screen or under a reader's cursor.
 *
 * Reduced motion gets a static, horizontally scrollable row instead — the
 * content stays fully available, it just stops moving.
 */
export function Marquee({
  items,
  speed = 40,
  reverse = false,
  className,
  itemClassName,
  pauseOnHover = true,
  ariaLabel,
  separator,
}: MarqueeProps) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInViewToggle<HTMLDivElement>({ margin: "0px" });

  if (reduced) {
    return (
      <div
        ref={ref}
        role="marquee"
        aria-label={ariaLabel}
        className={cn("relative w-full overflow-x-auto", className)}
      >
        <div className="flex w-max items-center">
          <Lane items={items} itemClassName={itemClassName} separator={separator} />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="marquee"
      aria-label={ariaLabel}
      className={cn("group relative w-full overflow-hidden", className)}
    >
      <div
        className={cn(
          "animate-track flex w-max items-center",
          reverse && "[animation-direction:reverse]",
          !inView && "[animation-play-state:paused]",
          "group-focus-within:[animation-play-state:paused]",
          pauseOnHover && "hoverable:group-hover:[animation-play-state:paused]",
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        <Lane items={items} itemClassName={itemClassName} separator={separator} />
        <Lane items={items} itemClassName={itemClassName} separator={separator} duplicate />
      </div>
    </div>
  );
}

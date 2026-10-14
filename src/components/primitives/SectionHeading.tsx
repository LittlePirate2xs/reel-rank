import type { ReactNode } from "react";

import { SplitText } from "@/components/primitives/SplitText";
import { cn } from "@/lib/cn";

/* ============================================================================
   SectionHeading — the one way a section announces itself.

   Deliberately has no numbered prefix and no pill badge above the title: both
   are documented slop tells, and only ProcessRail may number anything because
   only ProcessRail is genuinely a sequence.

   Server component; SplitText is a client component and is imported as such.
   ========================================================================= */

export type SectionHeadingProps = {
  id?: string;
  /** Small mono line above the title. Plain words, never "01 /". */
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  tone?: "ink" | "paper";
  /** Optional CTA cluster aligned to the end. */
  action?: ReactNode;
  className?: string;
  /** Animate the title word by word. */
  split?: boolean;
};

export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  align = "left",
  tone = "ink",
  action,
  className,
  split = false,
}: SectionHeadingProps) {
  const onPaper = tone === "paper";
  const centered = align === "center";

  /* `scroll-mt-24` keeps the anchor target clear of the sticky header. */
  const titleNode =
    split && typeof title === "string" ? (
      <SplitText text={title} />
    ) : (
      title
    );

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-8",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between md:gap-12",
        className,
      )}
    >
      <div className={cn("flex min-w-0 flex-col gap-5", centered && "items-center")}>
        {eyebrow ? (
          <p className={cn("u-eyebrow", onPaper && "text-ink-600")}>
            {eyebrow}
          </p>
        ) : null}

        <h2
          id={id}
          className={cn(
            "scroll-mt-24 text-display-3",
            onPaper ? "text-ink-950" : "text-paper",
            centered ? "max-w-[28ch]" : "max-w-[24ch]",
          )}
        >
          {titleNode}
        </h2>

        {lead ? (
          <p
            className={cn(
              "text-lead",
              onPaper ? "text-ink-600" : "text-paper/80",
              centered ? "max-w-[52ch]" : "u-measure",
            )}
          >
            {lead}
          </p>
        ) : null}
      </div>

      {action ? (
        <div className={cn("flex shrink-0 flex-wrap items-center gap-3", centered ? "justify-center" : "md:pb-1")}>
          {action}
        </div>
      ) : null}
    </div>
  );
}

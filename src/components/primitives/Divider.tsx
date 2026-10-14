import * as React from "react";
import { cn } from "@/lib/cn";

export type DividerProps = {
  tone?: "ink" | "paper";
  className?: string;
  /** Adds a short vermilion segment at the start. */
  accent?: boolean;
};

/**
 * One hairline, drawn from the shared `--line` / `--line-paper` custom
 * properties so it matches every other rule on the page.
 *
 * `accent` draws a short vermilion segment on top of the start of the hairline
 * (a real element, not a gradient).
 */
export function Divider({ tone = "ink", className, accent = false }: DividerProps) {
  return (
    <div
      role="separator"
      className={cn(
        "relative h-px w-full",
        tone === "paper" ? "bg-[var(--line-paper)]" : "bg-[var(--line)]",
        className,
      )}
    >
      {accent ? (
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-12 bg-flare" />
      ) : null}
    </div>
  );
}

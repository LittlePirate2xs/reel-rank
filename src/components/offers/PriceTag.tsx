import { cn } from "@/lib/cn";

/* ============================================================================
   PriceTag — the single way a price is displayed anywhere in the app.

   The price leads in `paper`; the unit follows, smaller, in `ash`. Azeret Mono
   with `tabular-nums` so a column of prices lines up digit for digit and the
   lockup reads like a slate readout rather than a shopping badge.

   Deliberately not: a gradient, a fill, a border, a capsule. A price is
   information, so it is set as type and nothing else.

   Server component — no hooks, no events, no Motion.
   ========================================================================= */

export type PriceTagSize = "sm" | "md" | "lg";

export type PriceTagProps = {
  price: string;
  unit?: string;
  size?: PriceTagSize;
  className?: string;
};

/** Display steps: the compact list row, the mid card, the flagship panel. */
const PRICE_SIZE: Record<PriceTagSize, string> = {
  sm: "text-sm",
  md: "text-2xl",
  lg: "text-4xl",
};

/**
 * The unit is metadata. It only drops to `text-micro` in the compact row,
 * where it matches the mono label convention; everywhere else it stays at
 * 14px and above so `ash` keeps a comfortable contrast on `ink-950`.
 */
const UNIT_SIZE: Record<PriceTagSize, string> = {
  sm: "text-micro tracking-[0.12em]",
  md: "text-sm tracking-[0.08em]",
  lg: "text-sm tracking-[0.08em]",
};

export function PriceTag({ price, unit, size = "md", className }: PriceTagProps) {
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline gap-x-2 gap-y-1",
        "font-mono font-medium tabular-nums",
        className,
      )}
    >
      <span className={cn("leading-none whitespace-nowrap tracking-[-0.01em] text-paper", PRICE_SIZE[size])}>
        {price}
      </span>
      {unit ? (
        <span className={cn("uppercase text-ash", UNIT_SIZE[size])}>{unit}</span>
      ) : null}
    </span>
  );
}

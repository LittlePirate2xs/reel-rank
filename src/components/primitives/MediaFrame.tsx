import Image from "next/image";
import type { CSSProperties } from "react";

import { cn, pad, timecode } from "@/lib/cn";
import type { MediaAsset } from "@/types";

/* ============================================================================
   MediaFrame — the single way media renders anywhere in the app.

   Every asset in `lib/media.ts` may still be a placeholder. Rather than let a
   broken <img> reach the page, `PlaceholderFrame` draws a finished ink slate:
   kind + id, a corner timecode, the frame size, and an honest notice that the
   file is not wired yet. Wiring a real file is a one-line change in the
   manifest — no component changes.

   Server component: no hooks, no events, no Motion.
   ========================================================================= */

export type MediaFrameProps = {
  asset: MediaAsset;
  /** CSS aspect-ratio value, e.g. "16 / 9". Defaults to the asset's own ratio. */
  ratio?: string;
  className?: string;
  /** Passed straight to next/image. */
  sizes?: string;
  priority?: boolean;
  /** Object-fit. Default "cover". */
  fit?: "cover" | "contain";
};

export type PlaceholderFrameProps = {
  asset: MediaAsset;
  className?: string;
  /** Smaller label, for thumbnails. */
  compact?: boolean;
  /** Overrides the bottom-left note. Defaults to "File not wired yet." */
  notice?: string;
};

/** Fall back to 16/9 only when the manifest forgot to declare a size. */
function ratioOf(asset: MediaAsset): string {
  const width = asset.width > 0 ? asset.width : 16;
  const height = asset.height > 0 ? asset.height : 9;
  return `${width} / ${height}`;
}

/**
 * One hairline, corner to corner, at low opacity. Allowed here because it
 * measures an empty frame rather than decorating a filled one.
 */
const DIAGONAL_HAIRLINE: CSSProperties = {
  backgroundImage:
    "linear-gradient(to top right, transparent calc(50% - 0.5px), var(--line) calc(50% - 0.5px), var(--line) calc(50% + 0.5px), transparent calc(50% + 0.5px))",
};

export function PlaceholderFrame({
  asset,
  className,
  compact = false,
  notice = "File not wired yet.",
}: PlaceholderFrameProps) {
  /* Zero seconds of footage exist yet, so the slate reads 00:00:00 (hh:mm:ff). */
  const readout = `${timecode(0)}:${pad(0)}`;

  return (
    <div
      role="img"
      aria-label={`${asset.alt}. Placeholder frame, the ${asset.kind} file is not wired yet.`}
      className={cn(
        "relative isolate flex h-full w-full flex-col justify-between overflow-hidden",
        "rounded-sm border border-[color:var(--line)] bg-ink-900",
        compact ? "gap-3 p-3" : "gap-6 p-4 sm:p-5",
        className,
      )}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 opacity-50" style={DIAGONAL_HAIRLINE} />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-flare",
          compact ? "size-1" : "size-1.5",
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={cn(
            "min-w-0 truncate font-mono uppercase text-ash",
            compact ? "text-micro tracking-[0.12em]" : "text-xs tracking-[0.14em]",
          )}
        >
          {asset.kind} · {asset.id}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span aria-hidden className="block h-2.5 w-px bg-ink-500" />
          <span className={cn("font-mono tabular-nums text-ash", compact ? "text-micro" : "text-xs")}>{readout}</span>
        </span>
      </div>

      {compact ? null : (
        <div className="relative flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <span className="text-sm text-ash">{notice}</span>
          <span className="shrink-0 font-mono text-micro tabular-nums text-ash">
            {asset.width} × {asset.height}
          </span>
        </div>
      )}
    </div>
  );
}

export function MediaFrame({ asset, ratio, className, sizes, priority = false, fit = "cover" }: MediaFrameProps) {
  const aspect = ratio ?? ratioOf(asset);

  /*
   * `asset.placeholder` already accounts for the video case: a video's poster
   * is what gets drawn, so a video without a poster is a placeholder. There is
   * nothing here that can point an <img> at an .mp4.
   */
  if (asset.placeholder) {
    return (
      <div className={cn("relative w-full overflow-hidden", className)} style={{ aspectRatio: aspect }}>
        <PlaceholderFrame asset={asset} className="h-full w-full" />
      </div>
    );
  }

  const src = asset.kind === "video" ? asset.poster : asset.src;

  return (
    <div className={cn("relative w-full overflow-hidden", className)} style={{ aspectRatio: aspect }}>
      <Image
        src={src}
        alt={asset.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={fit === "contain" ? "object-contain" : "object-cover"}
      />
    </div>
  );
}

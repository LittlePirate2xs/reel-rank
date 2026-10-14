"use client";

import { useCallback, useState } from "react";
import { Share2 } from "lucide-react";

import { Toast } from "@/components/primitives/Toast";
import { cn } from "@/lib/cn";

/* ============================================================================
   ShareButton — One-click social share with Web Share API and clipboard fallback.

   Requirements:
   - Invokes navigator.share() when available with title, text, and URL.
   - Gracefully ignores AbortError when user cancels native sheet.
   - Falls back to navigator.clipboard.writeText() + hidden textarea fallback.
   - Triggers Apple-grade visual Toast notification ("Link copied to clipboard").
   - Accessible aria-label and zero-latency .u-press response.
   ========================================================================= */

export type ShareButtonProps = {
  url: string;
  title?: string;
  text?: string;
  label?: string;
  className?: string;
  compact?: boolean;
};

/** Last-resort fallback for clipboard copy on legacy or restricted browsers. */
function copyViaSelection(value: string): boolean {
  if (typeof document === "undefined") return false;
  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

/** Resolves relative path to absolute URL in browser. */
function resolveUrl(url: string): string {
  if (typeof window === "undefined") return url;
  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return url;
  }
}

export function ShareButton({
  url,
  title,
  text,
  label = "Share",
  className,
  compact = false,
}: ShareButtonProps) {
  const [toastOpen, setToastOpen] = useState(false);

  const handleShare = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const canonicalUrl = resolveUrl(url);

      // Web Share API branch
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: title || "All The Little Noises",
            text: text || "Check out this community noise from Reel & Rank",
            url: canonicalUrl,
          });
          return;
        } catch (err: unknown) {
          // User cancellation in native share sheet throws AbortError: swallow silently
          if (err instanceof Error && (err.name === "AbortError" || err.message.toLowerCase().includes("abort"))) {
            return;
          }
          // Fall through to clipboard copy if Web Share failed unexpectedly
        }
      }

      // Clipboard fallback branch
      let copied = false;
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(canonicalUrl);
          copied = true;
        } catch {
          copied = copyViaSelection(canonicalUrl);
        }
      } else {
        copied = copyViaSelection(canonicalUrl);
      }

      if (copied) {
        setToastOpen(true);
      }
    },
    [url, title, text],
  );

  const accessibleLabel = title ? `Share ${title}` : label;

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        aria-label={accessibleLabel}
        data-cursor="hover"
        className={cn(
          "u-press inline-flex items-center justify-center gap-1.5 rounded-sm",
          "border border-[color:var(--line)] bg-ink-900/90 text-ash",
          "transition-[border-color,color,background-color] duration-160 ease-swift",
          "hoverable:hover:border-flare hoverable:hover:text-paper hoverable:hover:bg-ink-850",
          compact ? "size-8 p-1.5" : "min-h-8 px-2.5 py-1 text-micro font-mono uppercase tracking-wider",
          className,
        )}
      >
        <Share2 aria-hidden className="size-3.5 shrink-0" />
        {compact ? null : <span>{label}</span>}
      </button>

      <Toast
        open={toastOpen}
        message="Link copied to clipboard"
        onClose={() => setToastOpen(false)}
      />
    </>
  );
}

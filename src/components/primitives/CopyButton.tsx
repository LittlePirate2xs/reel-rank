"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

/* ============================================================================
   CopyButton — copies a value and says so.

   The async Clipboard API is preferred; when it is missing or refuses (an
   insecure origin, a denied permission) a throwaway textarea plus
   `execCommand("copy")` is used instead. Nothing here throws.

   The result is announced in an `aria-live="polite"` region that sits outside
   the button, so the button's own accessible name stays "Copy".
   ========================================================================= */

export type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
};

const RESET_AFTER = 2000;

/** Last-resort copy: a textarea the user never sees, selected and copied. */
function copyViaSelection(value: string): boolean {
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

export function CopyButton({ value, label = "Copy", copiedLabel = "Copied", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(async () => {
    let ok = false;

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        ok = true;
      } catch {
        ok = copyViaSelection(value);
      }
    } else {
      ok = copyViaSelection(value);
    }

    setCopied(ok);
    setFailed(!ok);

    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setCopied(false);
      setFailed(false);
      timer.current = null;
    }, RESET_AFTER);
  }, [value]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          void copy();
        }}
        data-cursor="hover"
        className={cn(
          "u-press inline-flex min-h-9 items-center gap-2 rounded-sm border border-[color:var(--line-strong)] bg-ink-900 px-3 py-2",
          "font-mono text-micro uppercase tracking-[0.14em] text-paper",
          "transition-[border-color,background-color,color] duration-[160ms] ease-swift hoverable:hover:border-ink-500",
          className,
        )}
      >
        {copied ? (
          <Check aria-hidden className="size-3.5 shrink-0 text-flare" />
        ) : (
          <Copy aria-hidden className="size-3.5 shrink-0 text-ash" />
        )}
        <span>{copied ? copiedLabel : label}</span>
      </button>

      <span aria-live="polite" role="status" className="sr-only">
        {copied ? copiedLabel : failed ? "Copy failed. Select the value and copy it manually." : ""}
      </span>
    </>
  );
}

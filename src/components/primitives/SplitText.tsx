"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { useInViewOnce, useMounted, usePrefersReducedMotion } from "@/lib/hooks";

export type SplitTextProps = {
  text: string;
  /** Element to render. Defaults to "span". */
  as?: React.ElementType;
  className?: string;
  /** Base delay in ms before the first word. */
  delay?: number;
  /** ms between words. Keep 30–80. */
  step?: number;
  /** Animate immediately on mount instead of waiting for intersection. */
  immediate?: boolean;
  /** Words to render in the accent colour, matched case-insensitively. */
  accentWords?: string[];
  accentClassName?: string;
};

/** Trailing punctuation is stripped before accent matching: "frames," -> "frames". */
const TRAILING_PUNCTUATION = /[^\p{L}\p{N}]+$/u;

function normalizeWord(word: string): string {
  return word.replace(TRAILING_PUNCTUATION, "").toLowerCase();
}

/**
 * Word-by-word rise reveal.
 *
 * Each word sits in an inline-block mask with `overflow: hidden` and a small
 * top padding (offset by an equal negative margin, so line spacing is
 * untouched). The word is translated down out of the mask and rises into place
 * as it fades in.
 *
 * Deliberately NOT used here: `clip-path`, `overflow-clip-margin`, and padding
 * hacks on the inner span. That combination looks equivalent but clips glyphs
 * unpredictably across wrapped lines. This version has one clip box per word,
 * sized from the same metrics as the line box, so it behaves identically on
 * every line. Uppercase display type has no descenders, which is why only a
 * top allowance is needed.
 *
 * The wrapper carries the real string as its accessible name and the visual
 * words are hidden from assistive tech, so a headline is read once, as a
 * sentence, not word by word.
 */
export function SplitText({
  text,
  as,
  className,
  delay = 0,
  step = 55,
  immediate = false,
  accentWords,
  accentClassName = "text-flare",
}: SplitTextProps) {
  const Component = (as ?? "span") as React.ElementType;
  const reduced = usePrefersReducedMotion();
  const mounted = useMounted();
  const { ref, inView } = useInViewOnce<HTMLElement>({
    threshold: 0.2,
    margin: "0px 0px -6% 0px",
  });

  const words = React.useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const accents = React.useMemo(
    () => new Set((accentWords ?? []).map(normalizeWord)),
    [accentWords],
  );

  const shown = immediate ? mounted : inView;

  // Nothing to split: keep the plain string, no aria plumbing needed.
  if (words.length < 2) {
    return <Component className={className}>{text}</Component>;
  }

  return (
    <Component
      ref={ref}
      className={cn("split", reduced && "split-static", className)}
      data-split={shown ? "on" : "off"}
      aria-label={text}
    >
      {words.map((word, index) => {
        const isAccent = accents.size > 0 && accents.has(normalizeWord(word));

        return (
          <React.Fragment key={`${index}-${word}`}>
            <span aria-hidden="true" className="split-mask">
              <span
                className={cn("split-word", isAccent && accentClassName)}
                style={
                  {
                    // Reduced motion drops the stagger as well as the travel, so
                    // the headline is simply present rather than appearing word
                    // by word with no motion between the words.
                    "--split-delay": reduced ? "0ms" : `${delay + index * step}ms`,
                  } as React.CSSProperties
                }
              >
                {word}
              </span>
            </span>
            {/* A real space text node between the masks, so the headline wraps
                exactly like ordinary text. */}
            {index < words.length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </Component>
  );
}

"use client";

import * as React from "react";

/**
 * Shared hooks. Everything here is a client-only module: it is imported by
 * client components and by nothing on the server render path.
 *
 * `useReducedMotion` is re-exported from Motion so components have exactly one
 * import site for media-state hooks (CONTRACTS.md §2). Prefer the boolean
 * `usePrefersReducedMotion` below in `className` decisions: Motion's version
 * returns `boolean | null`, mine is always a boolean and is `false` on the
 * server so SSR markup and the first client render agree.
 */
export { useReducedMotion } from "motion/react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

/** Subscribe to a media query. Safe during SSR and on the first client render. */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** True when the viewport prefers reduced motion. Safe during SSR (false). */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}

/** True only for fine pointers that support hover. Safe during SSR (false). */
export function useIsPointerFine(): boolean {
  return useMediaQuery(FINE_POINTER_QUERY);
}

/**
 * Mobile menu / dialog scroll lock. Returns nothing.
 *
 * Locks the body rather than `html` because Lenis (when active) scrolls the
 * document element; `overflow: hidden` on the body is honoured by both. The
 * scrollbar gutter is compensated only when the scrollbar actually takes space,
 * so a stable-gutter layout does not shift by 10px on open.
 */
export function useScrollLock(locked: boolean): void {
  React.useEffect(() => {
    if (!locked) return;
    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const gutter = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [locked]);
}

type InViewOptions = {
  /** IntersectionObserver `rootMargin`, e.g. "0px 0px -10% 0px". */
  margin?: string;
  /** 0–1. Clamped. `0` means "any intersection". */
  threshold?: number;
  once: boolean;
};

/** The one IntersectionObserver implementation both public hooks share. */
function useIntersection<T extends Element>({
  margin = "0px",
  threshold = 0.15,
  once,
}: InViewOptions): { ref: React.RefObject<T | null>; inView: boolean } {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);
  const settled = React.useRef(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (once && settled.current) return;

    // No observer (very old browser, or a non-DOM test env): show the content.
    // Hidden-forever is a worse failure than a missing entrance animation.
    if (typeof IntersectionObserver === "undefined") {
      settled.current = true;
      setInView(true);
      return;
    }

    const ratio = Math.min(Math.max(threshold, 0), 1);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const rootHeight = entry.rootBounds?.height ?? 0;
            // An element taller than the root can never reach `ratio`, so any
            // intersection counts for it. Without this a full-height section
            // wrapped in <Reveal threshold={0.15}> would stay invisible.
            const tallerThanRoot = rootHeight > 0 && entry.boundingClientRect.height > rootHeight;
            if (once && ratio > 0 && !tallerThanRoot && entry.intersectionRatio < ratio) {
              continue;
            }
            setInView(true);
            if (once) {
              settled.current = true;
              observer.disconnect();
            }
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { rootMargin: margin, threshold: ratio > 0 ? [0, ratio] : 0 },
    );

    observer.observe(node);

    /*
     * Safety net.
     *
     * Entrances hide content until the observer reports, which means a
     * throttled tab, a missed callback, or any observer hiccup would leave
     * readable content invisible. That is not an acceptable failure mode for a
     * marketing page, so if nothing has reported after a moment we check the
     * element ourselves and reveal it when it is genuinely on screen.
     *
     * Below-fold content is deliberately left alone, so scroll reveals keep
     * working exactly as designed.
     */
    const failSafe = once
      ? window.setTimeout(() => {
          if (settled.current) return;
          const rect = node.getBoundingClientRect();
          const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
          const onScreen = rect.bottom > 0 && rect.top < viewportHeight && rect.height > 0;
          if (!onScreen) return;
          settled.current = true;
          setInView(true);
          observer.disconnect();
        }, 1200)
      : undefined;

    return () => {
      if (failSafe !== undefined) window.clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [margin, threshold, once]);

  return { ref, inView };
}

/** Fire `onEnter` once when the ref enters the viewport. */
export function useInViewOnce<T extends Element>(options?: {
  margin?: string;
  threshold?: number;
}): { ref: React.RefObject<T | null>; inView: boolean } {
  return useIntersection<T>({
    margin: options?.margin,
    threshold: options?.threshold,
    once: true,
  });
}

/**
 * Fires when the element enters, and again when it leaves.
 * Used by scroll-linked sections that need to know direction.
 */
export function useInViewToggle<T extends Element>(options?: {
  margin?: string;
}): { ref: React.RefObject<T | null>; inView: boolean } {
  return useIntersection<T>({ margin: options?.margin, threshold: 0, once: false });
}

/** True after mount. Use to gate enter animations so SSR markup is stable. */
export function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

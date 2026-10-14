"use client";

import Lenis from "lenis";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useIsPointerFine, usePrefersReducedMotion } from "@/lib/hooks";

/* ============================================================================
   SmoothScroll — additive smooth scrolling, never load-bearing.

   Lenis only mounts for fine pointers with motion allowed. Children always
   render, and every consumer falls back to the native scroll APIs, so the page
   works identically with the provider inert.

   Lenis' own RAF is disabled; `lenis.raf(time)` is driven from one
   requestAnimationFrame loop so there is a single frame source.
   ========================================================================= */

export type SmoothScrollProps = { children: React.ReactNode };

export type SmoothScrollTarget = string | HTMLElement | number;

export type SmoothScrollApi = {
  /** The live Lenis instance, or null when smooth scrolling is off. */
  lenis: Lenis | null;
  /** Scroll to a selector, an element, or an absolute Y offset. */
  scrollTo: (target: SmoothScrollTarget) => void;
};

/** Sticky header height, in px. Anchors stop clear of it. */
const HEADER_HEIGHT = 72;

const ANCHOR_DURATION = 0.8;

const SmoothScrollContext = createContext<SmoothScrollApi>({
  lenis: null,
  scrollTo: () => {},
});

export function useSmoothScroll(): SmoothScrollApi {
  return useContext(SmoothScrollContext);
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const fine = useIsPointerFine();
  const reduced = usePrefersReducedMotion();
  const enabled = fine && !reduced;

  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) {
      lenisRef.current = null;
      setLenis(null);
      return;
    }

    const instance = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
    lenisRef.current = instance;
    setLenis(instance);

    let frame = requestAnimationFrame(function raf(time: number) {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, [enabled]);

  const scrollTo = useCallback((target: SmoothScrollTarget) => {
    const instance = lenisRef.current;

    if (instance) {
      if (typeof target === "number") {
        instance.scrollTo(target, { duration: ANCHOR_DURATION });
        return;
      }
      instance.scrollTo(target, { offset: -HEADER_HEIGHT, duration: ANCHOR_DURATION });
      return;
    }

    /* No Lenis: coarse pointer, or reduced motion. Jump, never animate. */
    if (typeof target === "number") {
      window.scrollTo({ top: target });
      return;
    }
    const element = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!element) return;
    window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT });
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href^='#']");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const element = document.getElementById(decodeURIComponent(href.slice(1)));
      if (!element) return;

      event.preventDefault();
      scrollTo(element);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [enabled, scrollTo]);

  const value = useMemo<SmoothScrollApi>(() => ({ lenis, scrollTo }), [lenis, scrollTo]);

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}

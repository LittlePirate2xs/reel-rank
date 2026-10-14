"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import { useIsPointerFine, useMounted, usePrefersReducedMotion } from "@/lib/hooks";
import { SPRING } from "@/lib/motion";

/* ============================================================================
   Cursor — a two-part pointer ring for fine pointers only.

   A dot that tracks the pointer exactly, and a ring that springs after it. The
   native cursor is only hidden once a first pointer position has actually been
   measured, so a device that never fires `pointermove` keeps a usable cursor.

   Renders nothing on coarse pointers, under reduced motion, or while the
   window is not focused.
   ========================================================================= */

export type CursorProps = { className?: string };

const RING_SIZE = 40;
const DOT_SIZE = 6;

/** Anything interactive opts in by carrying this attribute. */
const HOVER_SELECTOR = '[data-cursor="hover"]';

const NATIVE_CURSOR_STYLE = "html[data-cursor-hidden],html[data-cursor-hidden] *{cursor:none}";

export function Cursor({ className }: CursorProps) {
  const fine = useIsPointerFine();
  const reduced = usePrefersReducedMotion();
  const mounted = useMounted();

  const [focused, setFocused] = useState(true);
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  /* Raw pointer position, in viewport coordinates. */
  const pointerX = useMotionValue(-100);
  const pointerY = useMotionValue(-100);

  /* The ring lags behind the dot; the dot never lags. */
  const lagX = useSpring(pointerX, SPRING.snap);
  const lagY = useSpring(pointerY, SPRING.snap);
  const ringScale = useSpring(1, SPRING.snap);

  /* Centre each element on the pointer by offsetting half its own size. */
  const ringX = useTransform(lagX, (value) => value - RING_SIZE / 2);
  const ringY = useTransform(lagY, (value) => value - RING_SIZE / 2);
  const dotX = useTransform(pointerX, (value) => value - DOT_SIZE / 2);
  const dotY = useTransform(pointerY, (value) => value - DOT_SIZE / 2);

  const enabled = mounted && fine && !reduced;

  /* Focus tracking lives outside the pointer effect, otherwise losing focus
     would tear down the very listener that can restore it. */
  useEffect(() => {
    const sync = () => setFocused(document.hasFocus());
    sync();
    window.addEventListener("focus", sync);
    window.addEventListener("blur", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("blur", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setReady(false);
      setHover(false);
      setPressed(false);
      return;
    }

    const root = document.documentElement;
    let cursorStyle: HTMLStyleElement | null = null;

    const hideNativeCursor = () => {
      if (cursorStyle) return;
      cursorStyle = document.createElement("style");
      cursorStyle.textContent = NATIVE_CURSOR_STYLE;
      document.head.appendChild(cursorStyle);
      root.setAttribute("data-cursor-hidden", "");
      setReady(true);
    };

    const onPointerMove = (event: PointerEvent) => {
      /* A touch tap on a hybrid device must not capture the ring. */
      if (event.pointerType === "touch") return;
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
      hideNativeCursor();
    };

    const onPointerOver = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const hit = target.closest(HOVER_SELECTOR);
      if (!hit) return;
      const from = event.relatedTarget;
      if (from instanceof Node && hit.contains(from)) return;
      setHover(true);
    };

    const onPointerOut = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const hit = target.closest(HOVER_SELECTOR);
      if (!hit) return;
      const to = event.relatedTarget;
      if (to instanceof Node && hit.contains(to)) return;
      setHover(false);
    };

    const onPointerDown = () => setPressed(true);
    const onPointerUp = () => setPressed(false);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseover", onPointerOver);
    document.addEventListener("mouseout", onPointerOut);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseover", onPointerOver);
      document.removeEventListener("mouseout", onPointerOut);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      if (cursorStyle) {
        cursorStyle.remove();
        cursorStyle = null;
      }
      root.removeAttribute("data-cursor-hidden");
    };
  }, [enabled, pointerX, pointerY]);

  useEffect(() => {
    ringScale.set(pressed ? 0.82 : hover ? 1.75 : 1);
  }, [hover, pressed, ringScale]);

  if (!mounted || !fine || reduced || !focused) return null;

  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-0 z-[var(--z-cursor)]", className)}>
      <motion.div
        style={{ x: ringX, y: ringY, scale: ringScale }}
        className={cn(
          "absolute left-0 top-0 size-10 rounded-pill border",
          "transition-[border-color,background-color,opacity] duration-[180ms] ease-swift",
          hover ? "border-flare bg-flare/10" : "border-[color:var(--line-strong)] bg-transparent",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
      <motion.div
        style={{ x: dotX, y: dotY }}
        className={cn(
          "absolute left-0 top-0 size-1.5 rounded-pill bg-flare",
          "transition-opacity duration-[180ms] ease-swift",
          ready ? (hover ? "opacity-40" : "opacity-100") : "opacity-0",
        )}
      />
    </div>
  );
}

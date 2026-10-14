"use client";

import * as React from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { SPRING } from "@/lib/motion";
import { useIsPointerFine, usePrefersReducedMotion } from "@/lib/hooks";

export type MagneticProps = {
  children: React.ReactNode;
  className?: string;
  /** 0–1. How far the child follows the pointer. */
  strength?: number;
  /** Max travel in px. */
  max?: number;
  as?: React.ElementType;
};

function clamp(value: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, value));
}

/**
 * Pointer-follow wrapper for a single call to action.
 *
 * Deliberately inert on coarse pointers and under reduced motion: those users
 * get the children rendered plainly, with no spring, no listeners and no
 * transform. Only real pointer movement drives it, so keyboard focus never
 * nudges the element off its resting position.
 */
export function Magnetic({
  children,
  className,
  strength = 0.25,
  max = 10,
  as,
}: MagneticProps) {
  const pointerFine = useIsPointerFine();
  const reduced = usePrefersReducedMotion();
  const active = pointerFine && !reduced;

  const rawX = useSpring(0, SPRING.settle);
  const rawY = useSpring(0, SPRING.settle);
  const x = useTransform(rawX, (value) => clamp(value, max));
  const y = useTransform(rawY, (value) => clamp(value, max));

  const MotionTag = React.useMemo(
    () => motion.create((as ?? "div") as React.ElementType),
    [as],
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const rect = event.currentTarget.getBoundingClientRect();
      const offsetX = event.clientX - (rect.left + rect.width / 2);
      const offsetY = event.clientY - (rect.top + rect.height / 2);
      rawX.set(clamp(offsetX * strength, max));
      rawY.set(clamp(offsetY * strength, max));
    },
    [rawX, rawY, strength, max],
  );

  const handlePointerLeave = React.useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  // Before mount the media queries report false, so the first client render
  // matches the server exactly and hydration stays quiet.
  if (!active) {
    const Plain = (as ?? "div") as React.ElementType;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <MotionTag
      className={className}
      style={{ x, y }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </MotionTag>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { APPLE_SPRINGS } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/hooks";

export type ScrubBarProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (val: number) => void;
  onChangeEnd?: (val: number, velocity: number) => void;
  formatTime?: (val: number) => string;
  className?: string;
  ariaLabel?: string;
};

/** Default seconds-to-MM:SS formatter */
function defaultFormatTime(sec: number): string {
  const safe = Math.max(0, Number.isFinite(sec) ? sec : 0);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * ScrubBar
 *
 * Direct-manipulation timeline slider primitive following Apple Fluid Interfaces principles:
 * - 1:1 direct pointer tracking with pointer capture (setPointerCapture)
 * - Thumb instant scale-up on pointer-down (scale: 1.35), smooth critically damped settle on release
 * - Velocity tracking across pointermove events passed to onChangeEnd
 * - Full ARIA slider semantics (role="slider", keyboard arrow steps)
 * - touch-action: none to prevent viewport scroll hijacking during scrub
 */
export function ScrubBar({
  value,
  min = 0,
  max = 100,
  step = 0.1,
  onChange,
  onChangeEnd,
  formatTime = defaultFormatTime,
  className,
  ariaLabel = "Timeline scrubber",
}: ScrubBarProps) {
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  // Velocity tracking state: stores last pointer positions and timestamps
  const historyRef = useRef<{ x: number; time: number }[]>([]);
  const isPointerDownRef = useRef(false);

  // Clamp and normalize progress fraction (0 to 1)
  const range = Math.max(0.0001, max - min);
  const clampedValue = Math.min(Math.max(value, min), max);
  const fraction = range > 0 ? (clampedValue - min) / range : 0;
  const percentage = Math.min(Math.max(fraction * 100, 0), 100);

  const calculateValueFromPointer = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return min;

      const rawFraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + rawFraction * range;

      // Snap to step precision
      if (step > 0) {
        const stepped = Math.round((rawValue - min) / step) * step + min;
        return Math.min(Math.max(stepped, min), max);
      }
      return Math.min(Math.max(rawValue, min), max);
    },
    [min, range, step, max],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return; // Primary button only
      e.preventDefault();

      const track = trackRef.current;
      if (!track) return;

      try {
        track.setPointerCapture(e.pointerId);
      } catch {
        // Safe fallback in non-supporting environments
      }

      isPointerDownRef.current = true;
      setDragging(true);

      const now = performance.now();
      historyRef.current = [{ x: e.clientX, time: now }];

      const newValue = calculateValueFromPointer(e.clientX);
      onChange?.(newValue);
    },
    [calculateValueFromPointer, onChange],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isPointerDownRef.current) return;
      e.preventDefault();

      const now = performance.now();
      const history = historyRef.current;
      history.push({ x: e.clientX, time: now });
      // Keep last 4 samples for clean release velocity
      if (history.length > 4) history.shift();

      const newValue = calculateValueFromPointer(e.clientX);
      onChange?.(newValue);
    },
    [calculateValueFromPointer, onChange],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isPointerDownRef.current) return;
      isPointerDownRef.current = false;
      setDragging(false);

      const track = trackRef.current;
      if (track && track.hasPointerCapture(e.pointerId)) {
        try {
          track.releasePointerCapture(e.pointerId);
        } catch {
          // Ignore
        }
      }

      // Calculate release velocity in px/s
      let velocity = 0;
      const history = historyRef.current;
      if (history.length >= 2) {
        const first = history[0];
        const last = history[history.length - 1];
        const dt = (last.time - first.time) / 1000;
        if (dt > 0.005) {
          velocity = (last.x - first.x) / dt;
        }
      }

      const finalValue = calculateValueFromPointer(e.clientX);
      onChangeEnd?.(finalValue, velocity);
    },
    [calculateValueFromPointer, onChangeEnd],
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isPointerDownRef.current) return;
      isPointerDownRef.current = false;
      setDragging(false);

      const track = trackRef.current;
      if (track && track.hasPointerCapture(e.pointerId)) {
        try {
          track.releasePointerCapture(e.pointerId);
        } catch {
          // Ignore
        }
      }

      onChangeEnd?.(clampedValue, 0);
    },
    [clampedValue, onChangeEnd],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      let delta = 0;
      const keyStep = step > 0 ? step : 1;
      const bigStep = range / 10 || keyStep * 5;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowDown":
          delta = -keyStep;
          break;
        case "ArrowRight":
        case "ArrowUp":
          delta = keyStep;
          break;
        case "PageDown":
          delta = -bigStep;
          break;
        case "PageUp":
          delta = bigStep;
          break;
        case "Home":
          e.preventDefault();
          onChange?.(min);
          onChangeEnd?.(min, 0);
          return;
        case "End":
          e.preventDefault();
          onChange?.(max);
          onChangeEnd?.(max, 0);
          return;
        default:
          return;
      }

      e.preventDefault();
      const updated = Math.min(Math.max(clampedValue + delta, min), max);
      onChange?.(updated);
      onChangeEnd?.(updated, 0);
    },
    [clampedValue, min, max, onChange, onChangeEnd, range, step],
  );

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuenow={clampedValue}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={formatTime(clampedValue)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onKeyDown={onKeyDown}
      className={cn(
        "group/scrub relative flex h-7 w-full cursor-pointer select-none items-center",
        "touch-none focus-visible:outline-none",
        className,
      )}
      style={{ touchAction: "none" }}
    >
      {/* Background Rail */}
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-ink-800 transition-colors duration-150 group-hover/scrub:bg-ink-700">
        {/* Filled Progress Track */}
        <div
          className="h-full bg-flare origin-left transition-[width] duration-75 ease-linear"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Scrub Thumb */}
      <motion.div
        aria-hidden="true"
        animate={{
          scale: reduced ? 1 : dragging ? 1.35 : 1,
        }}
        transition={reduced ? { duration: 0.001 } : APPLE_SPRINGS.criticallyDamped}
        className={cn(
          "pointer-events-none absolute top-1/2 -ml-2 -mt-2 size-4 rounded-full",
          "bg-flare border-2 border-paper shadow-sm",
          "transition-opacity duration-150",
          dragging ? "opacity-100 ring-2 ring-flare/30" : "opacity-90 group-hover/scrub:opacity-100",
        )}
        style={{
          left: `${percentage}%`,
        }}
      />
    </div>
  );
}

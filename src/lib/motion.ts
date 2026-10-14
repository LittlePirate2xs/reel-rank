/* ============================================================================
   Motion constants — the single source of truth for timing.

   Rules encoded here (Emil Kowalski, emil-design-eng):
   - Never `ease-in` for UI. Entering elements use a strong ease-out.
   - UI motion stays under 300ms; only scroll-linked/marketing motion is longer.
   - Entrances start from scale(0.95)/translateY(8px) WITH opacity — never scale(0).
   - Prefer CSS transitions for predetermined entrances (off the main thread).
     Reserve Motion (rAF) for scroll-linked and interruptible interaction.
   ========================================================================= */

/** Cubic bezier control points, mirrored from `styles/tokens.css`. */
export const EASE = {
  /** Strong ease-out. Entrances, hover, anything responding to the user. */
  swift: [0.23, 1, 0.32, 1],
  /** Strong ease-in-out. Elements travelling across the screen. */
  glide: [0.77, 0, 0.175, 1],
  /** iOS-style drawer curve. */
  drawer: [0.32, 0.72, 0, 1],
  soft: [0.4, 0, 0.2, 1],
} as const;

export type EaseName = keyof typeof EASE;

/** Durations in seconds, for Motion. Mirrors `--dur-*` in tokens.css. */
export const DUR = {
  press: 0.12,
  fast: 0.16,
  ui: 0.2,
  pop: 0.22,
  panel: 0.38,
  reveal: 0.72,
} as const;

/** CSS-ready timing strings for inline styles and CSS modules. */
export const cssEase = {
  swift: "cubic-bezier(0.23, 1, 0.32, 1)",
  glide: "cubic-bezier(0.77, 0, 0.175, 1)",
  drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
  soft: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

/**
 * Stagger delay for the nth item in a group.
 * Kept short (30–80ms) — long delays make the interface feel slow.
 */
export function stagger(index: number, step = 60, max = 480): number {
  return Math.min(index * step, max);
}

/** Apple-style spring. Easier to reason about than mass/stiffness/damping. */
export const SPRING = {
  /** Default settle. No bounce — bounce is a documented slop tell. */
  settle: { type: "spring", duration: 0.5, bounce: 0 },
  /** Slightly livelier, for drag-to-dismiss style interactions. */
  lively: { type: "spring", duration: 0.45, bounce: 0.18 },
  /** Snappy, for small UI affordances. */
  snap: { type: "spring", duration: 0.32, bounce: 0 },
} as const;

/**
 * Apple WWDC Designing Fluid Interfaces spring specifications.
 * Critically damped default (damping: 1.0, bounce: 0) and physical momentum models.
 */
export const APPLE_SPRINGS = {
  /** Critically damped default (damping: 1.0, no bounce, smooth settle). For modals, sheets, card settles. */
  criticallyDamped: { type: "spring", bounce: 0, duration: 0.35 },
  /** Momentum / gesture release spring (damping: ~0.8, slight bounce). For flick releases and drag handoffs. */
  momentum: { type: "spring", bounce: 0.16, duration: 0.4 },
  /** Snappy micro-interaction spring (damping: 1.0, 0.22s). For toggles, audio button, and switches. */
  snappy: { type: "spring", bounce: 0, duration: 0.22 },
  /** Fast press feedback (response: 0.14s). */
  press: { type: "spring", bounce: 0, duration: 0.14 },
} as const;

/**
 * Exponential-decay momentum projection (Apple WWDC 2018 Designing Fluid Interfaces).
 * Supports both delta projection (velocity, decay) and endpoint projection (current, velocity, decay).
 */
export function projectMomentum(
  initialVelocityOrCurrent: number,
  decelerationOrVelocity: number = 0.998,
  decayRate = 0.998,
): number {
  if (arguments.length >= 2) {
    const current = initialVelocityOrCurrent;
    const velocity = decelerationOrVelocity;
    const decay = Math.min(0.999, Math.max(0, decayRate));
    if (Math.abs(velocity) < 0.01) return current;
    return current + (velocity / 1000) * (decay / (1 - decay));
  }
  const velocity = initialVelocityOrCurrent ?? 0;
  const decay = 0.998;
  if (Math.abs(velocity) < 0.01) return 0;
  return (velocity / 1000) * (decay / (1 - decay));
}

/**
 * Soft boundary rubber-banding function (Apple WWDC 2018).
 * Provides progressive resistance beyond bounds without hard stops.
 */
export function rubberband(offset: number, range: number, constant = 0.55): number {
  if (offset === 0 || range <= 0) return 0;
  return (offset * range * constant) / (range + constant * Math.abs(offset));
}

/**
 * Resolves spring transition safely considering reducedMotion preference.
 */
export function resolveSpring(
  preset: (typeof APPLE_SPRINGS)[keyof typeof APPLE_SPRINGS],
  reducedMotion = false,
) {
  if (reducedMotion) {
    return { type: "tween" as const, duration: 0.001, bounce: 0 };
  }
  return preset;
}

/* ---------------------------------------------------------------------------
   Motion variants. Used only where scroll-linked or interruptible motion is
   genuinely required. Predetermined entrances use <Reveal /> (CSS based).
   ------------------------------------------------------------------------ */

export const fadeUp = {
  hidden: { opacity: 0, transform: "translate3d(0, 14px, 0)" },
  show: {
    opacity: 1,
    transform: "translate3d(0, 0px, 0)",
    transition: { duration: DUR.reveal, ease: EASE.swift },
  },
} as const;

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.reveal, ease: EASE.swift } },
} as const;

/** Clip reveal from the bottom up. Never from scale(0). */
export const clipUp = {
  hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)" },
  show: {
    opacity: 1,
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: DUR.reveal, ease: EASE.glide },
  },
} as const;

/** Parent that cascades its children. */
export function cascade(step = 0.06, delay = 0) {
  return {
    hidden: {},
    show: {
      transition: { delayChildren: delay, staggerChildren: step },
    },
  } as const;
}

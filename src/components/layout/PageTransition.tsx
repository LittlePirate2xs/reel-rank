/* ============================================================================
   PageTransition — the enter half of a route change.

   Client component, mounted from `app/template.tsx` so it re-runs on every
   navigation. There is no exit animation: the App Router cannot hold the old
   tree on screen without the View Transitions API, and faking one (a timer
   that delays the swap) is the classic way to make a site feel slower than it
   actually is. So: enter only, and get out of the way immediately.

   "Must not delay interactivity" is why this is a single CSS animation over
   `opacity` + `transform`: no JS on the critical path, the subtree is in the
   DOM and hit-testable from the first frame, and the animation cannot
   re-trigger on a hover or a state change.

   Reduced motion keeps the fade and drops the travel — reduce, never zero.
   ========================================================================= */

"use client";

export type PageTransitionProps = { children: React.ReactNode };

export function PageTransition({
  children,
}: PageTransitionProps): React.JSX.Element {
  return <div className="u-page-enter">{children}</div>;
}

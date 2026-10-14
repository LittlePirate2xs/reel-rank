/* ============================================================================
   Container — the only horizontal-rhythm wrapper in the app.

   Server component. It does nothing but hand out `.shell` / `.shell-wide`,
   which own `--shell-max` and `--shell-pad` from tokens.css. Two page widths
   only: keeping the count at two is what stops the layout drifting into
   arbitrary max-widths per section.
   ========================================================================= */

import { cn } from "@/lib/cn";

export type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  /** "shell" (max-w-96rem) or "wide" (max-w-120rem). */
  width?: "shell" | "wide";
};

export function Container({
  children,
  className,
  width = "shell",
}: ContainerProps): React.JSX.Element {
  return (
    <div className={cn(width === "wide" ? "shell-wide" : "shell", className)}>
      {children}
    </div>
  );
}

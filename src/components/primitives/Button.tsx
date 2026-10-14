import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";

export type ButtonVariant = "solid" | "outline" | "ghost" | "paper";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders a next/link instead of a button. */
  href?: string;
  /** External link: adds target/rel. */
  external?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  /** Trailing arrow that shifts right on hover. */
  arrow?: boolean;
  /** Leading icon node. Rendered aria-hidden. */
  icon?: React.ReactNode;
  "aria-label"?: string;
};

/**
 * Named transition properties only — Tailwind v4 compiles `scale`/`translate`
 * to their own properties, so both must be listed for the press and the arrow
 * shift to animate.
 */
const button = cva(
  [
    "u-press group/button relative inline-flex shrink-0 select-none items-center justify-center gap-2",
    "rounded-sm font-mono uppercase whitespace-nowrap",
    "transition-[transform,translate,scale,background-color,border-color,color,opacity]",
    "duration-[120ms] ease-swift",
    "active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        solid: "bg-flare text-ink-950 active:bg-flare-deep hoverable:hover:bg-flare-soft",
        outline:
          "border border-ink-600 text-paper hoverable:hover:border-ash-dim hoverable:hover:bg-ink-900",
        ghost: "text-paper hoverable:hover:bg-ink-800",
        paper: "bg-paper text-ink-950 hoverable:hover:bg-paper-deep",
      },
      size: {
        // 36px floor for sm, 44px+ from md up.
        sm: "h-9 min-h-9 px-3.5 text-micro",
        md: "h-11 min-h-11 px-5 text-micro",
        lg: "h-12 min-h-12 px-7 text-xs",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  },
);

/** Server component: it holds no state, so it only joins the client bundle when
 *  a client parent passes it an onClick. */
export function Button({
  children,
  variant = "solid",
  size = "md",
  href,
  external = false,
  onClick,
  type = "button",
  disabled = false,
  className,
  arrow = false,
  icon,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const isLink = typeof href === "string" && href.length > 0;

  const classes = cn(
    button({ variant, size }),
    isLink && disabled && "pointer-events-none opacity-40",
    className,
  );

  const content = (
    <>
      {icon === undefined || icon === null ? null : (
        <span aria-hidden="true" className="inline-flex shrink-0 items-center">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {arrow ? (
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex shrink-0 translate-x-0 items-center",
            "transition-transform duration-[120ms] ease-swift",
            // Hover-only, fine-pointer-only, and dropped under reduced motion.
            "motion-safe:hoverable:group-hover/button:translate-x-1",
          )}
        >
          <ArrowRight className="size-4" strokeWidth={1.75} />
        </span>
      ) : null}
    </>
  );

  if (isLink) {
    return (
      <Link
        href={href}
        className={classes}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={disabled ? undefined : onClick}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";

export type TagTone = "flare" | "ash" | "outline" | "paper";

export type TagProps = {
  children: React.ReactNode;
  tone?: TagTone;
  className?: string;
};

/**
 * Mono label. Square-ish corners on purpose: `rounded-sm`, never a pill.
 * A capsule sitting above an `<h1>` is a documented slop tell, so the default
 * surface is a hairline block, not a badge.
 */
const tag = cva(
  [
    "inline-flex items-center rounded-sm border px-2 py-[0.3125rem]",
    "font-mono text-micro uppercase whitespace-nowrap",
  ],
  {
    variants: {
      tone: {
        flare: "border-transparent bg-flare text-ink-950",
        ash: "border-transparent bg-ink-800 text-ash",
        outline: "border-ink-600 text-paper",
        paper: "border-transparent bg-paper text-ink-950",
      },
    },
    defaultVariants: { tone: "outline" },
  },
);

export function Tag({ children, tone = "outline", className }: TagProps) {
  return <span className={cn(tag({ tone }), className)}>{children}</span>;
}

"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/cn";

/* ============================================================================
   Accordion — disclosure built on real buttons.

   The panel animates `grid-template-rows: 0fr -> 1fr` plus opacity, so it is a
   transform/opacity-class animation off the layout path (the row track is the
   one exception the technique requires). Reduced motion makes the swap instant
   through the `motion-reduce` variant; the global stylesheet also floors every
   transition duration to 0.01ms.
   ========================================================================= */

export type AccordionItem = { id: string; q: string; a: string };

export type AccordionProps = {
  items: AccordionItem[];
  /** Only one panel open at a time. Default true. */
  single?: boolean;
  defaultOpenId?: string;
  className?: string;
};

export function Accordion({ items, single = true, defaultOpenId, className }: AccordionProps) {
  const baseId = useId();
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenId ? [defaultOpenId] : []);

  const toggle = (id: string) => {
    setOpenIds((previous) => {
      if (previous.includes(id)) return previous.filter((value) => value !== id);
      return single ? [id] : [...previous, id];
    });
  };

  return (
    <div className={cn("border-t border-[color:var(--line)]", className)}>
      {items.map((item) => {
        const open = openIds.includes(item.id);
        const triggerId = `${baseId}-trigger-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;

        return (
          <div key={item.id} className="border-b border-[color:var(--line)]">
            <h3>
              <button
                type="button"
                id={triggerId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                data-cursor="hover"
                className={cn(
                  "u-press flex w-full items-center justify-between gap-6 py-5 text-left",
                  "font-sans text-lg font-medium text-paper",
                  "transition-colors duration-[160ms] ease-swift hoverable:hover:text-flare-soft",
                )}
              >
                <span className="min-w-0">{item.q}</span>
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "size-4 shrink-0 transition-transform duration-[var(--dur-ui)] ease-swift motion-reduce:transition-none",
                    open ? "rotate-180 text-flare" : "rotate-0 text-ash",
                  )}
                />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              inert={!open}
              className={cn(
                "grid transition-[grid-template-rows] duration-[var(--dur-panel)] ease-glide motion-reduce:transition-none",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p
                  className={cn(
                    "u-measure pb-6 pr-8 text-paper/80",
                    "transition-opacity duration-[var(--dur-panel)] ease-glide motion-reduce:transition-none",
                    open ? "opacity-100" : "opacity-0",
                  )}
                >
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

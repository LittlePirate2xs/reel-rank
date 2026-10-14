"use client";

import * as React from "react";
import {
  calculateEstimate,
  ESTIMATOR_COPY,
  ESTIMATOR_RATES,
  type AdLengthOption,
  type CalculatedEstimate,
} from "@/content/estimator";
import { PriceTag } from "@/components/offers/PriceTag";
import { Tag } from "@/components/primitives/Tag";
import { Button } from "@/components/primitives/Button";
import { cn, usd } from "@/lib/cn";
import { Check } from "lucide-react";

export type ScopeEstimatorProps = {
  className?: string;
  mode?: "standalone" | "inline";
  onApplyEstimate?: (estimate: CalculatedEstimate) => void;
  initialMotionCount?: number;
  initialAdLength?: AdLengthOption;
  initialIncludeSearch?: boolean;
};

export function ScopeEstimator({
  className,
  mode = "standalone",
  onApplyEstimate,
  initialMotionCount = 3,
  initialAdLength = "15s",
  initialIncludeSearch = false,
}: ScopeEstimatorProps) {
  const [motionCount, setMotionCount] = React.useState<number>(() =>
    Math.min(Math.max(1, Math.round(initialMotionCount)), 5),
  );
  const [adLength, setAdLength] = React.useState<AdLengthOption>(initialAdLength);
  const [includeSearch, setIncludeSearch] =
    React.useState<boolean>(initialIncludeSearch);

  const estimate = React.useMemo<CalculatedEstimate>(() => {
    return calculateEstimate({
      motionCount,
      adLength,
      includeSearch,
    });
  }, [motionCount, adLength, includeSearch]);

  const contactUrl = React.useMemo(() => {
    const ideaSummary = `Calculated Studio Estimate (${usd(estimate.totalPrice)}):\n• Motion graphics: ${motionCount}\n• Ad length: ${adLength}\n• Search visibility: ${includeSearch ? "Included" : "None"}\n• Estimated turnaround: ${estimate.turnaround}`;

    const params = new URLSearchParams({
      scope: estimate.scopeLabel,
      budget: estimate.budgetBucket,
      idea: ideaSummary,
    });

    return `/contact?${params.toString()}`;
  }, [estimate, motionCount, adLength, includeSearch]);

  return (
    <div
      className={cn(
        "rounded-lg border border-ink-700 bg-ink-900/80 p-6 backdrop-blur-md sm:p-8 lg:p-10",
        className,
      )}
      aria-labelledby="estimator-heading"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Interactive Controls */}
        <div className="space-y-8 lg:col-span-7">
          {/* Motion Graphics Count */}
          <div>
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="motion-count-control"
                className="font-display text-sm font-extrabold uppercase tracking-tight text-paper"
              >
                {ESTIMATOR_COPY.motionLabel}
              </label>
              <span className="font-mono text-xs font-semibold tabular-nums text-flare">
                {motionCount} {motionCount === 1 ? "graphic" : "graphics"} (
                {usd(ESTIMATOR_RATES.motionGraphics[motionCount] ?? 250)})
              </span>
            </div>
            <p className="mt-1 text-xs text-ash">{ESTIMATOR_COPY.motionHint}</p>
            <div
              id="motion-count-control"
              role="group"
              aria-label={ESTIMATOR_COPY.motionLabel}
              className="mt-4 grid grid-cols-5 gap-2"
            >
              {[1, 2, 3, 4, 5].map((count) => {
                const isActive = motionCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setMotionCount(count)}
                    aria-pressed={isActive}
                    className={cn(
                      "u-press flex h-11 items-center justify-center rounded-sm font-mono text-sm select-none transition-colors duration-[120ms] ease-swift active:scale-[0.97]",
                      isActive
                        ? "bg-flare font-bold text-ink-950"
                        : "border border-ink-700 bg-ink-850/50 text-paper hoverable:hover:border-ink-500 hoverable:hover:bg-ink-800",
                    )}
                  >
                    {count}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ad Length Selection */}
          <div>
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="ad-length-control"
                className="font-display text-sm font-extrabold uppercase tracking-tight text-paper"
              >
                {ESTIMATOR_COPY.adLengthLabel}
              </label>
              <span className="font-mono text-xs font-semibold tabular-nums text-flare">
                {usd(ESTIMATOR_RATES.adLength[adLength] ?? 500)}
              </span>
            </div>
            <p className="mt-1 text-xs text-ash">{ESTIMATOR_COPY.adLengthHint}</p>
            <div
              id="ad-length-control"
              role="group"
              aria-label={ESTIMATOR_COPY.adLengthLabel}
              className="mt-4 grid grid-cols-2 gap-3"
            >
              {(["15s", "60s"] as const).map((len) => {
                const isActive = adLength === len;
                return (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setAdLength(len)}
                    aria-pressed={isActive}
                    className={cn(
                      "u-press flex h-12 flex-col items-center justify-center rounded-sm px-4 select-none transition-colors duration-[120ms] ease-swift active:scale-[0.97]",
                      isActive
                        ? "bg-flare font-bold text-ink-950"
                        : "border border-ink-700 bg-ink-850/50 text-paper hoverable:hover:border-ink-500 hoverable:hover:bg-ink-800",
                    )}
                  >
                    <span className="font-mono text-xs uppercase tracking-wider">
                      {len === "15s" ? "15s advertisement" : "60s advertisement"}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 font-mono text-micro tabular-nums",
                        isActive ? "font-semibold text-ink-950/80" : "text-ash",
                      )}
                    >
                      {len === "15s" ? "$500 flat" : "$1,000 flat"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Visibility Toggle */}
          <div>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-sm font-extrabold uppercase tracking-tight text-paper">
                {ESTIMATOR_COPY.searchLabel}
              </span>
              <span className="font-mono text-xs font-semibold tabular-nums text-flare">
                +${ESTIMATOR_RATES.searchVisibility}
              </span>
            </div>
            <button
              type="button"
              role="checkbox"
              aria-checked={includeSearch}
              onClick={() => setIncludeSearch((prev) => !prev)}
              className={cn(
                "u-press mt-3 flex w-full items-start gap-4 rounded-sm border p-4 text-left transition-colors duration-[120ms] ease-swift active:scale-[0.98]",
                includeSearch
                  ? "border-flare/60 bg-flare/10 text-paper"
                  : "border-ink-700 bg-ink-850/40 text-paper hoverable:hover:border-ink-500",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors",
                  includeSearch
                    ? "border-flare bg-flare font-bold text-ink-950"
                    : "border-ink-600 bg-ink-900",
                )}
              >
                {includeSearch && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-paper">
                  SEO, GEO & AEO Visibility Engine
                </p>
                <p className="text-xs leading-relaxed text-ash">
                  {ESTIMATOR_COPY.searchDescription}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Live Calculation Readout & CTA */}
        <div className="flex flex-col justify-between rounded-md border border-ink-700/80 bg-ink-950/70 p-6 sm:p-8 lg:col-span-5">
          <div className="space-y-6">
            <div>
              <p className="u-eyebrow text-ash">Estimated flat investment</p>
              <div className="mt-2">
                <PriceTag
                  price={usd(estimate.totalPrice)}
                  unit="flat estimate"
                  size="lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="u-eyebrow text-ash">Production turnaround</p>
              <div>
                <Tag tone="flare">{estimate.turnaround}</Tag>
              </div>
            </div>

            <div className="border-t border-ink-800 pt-5">
              <p className="u-eyebrow text-ash">Deliverable breakdown</p>
              <ul className="mt-3 space-y-2.5 font-mono text-xs text-paper">
                {estimate.breakdown.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-flare" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-ink-800 pt-5">
              <p className="u-eyebrow text-ash">Studio commitment</p>
              <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-ash">
                {ESTIMATOR_COPY.commitments.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-flare">✓</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-ink-800 pt-6">
            {mode === "inline" && onApplyEstimate ? (
              <Button
                type="button"
                onClick={() => onApplyEstimate(estimate)}
                size="lg"
                arrow
                className="w-full"
              >
                {ESTIMATOR_COPY.ctaContact}
              </Button>
            ) : (
              <Button
                href={contactUrl}
                size="lg"
                arrow
                className="w-full"
              >
                {ESTIMATOR_COPY.ctaOffers}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

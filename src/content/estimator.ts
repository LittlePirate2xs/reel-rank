export type AdLengthOption = "15s" | "60s";

export type EstimateInput = {
  motionCount: number;
  adLength: AdLengthOption;
  includeSearch: boolean;
};

export type CalculatedEstimate = {
  totalPrice: number;
  motionPrice: number;
  adPrice: number;
  searchPrice: number;
  turnaround: string;
  scopeLabel: string;
  budgetBucket: string;
  breakdown: string[];
};

export const ESTIMATOR_RATES = {
  motionGraphics: {
    1: 100,
    2: 180,
    3: 250,
    4: 325,
    5: 400,
  } as Record<number, number>,
  adLength: {
    "15s": 500,
    "60s": 1000,
  } as Record<AdLengthOption, number>,
  searchVisibility: 1000,
} as const;

export const ESTIMATOR_COPY = {
  title: "Studio Scope & Budget Estimator",
  eyebrow: "Live pricing calculator",
  lead: "Tailor the exact deliverable mix for your campaign. See flat-rate investment and verified turnaround in real time.",
  motionLabel: "Motion graphics count",
  motionHint: "Rhythm, visual hooks, and title cards (1 to 5)",
  adLengthLabel: "Video advertisement length",
  adLengthHint: "Scripted narrative and creative direction",
  searchLabel: "Search visibility inclusion",
  searchDescription:
    "SEO, GEO & AEO dashboard tracking Google, ChatGPT, Claude, and Perplexity visibility (+$1,000)",
  turnaroundFast: "Initial draft in 24 hours",
  turnaroundStandard: "Initial draft in 48 hours",
  turnaroundSearchSuffix: " · Search dashboard in 3 working days",
  ctaOffers: "Start brief with this estimate",
  ctaContact: "Apply estimate to brief",
  commitments: [
    "Scope, deliverables, and formats confirmed in writing before production starts.",
    "Refined with your feedback inside the agreed creative direction.",
  ],
} as const;

export function calculateEstimate(input: EstimateInput): CalculatedEstimate {
  const motionPrice = ESTIMATOR_RATES.motionGraphics[input.motionCount] ?? 250;
  const adPrice = ESTIMATOR_RATES.adLength[input.adLength] ?? 500;
  const searchPrice = input.includeSearch ? ESTIMATOR_RATES.searchVisibility : 0;
  const totalPrice = motionPrice + adPrice + searchPrice;

  const baseTurnaround =
    input.motionCount <= 3 && input.adLength === "15s"
      ? ESTIMATOR_COPY.turnaroundFast
      : ESTIMATOR_COPY.turnaroundStandard;

  const turnaround = input.includeSearch
    ? `${baseTurnaround}${ESTIMATOR_COPY.turnaroundSearchSuffix}`
    : baseTurnaround;

  const scopeLabel = `Custom scope: ${input.motionCount} motion graphic${
    input.motionCount > 1 ? "s" : ""
  }, ${input.adLength} ad${input.includeSearch ? " + search visibility" : ""}`;

  let budgetBucket = "Under $500";
  if (totalPrice >= 500 && totalPrice <= 1000) budgetBucket = "$500 to $1,000";
  else if (totalPrice > 1000 && totalPrice <= 2000) budgetBucket = "$1,000 to $2,000";
  else if (totalPrice > 2000 && totalPrice <= 5000) budgetBucket = "$2,000 to $5,000";
  else if (totalPrice > 5000) budgetBucket = "Above $5,000";

  const breakdown = [
    `${input.motionCount} motion graphic${input.motionCount > 1 ? "s" : ""} ($${motionPrice})`,
    `${input.adLength === "15s" ? "15-second" : "60-second"} advertisement ($${adPrice})`,
    ...(input.includeSearch
      ? ["Search visibility (SEO/GEO/AEO dashboard) ($1,000)"]
      : []),
  ];

  return {
    totalPrice,
    motionPrice,
    adPrice,
    searchPrice,
    turnaround,
    scopeLabel,
    budgetBucket,
    breakdown,
  };
}

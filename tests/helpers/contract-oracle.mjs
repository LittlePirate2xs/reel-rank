/**
 * Reel & Rank — Authoritative Contract Oracle
 *
 * Derived strictly from:
 * - ORIGINAL_REQUEST.md (Requirements R1, R2, R3, R4)
 * - PROJECT.md (Architecture, Feature Inventory F1-F31, Interface Contracts)
 * - TEST_INFRA.md (Coverage Thresholds and Feature Inventory)
 * - docs/CONTRACTS.md (Content Rules)
 */

export const ORACLE = {
  studio: {
    name: "Reel & Rank",
    foundedBy: "Manny Singh",
    founderJobTitle: "Founder & Creative Technologist",
    corporateHistory: ["Salesforce", "United Airlines", "Morgan Stanley"],
    email: "manny@reelandrank.com",
    helloEmail: "hello@reelandrank.com",
    city: "Houston",
    region: "Texas",
    country: "USA",
    latitude: 29.7604,
    longitude: -95.3698,
    url: "https://reelandrank.com",
  },

  pricingTiers: [
    { slug: "motion-graphics-set", priceFrom: 250, label: "$250" },
    { slug: "fifteen-second-ad", priceFrom: 500, label: "$500" },
    { slug: "sixty-second-ad", priceFrom: 1000, label: "$1,000" },
    { slug: "search-visibility", priceFrom: 1000, label: "From $1,000" },
    { slug: "selling-campaign", priceFrom: 2000, label: "From $2,000" },
  ],

  estimator: {
    motionRates: {
      1: 100,
      2: 180,
      3: 250,
      4: 325,
      5: 400,
    },
    adRates: {
      "15s": 500,
      "60s": 1000,
    },
    searchRate: 1000,

    turnaround: {
      fast: "Initial draft in 24 hours",
      standard: "Initial draft in 48 hours",
      searchSuffix: " · Search dashboard in 3 working days",
    },

    calculate(input) {
      const motionPrice = this.motionRates[input.motionCount] ?? 250;
      const adPrice = this.adRates[input.adLength] ?? 500;
      const searchPrice = input.includeSearch ? this.searchRate : 0;
      const totalPrice = motionPrice + adPrice + searchPrice;

      const baseTurnaround =
        input.motionCount <= 3 && input.adLength === "15s"
          ? this.turnaround.fast
          : this.turnaround.standard;

      const turnaround = input.includeSearch
        ? `${baseTurnaround}${this.turnaround.searchSuffix}`
        : baseTurnaround;

      let budgetBucket = "Under $500";
      if (totalPrice >= 500 && totalPrice <= 1000) budgetBucket = "$500 to $1,000";
      else if (totalPrice > 1000 && totalPrice <= 2000) budgetBucket = "$1,000 to $2,000";
      else if (totalPrice > 2000 && totalPrice <= 5000) budgetBucket = "$2,000 to $5,000";
      else if (totalPrice > 5000) budgetBucket = "Above $5,000";

      const scopeLabel = `Custom scope: ${input.motionCount} motion graphic${
        input.motionCount > 1 ? "s" : ""
      }, ${input.adLength} ad${input.includeSearch ? " + search visibility" : ""}`;

      return {
        totalPrice,
        motionPrice,
        adPrice,
        searchPrice,
        turnaround,
        budgetBucket,
        scopeLabel,
      };
    },
  },

  motion: {
    springs: {
      criticallyDamped: { type: "spring", bounce: 0, duration: 0.35 },
      momentum: { type: "spring", bounce: 0.16, duration: 0.4 },
      snappy: { type: "spring", bounce: 0, duration: 0.22 },
      press: { type: "spring", bounce: 0, duration: 0.14 },
    },
    pressDurationMs: 40,
    audioStorageKey: "reel_audio_muted",
  },

  tokens: {
    ink950: "#050814",
    flare: "#ff4a1c",
    displayFont: "Archivo",
    sansFont: "Instrument Sans",
    monoFont: "Azeret Mono",
  },

  directAnswerWordLimits: {
    min: 45,
    max: 60,
  },

  countWords(text) {
    if (!text || typeof text !== "string") return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  },
};

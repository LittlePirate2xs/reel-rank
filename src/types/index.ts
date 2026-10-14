/* ============================================================================
   Reel & Rank — domain types
   ========================================================================= */

export type Slug = string;

/** A media asset referenced through the manifest in `lib/media.ts`. */
export type MediaAsset = {
  id: string;
  kind: "image" | "video";
  /** Absolute path under /public. Empty string when not yet supplied. */
  src: string;
  /** Poster frame for video, or the fallback still. Empty when not supplied. */
  poster: string;
  alt: string;
  width: number;
  height: number;
  /**
   * True when there is no still to draw, so components must render the
   * designed placeholder frame rather than a broken image.
   *
   * For an image that means the file is missing. For a video it means the
   * *poster* is missing: a poster is a still, so it can be shown on its own
   * even when the video file has not been supplied yet.
   */
  placeholder: boolean;
  /**
   * Videos only: true when the video file itself is present and can be played.
   * Always false for images.
   *
   * This is separate from `placeholder` so a film can show a real poster in
   * every grid while the player still tells the truth about the missing file.
   */
  playable: boolean;
};

export type WorkKind = "campaign" | "film" | "motion" | "ad";

export type Film = {
  id: Slug;
  /** Short label used in rails and the player queue. */
  label: string;
  /** Seconds, drives the timecode display. Null when unknown. */
  duration: number | null;
  orientation: "landscape" | "portrait" | "square";
  media: MediaAsset;
  /** ISO 8601 date string for VideoObject structured metadata. */
  uploadDate?: string;
};

export type WorkItem = {
  slug: Slug;
  title: string;
  /** One-line hook. */
  hook: string;
  kind: WorkKind;
  client: string;
  /** Honest provenance — shown in the UI, never hidden. */
  credit: string;
  year: string;
  summary: string;
  services: string[];
  hero: MediaAsset;
  gallery: MediaAsset[];
  films: Film[];
  /** Marked true for RamanRasa founder-owned work. */
  founderOwned: boolean;
};

export type OfferTier = "entry" | "flagship";

export type Offer = {
  slug: Slug;
  /** Position in the price ladder, 1-based. */
  order: number;
  name: string;
  /** Price as displayed, e.g. "$250" or "From $1,000". */
  price: string;
  /** Machine-readable starting price in USD, for sorting and JSON-LD. */
  priceFrom: number;
  unit: string;
  tagline: string;
  description: string;
  deliverables: string[];
  /** The line this offer turns on — i.e. who it is for. */
  bestFor: string;
  turnaround: string;
  /** Verbatim commitments. These are contractual and must not be softened. */
  commitments: string[];
  /** Verbatim disclaimers. These must not be removed. */
  disclaimers: string[];
  tier: OfferTier;
  accent: boolean;
  /** Standalone 45–60 word definitional block for AI search extraction. */
  directAnswer: string;
};

export type CareerTier = {
  slug: Slug;
  order: number;
  name: string;
  price: string;
  priceFrom: number;
  unit: string;
  tagline: string;
  description: string;
  includes: string[];
  isComplete: boolean;
};

export type TeamMember = {
  id: Slug;
  name: string;
  role: string;
  /** What this person actually does, in plain words. */
  focus: string;
  bio: string;
  initials: string;
  portrait: MediaAsset | null;
};

export type ProcessStep = {
  id: string;
  index: number;
  title: string;
  body: string;
  detail: string;
};

export type FaqItem = {
  id: string;
  q: string;
  a: string;
};

export type NavItem = {
  label: string;
  href: string;
  /** Short description used by the mobile menu. */
  hint?: string;
};

export type InquiryPayload = {
  scope: string;
  idea: string;
  name: string;
  email: string;
  company?: string;
  budget?: string;
  timeline?: string;
};

export type InquiryResult =
  | { ok: true; reference: string; receivedAt: string; summary: string }
  | { ok: false; errors: Record<string, string> };

/* --- Make a Noise & Community Gallery -------------------------------------- */

export interface Noise {
  id: string;
  slug: string;
  title: string;
  idea_summary: string;
  video_url: string;
  poster_url: string;
  views: number;
  created_at: string;
  author?: string;
}

export interface NoiseSubmission {
  id: string;
  email: string;
  idea: string;
  status: string;
  created_at: string;
}

export interface NoiseSubmitPayload {
  email: string;
  idea: string;
}

export type NoiseSubmitResult =
  | { ok: true; id?: string; referenceCode: string; fallback?: boolean }
  | { ok: false; errors?: { email?: string; idea?: string; form?: string; [key: string]: string | undefined }; error?: string };


import type { Film, WorkItem } from "@/types";
import { campaign, filmPosters, filmSources, motionSamples } from "@/lib/media";

/* ============================================================================
   Work.

   Honesty is a design decision here, not a footnote. Everything below is
   RamanRasa, founder Manny Singh's own brand, and is AI-assisted creative.
   None of it is presented as a client testimonial or a performance case study.
   ========================================================================= */

const CAMPAIGN_CREDIT = "RamanRasa · founder-owned creative · AI-assisted";

const films: Film[] = filmSources.map((source, i) => ({
  id: `part-${String(i + 1).padStart(2, "0")}`,
  label: `Part ${String(i + 1).padStart(2, "0")}`,
  duration: null,
  orientation: "landscape" as const,
  media: { ...source, poster: filmPosters[i].src },
}));

export const work: WorkItem[] = [
  {
    slug: "flavors-chase-me",
    title: "Flavors Chase Me",
    hook: "I don't chase flavour. Flavour chases me.",
    kind: "campaign",
    client: "RamanRasa",
    credit: CAMPAIGN_CREDIT,
    year: "2025",
    summary:
      "A character, a world and one very bold idea. Spice Man walks through a series of unexpected scenes, each one built around a single flavour and a single punchline. Eight films, one creative world.",
    services: [
      "Creative direction",
      "Campaign storytelling",
      "Character world-building",
      "Short-form film series",
    ],
    hero: campaign.hero,
    gallery: [...campaign.stills],
    films,
    founderOwned: true,
  },
  {
    slug: "autumn-cover-motion",
    title: "Autumn Cover Motion",
    hook: "A still product shot, given a season.",
    kind: "motion",
    client: "RamanRasa",
    credit: CAMPAIGN_CREDIT,
    year: "2025",
    summary:
      "A motion treatment built on an autumn still life. Cinnamon moves through the frame, the light shifts and a flat product image becomes a piece that can carry a feed or a banner.",
    services: ["Motion graphics", "Product motion", "Sound design"],
    hero: motionSamples[0],
    gallery: [],
    films: [
      {
        id: "autumn-cover",
        label: "Autumn Cover",
        duration: null,
        orientation: "landscape",
        media: motionSamples[0],
      },
    ],
    founderOwned: true,
  },
  {
    slug: "fall-spice-reel",
    title: "Fall Spice Reel",
    hook: "Nine by sixteen, built for the scroll.",
    kind: "film",
    client: "RamanRasa",
    credit: CAMPAIGN_CREDIT,
    year: "2025",
    summary:
      "A vertical reel cut for social. Warm palette, fast rhythm and a hook that survives being watched with the sound off.",
    services: ["Vertical film", "Edit and grade", "Social formats"],
    hero: motionSamples[1],
    gallery: [],
    films: [
      {
        id: "fall-spice",
        label: "Fall Spice",
        duration: null,
        orientation: "portrait",
        media: motionSamples[1],
      },
    ],
    founderOwned: true,
  },
  {
    slug: "brand-store-loop",
    title: "Brand Store Loop",
    hook: "A product page that keeps moving.",
    kind: "ad",
    client: "RamanRasa",
    credit: CAMPAIGN_CREDIT,
    year: "2025",
    summary:
      "A fifteen-second loop made for a retail brand store. It has to read at a glance, work without sound and repeat without feeling like a repeat.",
    services: ["15-second advertisement", "Retail loop", "Format adaptation"],
    hero: motionSamples[2],
    gallery: [],
    films: [
      {
        id: "brand-store",
        label: "Brand Store Loop",
        duration: 15,
        orientation: "landscape",
        media: motionSamples[2],
      },
    ],
    founderOwned: true,
  },
];

export function getWork(slug: string): WorkItem | undefined {
  return work.find((w) => w.slug === slug);
}

export const featured = work[0];

/** Flat list of every film across the studio, used by the work rail. */
export const allFilms = work.flatMap((item) =>
  item.films.map((film) => ({ ...film, workSlug: item.slug, workTitle: item.title })),
);

export const workKinds = [
  { id: "all", label: "Everything" },
  { id: "campaign", label: "Campaigns" },
  { id: "film", label: "Films" },
  { id: "motion", label: "Motion graphics" },
  { id: "ad", label: "Advertisements" },
] as const;

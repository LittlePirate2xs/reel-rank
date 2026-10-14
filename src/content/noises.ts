import type { Noise } from "@/types";

/* ============================================================================
   All The Little Noises — Seeded Community Gallery Data

   Curated short-form visual ideas submitted by visitors and brought to life
   by the studio. Used as the offline & build-time fallback when Supabase
   is unreachable or unauthenticated.
   ========================================================================= */

export const SEEDED_NOISES: Noise[] = [
  {
    id: "noise-01",
    slug: "liquid-gold-viscosity",
    title: "Liquid Gold Viscosity",
    idea_summary:
      "Macro slow-motion capture of molten 18k gold flowing across textured obsidian, cooling into sharp architectural facets under soft amber backlighting.",
    video_url: "/media/films/film-01.mp4",
    poster_url: "/media/films/film-01.jpg",
    views: 1840,
    created_at: "2026-09-15T12:00:00Z",
    author: "Elena Rostova",
  },
  {
    id: "noise-02",
    slug: "neon-botanical-vacuum",
    title: "Neon Botanical Vacuum",
    idea_summary:
      "A nocturnal lotus blossom unfurling inside a zero-pressure vacuum chamber, illuminated strictly by pulsed ultraviolet gas tubes.",
    video_url: "/media/films/film-02.mp4",
    poster_url: "/media/films/film-02.jpg",
    views: 1290,
    created_at: "2026-09-21T16:45:00Z",
    author: "Kaito Tanaka",
  },
  {
    id: "noise-03",
    slug: "orbital-spice-drift",
    title: "Orbital Spice Drift",
    idea_summary:
      "Whole star anise, crushed cinnamon and saffron threads suspended in microgravity, caught in low-angle sunlight over the curvature of Earth.",
    video_url: "/media/films/film-03.mp4",
    poster_url: "/media/films/film-03.jpg",
    views: 2470,
    created_at: "2026-09-28T09:30:00Z",
    author: "Devon Miller",
  },
  {
    id: "noise-04",
    slug: "sub-second-titanium-snap",
    title: "Sub-Second Titanium Snap",
    idea_summary:
      "An ultra-precision mechanical lens aperture closing at 10,000 frames per second, sound-designed with raw kinetic acoustic impulse.",
    video_url: "/media/films/film-04.mp4",
    poster_url: "/media/films/film-04.jpg",
    views: 1650,
    created_at: "2026-10-03T14:10:00Z",
    author: "Maya Lindqvist",
  },
  {
    id: "noise-05",
    slug: "abyssal-quartz-refraction",
    title: "Abyssal Quartz Refraction",
    idea_summary:
      "Deep ocean bioluminescence refracting through precision-cut smoky quartz prisms, creating kaleidoscopic chromatic aberration in total dark.",
    video_url: "/media/films/film-05.mp4",
    poster_url: "/media/films/film-05.jpg",
    views: 3180,
    created_at: "2026-10-08T18:20:00Z",
    author: "Lucas Vance",
  },
  {
    id: "noise-06",
    slug: "kinetic-velvet-turbulence",
    title: "Kinetic Velvet Turbulence",
    idea_summary:
      "Heavy scarlet velvet sheets caught in an industrial wind tunnel against brutalist cast concrete, exploring fluid fabric dynamics.",
    video_url: "/media/films/film-06.mp4",
    poster_url: "/media/films/film-06.jpg",
    views: 940,
    created_at: "2026-10-12T11:05:00Z",
    author: "Sora & Alex",
  },
];

export function getSeededNoises(): Noise[] {
  return SEEDED_NOISES;
}

export function getSeededNoiseBySlug(slug: string): Noise | undefined {
  return SEEDED_NOISES.find((n) => n.slug === slug);
}

import type { NavItem } from "@/types";

export const site = {
  name: "Reel & Rank",
  wordmark: "reel&rank.",
  tagline: "Motion graphics, video and search strategy in Houston.",
  headline: "Make a little noise.",
  promise: "Your idea today. An initial example in one day.",
  foundedBy: "Manny Singh",
  founderJobTitle: "Founder & Creative Technologist",
  founderCorporateHistory: [
    "Salesforce",
    "United Airlines",
    "Morgan Stanley",
    "Banco Santander",
  ],
  founderSameAs: [
    "https://www.linkedin.com/in/mannysingh",
  ],
  location: {
    city: "Houston",
    region: "Texas",
    country: "USA",
    label: "Houston, Texas",
    latitude: 29.7604,
    longitude: -95.3698,
  },
  size: "A dedicated team of three",
  email: "hello@reelandrank.com",
  /** Placeholder until the real number is supplied. */
  phone: "",
  url: "https://reelandrank.com",
  description:
    "Reel & Rank is a three-person motion, video and search studio in Houston. Motion graphics, video ads, selling campaigns and SEO, GEO and AEO strategy. Drop an idea and get an initial example in one day.",
  founderBrand: "RamanRasa",
} as const;

export const nav: NavItem[] = [
  { label: "Work", href: "/work", hint: "Campaigns, films and motion" },
  { label: "All The Little Noises", href: "/noises", hint: "Community ideas & generated gallery" },
  { label: "Offers", href: "/offers", hint: "Prices and what you get" },
  { label: "Career", href: "/career", hint: "Résumé, interview video, prep" },
  { label: "Studio", href: "/about", hint: "The three people behind it" },
];

export const footerNav: NavItem[] = [
  ...nav,
  { label: "Start a brief", href: "/contact" },
];

export const marquee = [
  "Motion graphics",
  "Video ads",
  "Selling campaigns",
  "SEO",
  "GEO",
  "AEO",
  "Houston, Texas",
] as const;

/** Copy for the contact route, so the page hardcodes nothing. */
export const contactIntro = {
  tag: "An initial example in one day",
  heading: "Tell us the idea.",
  lead: "A rough thought is a perfectly good starting point. We read every brief ourselves, ask anything unclear, and come back within one working day with something you can actually look at.",
  facts: [
    { label: "Where", value: "Houston, Texas" },
    { label: "Reply time", value: "One working day" },
  ],
} as const;

export const disciplines = [  {
    id: "motion",
    label: "Motion graphics",
    body: "Rhythm, a visual hook and a little more life in your message.",
  },
  {
    id: "video",
    label: "Video ads",
    body: "Fifteen seconds or a full minute, built around one clear idea.",
  },
  {
    id: "campaign",
    label: "Selling campaigns",
    body: "Message, audience and creative direction joined into one push.",
  },
  {
    id: "search",
    label: "Search visibility",
    body: "SEO, GEO and AEO, with a dashboard that shows what we agreed to track.",
  },
] as const;

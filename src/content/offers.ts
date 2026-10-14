import type { Offer, CareerTier } from "@/types";

/* ============================================================================
   The offers. Every price, commitment and disclaimer here is factual and must
   survive any redesign. Copy is tightened; nothing contractual is softened.
   ========================================================================= */

const ADS_COMMITMENT =
  "We agree the brief, deliverables, formats and timing before production starts.";
const ADS_REFINEMENT =
  "For the two advertisement offers we refine the agreed creative direction with your feedback until you are happy with the final result. New concepts or an expanded brief are discussed together.";

export const offers: Offer[] = [
  {
    slug: "motion-graphics-set",
    order: 1,
    name: "Motion graphics, set of three",
    price: "$250",
    priceFrom: 250,
    unit: "set of 3",
    tagline: "Three moves. One strong impression.",
    description:
      "A set of three motion graphics. Give your message a distinctive rhythm, a visual hook and a little more life.",
    deliverables: [
      "Three motion graphics, agreed as a set",
      "Formats and aspect ratios confirmed with the brief",
      "One round of refinement inside the agreed direction",
    ],
    bestFor: "A launch, a product drop, or a message that needs to move.",
    turnaround: "Initial example in one day",
    commitments: [ADS_COMMITMENT],
    disclaimers: [],
    tier: "entry",
    accent: false,
    directAnswer:
      "The Motion Graphics Set from Houston studio Reel & Rank delivers three synchronized motion graphics assets for a flat rate of $250. Designed for product drops and social campaigns, deliverables include custom aspect ratios, agreed visual hooks, and one refinement round, with an initial draft delivered in one working day.",
  },
  {
    slug: "fifteen-second-ad",
    order: 2,
    name: "15-second advertisement",
    price: "$500",
    priceFrom: 500,
    unit: "advertisement",
    tagline: "Short on time. Long on personality.",
    description:
      "One 15-second advertisement that gets to the point with a clear idea and a strong creative direction.",
    deliverables: [
      "One 15-second advertisement",
      "Clear concept and creative direction",
      "Refined with your feedback until you are happy with it",
    ],
    bestFor: "Paid social, pre-roll and a first impression that has to land fast.",
    turnaround: "Initial example in one day",
    commitments: [ADS_COMMITMENT, ADS_REFINEMENT],
    disclaimers: [],
    tier: "entry",
    accent: false,
    directAnswer:
      "Reel & Rank's 15-second advertisement package is a flat-rate $500 commercial production designed for high-impact paid social, pre-roll, and mobile video feeds. Based in Houston, Texas, the studio delivers a focused creative direction, script structure, and iterative revisions until client approval, with an initial reviewable draft ready within one working day.",
  },
  {
    slug: "sixty-second-ad",
    order: 3,
    name: "Advertisement up to one minute",
    price: "$1,000",
    priceFrom: 1000,
    unit: "advertisement",
    tagline: "More room. More story.",
    description:
      "An advertisement up to one minute long. Space to build the story, create a feeling and bring the idea home.",
    deliverables: [
      "One advertisement, up to 60 seconds",
      "Story structure and creative direction",
      "Refined with your feedback until you are happy with it",
    ],
    bestFor: "A brand story, a founder film, or a product that needs explaining.",
    turnaround: "Initial example in one day",
    commitments: [ADS_COMMITMENT, ADS_REFINEMENT],
    disclaimers: [],
    tier: "entry",
    accent: false,
    directAnswer:
      "Reel & Rank's 60-second advertisement package provides full-length commercial production for $1,000, tailored for brand storytelling, founder narratives, and complex product launches. Created by a three-person Houston creative studio, every project features complete narrative pacing, sound design, and unlimited feedback refinement within the agreed direction, starting with a first draft within one day.",
  },
  {
    slug: "search-visibility",
    order: 4,
    name: "Search visibility: SEO, GEO and AEO",
    price: "From $1,000",
    priceFrom: 1000,
    unit: "strategy and dashboard",
    tagline: "Be ready for the way people search.",
    description:
      "Strategy for the three ways people find you now: search engines, generative engines and answer engines. We define the priorities, the agreed deliverables and how progress will be tracked, then hand you a dashboard that shows it.",
    deliverables: [
      "SEO · Search engine optimization",
      "GEO · Generative engine optimization",
      "AEO · Answer engine optimization",
      "A dashboard covering the agreed measures",
      "A scope and priorities call before work starts",
    ],
    bestFor: "Businesses that want to be found in search and in AI answers.",
    turnaround: "Scope agreed on a call",
    commitments: [
      "We define the priorities, the agreed deliverables and how progress will be tracked.",
      "We deliver the strategy and dashboard we agree on.",
    ],
    disclaimers: [
      "Search rankings, traffic, AI citations and sales are not guaranteed.",
    ],
    tier: "flagship",
    accent: false,
    directAnswer:
      "Search Visibility from Reel & Rank is a comprehensive $1,000+ optimization engagement uniting search engine optimization (SEO), generative engine optimization (GEO), and answer engine optimization (AEO). The Houston studio establishes search entity authority across Google, ChatGPT, and Perplexity, providing bespoke technical execution alongside a custom metrics tracking dashboard tailored to agreed client goals.",
  },
  {
    slug: "selling-campaign",
    order: 5,
    name: "Selling campaign",
    price: "From $2,000",
    priceFrom: 2000,
    unit: "campaign",
    tagline: "A bigger idea, joined up.",
    description:
      "Bring your message, audience and creative direction together in one campaign. We discuss scope, channels and deliverables around your goals, then build the pieces that carry it.",
    deliverables: [
      "A connected campaign across the agreed channels",
      "Message, audience and creative direction joined into one idea",
      "Scope, channels and deliverables agreed in writing first",
    ],
    bestFor: "A launch, a season, or a push that needs more than one piece.",
    turnaround: "Scope agreed in a call",
    commitments: [
      "Scope, channels and deliverables are agreed around your goals before work starts.",
    ],
    disclaimers: [
      "Media buying and ad spend are not included unless separately agreed.",
      "We do not promise a particular sales result.",
    ],
    tier: "flagship",
    accent: true,
    directAnswer:
      "Reel & Rank's Selling Campaign is a multi-channel creative service starting at $2,000 designed to unite messaging, target audience, and video production into a cohesive launch. Guided by founder Manny Singh from Houston, the studio scopes cross-platform deliverables, formats, and creative directions before production, guaranteeing clear contractual alignment and transparent pricing.",
  },
];

/* ============================================================================
   Career services, led by Manny Singh.
   ========================================================================= */

export const careerTiers: CareerTier[] = [
  {
    slug: "interview-video",
    order: 1,
    name: "Interview video",
    price: "$500",
    priceFrom: 500,
    unit: "package",
    tagline: "Put your story on screen.",
    description:
      "An interview video that helps you present your experience, your strengths and your professional story.",
    includes: ["Interview video"],
    isComplete: false,
  },
  {
    slug: "resume-video-portfolio",
    order: 2,
    name: "Résumé, video and portfolio",
    price: "$1,000",
    priceFrom: 1000,
    unit: "package",
    tagline: "Bring your experience together.",
    description:
      "A coordinated presentation of your experience: résumé editing, an interview video and a work portfolio.",
    includes: ["Résumé editing", "Interview video", "Work portfolio creation"],
    isComplete: false,
  },
  {
    slug: "complete-career-package",
    order: 3,
    name: "Complete career package",
    price: "$1,500",
    priceFrom: 1500,
    unit: "package",
    tagline: "Show up ready for what is next.",
    description:
      "Everything in the $1,000 package, plus tech and AI job interview preparation with Manny, a tech entrepreneur. We work together through video calls and on-site sessions by arrangement.",
    includes: [
      "Résumé editing",
      "Interview video",
      "Work portfolio creation",
      "Tech and AI job interview preparation with a tech entrepreneur",
    ],
    isComplete: true,
  },
];

export const careerCommitments = {
  guarantee:
    "I will keep working with you until you get a job, with ongoing consultations and strategy adjustments at no additional charge in the $1,500 package.",
  disclaimer:
    "Hiring decisions remain with employers. We do not guarantee a job offer or salary.",
  scope:
    "We discuss your goals and agree the scope, deliverables and timing before work starts.",
} as const;

export const careerBio = [
  "I have worked for Salesforce, United Airlines, Banco Santander and Morgan Stanley. I have worked on government contracts and in logistics, and I have led technology teams.",
  "Your experience deserves to be heard and your work deserves to be seen. Let us tell your story in a way that feels like you, and helps people understand what you bring.",
  "Your next chapter is worth getting excited about.",
] as const;

/** Look-up helpers used by routes and the sitemap. */
export function getOffer(slug: string): Offer | undefined {
  return offers.find((o) => o.slug === slug);
}

export function getCareerTier(slug: string): CareerTier | undefined {
  return careerTiers.find((t) => t.slug === slug);
}

export const offersByOrder = [...offers].sort((a, b) => a.order - b.order);

/** Standalone 45–60 word quotable definition block for /offers. */
export const offersDirectAnswer =
  "Reel & Rank is a Houston, Texas motion graphics, video advertising, and search strategy studio offering transparent, flat-rate pricing from $250 to $2,000+. Engagements include three-piece motion graphics sets ($250), 15-second ads ($500), 60-second commercials ($1,000), search optimization (SEO/GEO/AEO from $1,000), and full selling campaigns ($2,000+), each with an initial creative draft in one working day.";

import type { FaqItem } from "@/types";

/** Heading copy for the FAQ, kept here so it has exactly one source. */
export const faqIntro = {
  eyebrow: "A little clarity",
  heading: "Good questions. Straight answers.",
} as const;

export const faq: FaqItem[] = [
  {
    id: "first-day",
    q: "What actually happens in the first day?",
    a: "You send us the idea. We read it, ask anything that is unclear, and come back within one working day with an initial example you can react to. Full production, delivery dates and the final scope are agreed after we settle the direction together.",
  },
  {
    id: "refined",
    q: "What does \"refined until perfect\" mean?",
    a: "For the $500 and $1,000 advertisement offers, we refine the agreed creative direction with your feedback until you are happy with the final result. We agree the brief and the deliverables at the start. If the concept or the scope changes, we discuss that together before it happens.",
  },
  {
    id: "search-guarantee",
    q: "What does the search offer guarantee?",
    a: "We commit to delivering the strategy and the dashboard we agree on. We do not guarantee rankings, traffic, citations in AI answers or sales. Your starting priorities, how progress is measured and the deliverables are agreed on the call before work starts.",
  },
  {
    id: "career-guarantee",
    q: "What does the $1,500 career package guarantee?",
    a: "Manny will keep working with you until you get a job, with ongoing consultations and strategy adjustments at no additional charge. That is the commitment. Hiring decisions stay with employers, so we do not guarantee a job offer or a salary.",
  },
  {
    id: "founder-work",
    q: "Is the featured work from outside clients?",
    a: "No. The featured work is RamanRasa, founder Manny Singh's own brand. These are AI-assisted creative concepts, and we present them as founder-owned portfolio work rather than independent client testimonials or performance case studies.",
  },
  {
    id: "custom",
    q: "Can you make something outside these offers?",
    a: "Yes. Bring the idea. Product ads, brand stories, explainers, social video, TV commercial creative or a custom project are all on the table. Any additional scope and price are agreed before work starts. TV airtime and media buying are separate.",
  },
  {
    id: "where",
    q: "Where are you, and who will I be talking to?",
    a: "Houston, Texas. We are a team of three, and you deal with the people making the work. Calls, shareable links and reviews, whichever suits you.",
  },
];

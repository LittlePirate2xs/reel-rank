import type { ProcessStep } from "@/types";

export const processIntro = {
  heading: "You bring the spark. We bring the first move.",
  body: "Drop an idea and we come back in one day with an initial example. It is a starting point for the conversation. Full production and timing are agreed once we find the direction.",
} as const;

export const process: ProcessStep[] = [
  {
    id: "idea",
    index: 1,
    title: "Drop the idea",
    body: "A rough thought, a clear brief, or something you cannot stop thinking about.",
    detail:
      "Tell us what you want to make. A sentence is enough to start. The more context you give us about who it is for and where it will run, the closer the first example lands.",
  },
  {
    id: "example",
    index: 2,
    title: "An example, in one day",
    body: "We come back with an initial example to react to.",
    detail:
      "Together we choose the direction and confirm the scope. You are reacting to something real rather than a description, which is the fastest way to find out whether we are on the right track.",
  },
  {
    id: "make",
    index: 3,
    title: "Make, refine, make it yours",
    body: "We create the work and shape it with your feedback.",
    detail:
      "Then we deliver the final formats we agreed on. For the advertisement offers, we refine the agreed creative direction with you until you are happy with the result.",
  },
];

export const manifesto = {
  eyebrow: "How we work",
  heading: "Less friction. More making.",
  points: [
    {
      id: "one-day",
      title: "An example in one day",
      body: "You get something to look at, not a proposal to read. It shortens the distance between the idea and the decision.",
    },
    {
      id: "three-people",
      title: "Three people, no relay",
      body: "The people who shape the work are the people you talk to. Nothing is handed down a chain.",
    },
    {
      id: "straight",
      title: "Straight about scope",
      body: "We agree the brief, deliverables, formats and timing before production starts. If the brief grows, we discuss it together.",
    },
  ],
} as const;

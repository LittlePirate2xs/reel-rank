import type { TeamMember } from "@/types";
import { portraits } from "@/lib/media";

/* ============================================================================
   The team.

   Manny Singh is publicly named as founder, so he is a full entry.
   The other two members have not been named on the live site yet, so they are
   modelled as role slots: `name: ""` makes the card lead with the role, which
   reads as intentional rather than unfinished. Add names and portraits when
   they are confirmed.
   ========================================================================= */

export const team: TeamMember[] = [
  {
    id: "manny",
    name: "Manny Singh",
    role: "Founder",
    focus: "Story, search strategy and career work",
    bio: "Founded Reel & Rank. Has worked for Salesforce, United Airlines, Banco Santander and Morgan Stanley, on government contracts and in logistics, and has led technology teams. Leads the search strategy and the 1-on-1 career work.",
    initials: "MS",
    portrait: portraits.manny,
  },
  {
    id: "motion-lead",
    name: "",
    role: "Motion and design",
    focus: "Motion graphics, titles and visual systems",
    bio: "Shapes how the work moves: the rhythm of a set, the type that carries a message, and the details that make a frame feel considered.",
    initials: "MD",
    portrait: null,
  },
  {
    id: "edit-lead",
    name: "",
    role: "Edit and finish",
    focus: "Edit, grade and sound",
    bio: "Puts the film together. Pacing, colour and sound, and the final pass that makes a cut feel finished rather than merely done.",
    initials: "EF",
    portrait: null,
  },
];

export const teamIntro = {
  heading: "Three people. All in.",
  body: "We are a dedicated team of three, based in Houston, and personal attention is how we work. From the first idea to the final edit you are working with the people shaping your story. We listen closely, bring ideas to the table and keep refining together.",
  founded:
    "Founded by Manny Singh, Reel & Rank brings video, motion graphics and search strategy into one creative partnership.",
} as const;

import { NextResponse } from "next/server";
import { site } from "@/content/site";
import { offersByOrder, offersDirectAnswer } from "@/content/offers";
import { careerTiers, careerCommitments, careerBio } from "@/content/offers";
import { work } from "@/content/work";
import { team } from "@/content/team";
import { faq } from "@/content/faq";
import { baseUrl } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const content = `# ${site.name} — Full Studio Specification

> ${site.description}

## 1. Studio Identification & Knowledge Graph
- **Studio Name:** ${site.name}
- **Entity Type:** ProfessionalService / LocalBusiness
- **Geographic Coordinates:** Latitude ${site.location.latitude}, Longitude ${site.location.longitude}
- **Physical Headquarters:** ${site.location.label}, ${site.location.country}
- **Founder & Creative Technologist:** ${site.foundedBy}
- **Founder Corporate History:** ${site.founderCorporateHistory.join(", ")}
- **Founder Profiles:** ${site.founderSameAs.join(", ")}
- **Primary Email:** ${site.email}
- **Primary Website:** ${baseUrl}
- **Team Composition:** Dedicated three-person studio (Creative Direction, Motion Design, Editing/Grading)

## 2. Definitional Answer Summary
${offersDirectAnswer}

## 3. Detailed Offer Catalog & Deliverables

${offersByOrder
  .map(
    (offer) => `### ${offer.name} (${offer.price})
- **Slug:** ${offer.slug}
- **Tier:** ${offer.tier}
- **Rate:** ${offer.price} (${offer.unit})
- **Starting Price (USD):** $${offer.priceFrom}
- **Turnaround Commitment:** ${offer.turnaround}
- **Best Suited For:** ${offer.bestFor}
- **Direct Answer Definition:** ${offer.directAnswer}
- **Itemized Deliverables:**
${offer.deliverables.map((d) => `  - ${d}`).join("\n")}
- **Contractual Commitments:**
${offer.commitments.map((c) => `  - ${c}`).join("\n")}
${
  offer.disclaimers.length > 0
    ? `- **Disclaimers:**\n${offer.disclaimers.map((d) => `  - ${d}`).join("\n")}`
    : ""
}`,
  )
  .join("\n\n")}

## 4. Career Packages (Mentorship by ${site.foundedBy})

${careerTiers
  .map(
    (tier) => `### ${tier.name} (${tier.price})
- **Rate:** ${tier.price} (${tier.unit})
- **Tagline:** ${tier.tagline}
- **Summary:** ${tier.description}
- **Inclusions:**
${tier.includes.map((inc) => `  - ${inc}`).join("\n")}`,
  )
  .join("\n\n")}

### Career Mentorship Commitments
- **Guarantee:** ${careerCommitments.guarantee}
- **Disclaimer:** ${careerCommitments.disclaimer}
- **Scope Protocol:** ${careerCommitments.scope}
- **Mentor Background:** ${careerBio.join(" ")}

## 5. Portfolio & Provenance Policy
All featured work on the site represents **${site.founderBrand}**, founder Manny Singh's personal brand.
It is AI-assisted creative produced to showcase aesthetic craftsmanship, pacing, and motion graphics design. It is explicitly presented as portfolio creative rather than paid client testimonials or performance marketing case studies.

### Selected Portfolio Projects
${work
  .map(
    (item) => `#### ${item.title} (${item.year})
- **Category:** ${item.kind}
- **Hook:** ${item.hook}
- **Summary:** ${item.summary}
- **Services Rendered:** ${item.services.join(", ")}
- **Provenance Credit:** ${item.credit}
- **Films Included:**
${item.films.map((f) => `  - **${f.label}** (${f.orientation}${f.duration ? `, ${f.duration}s` : ""}): ${baseUrl}${f.media.src}`).join("\n")}`,
  )
  .join("\n\n")}

## 6. Team Roster & Specializations
${team
  .map(
    (member) => `### ${member.name || member.role} (${member.role})
- **Focus:** ${member.focus}
- **Bio:** ${member.bio}`,
  )
  .join("\n\n")}

## 7. Studio Frequently Asked Questions (FAQ)
${faq
  .map(
    (item) => `### ${item.q}
${item.a}`,
  )
  .join("\n\n")}
`;

  return new NextResponse(content.trim() + "\n", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}

import { NextResponse } from "next/server";
import { site } from "@/content/site";
import { offersByOrder } from "@/content/offers";
import { careerTiers } from "@/content/offers";
import { baseUrl } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const content = `# ${site.name}

> ${site.description}

## Studio Overview
- **Name:** ${site.name}
- **Location:** ${site.location.label} (Coordinates: ${site.location.latitude}, ${site.location.longitude})
- **Team Size:** ${site.size}
- **Founder:** ${site.foundedBy} (${site.founderJobTitle})
- **Corporate Pedigree:** ${site.founderCorporateHistory.join(", ")}
- **Contact Email:** ${site.email}
- **Canonical Website:** ${baseUrl}
- **Full LLM Context:** ${baseUrl}/llms-full.txt

## Production Services & Flat-Rate Pricing
${offersByOrder
  .map(
    (offer) =>
      `- **${offer.name}:** ${offer.price} (${offer.unit}) — ${offer.turnaround}. ${offer.tagline}`,
  )
  .join("\n")}

## Career Packages (Led by ${site.foundedBy})
${careerTiers
  .map(
    (tier) =>
      `- **${tier.name}:** ${tier.price} (${tier.unit}) — ${tier.tagline}`,
  )
  .join("\n")}

## Core Philosophy & Commitments
- **Initial Draft Speed:** Creative idea submitted today receives an initial example within one working day (24 hours).
- **Scope Agreement:** Deliverables, formats, aspect ratios, and timing are locked before production starts.
- **Iterative Refinement:** Advertisement offers ($500 and $1,000) are refined with feedback until client approval within the agreed direction.
- **Search Transparency:** Strategy for SEO, GEO, and AEO with custom tracked metrics dashboard (no speculative ranking promises).
- **Founder Brand Portfolio:** Featured work is RamanRasa, founder-owned AI-assisted creative, presented as design craft rather than third-party testimonials.

## Key Links
- [Selected Work](${baseUrl}/work): Portfolio films, vertical social reels, and product motion.
- [Offers & Pricing](${baseUrl}/offers): Itemized deliverables, flat rates, and contract terms.
- [Career Prep](${baseUrl}/career): Tech and AI interview prep with Manny Singh.
- [About Studio](${baseUrl}/about): Studio team and operating philosophy.
- [Start a Brief](${baseUrl}/contact): Submit your creative idea.
`;

  return new NextResponse(content.trim() + "\n", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}

import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { ReelStrip } from "@/components/sections/ReelStrip";
import { OfferLadder } from "@/components/sections/OfferLadder";
import { Manifesto } from "@/components/sections/Manifesto";
import { ProcessRail } from "@/components/sections/ProcessRail";
import { TeamWall } from "@/components/sections/TeamWall";
import { FaqSection } from "@/components/sections/FaqSection";
import { ContactCta } from "@/components/sections/ContactCta";
import { Divider } from "@/components/primitives/Divider";
import { faq } from "@/content/faq";
import { site } from "@/content/site";
import { pageMetadata, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  path: "/",
  keywords: [
    "motion graphics Houston",
    "video ads Houston",
    "selling campaigns",
    "SEO GEO AEO",
    "creative studio Houston",
  ],
});

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }}
      />

      <Hero />

      <Divider />

      <ReelStrip />

      <Divider />

      <OfferLadder />

      <Manifesto />

      <Divider />

      <ProcessRail />

      <Divider />

      <TeamWall />

      <Divider />

      <FaqSection />

      <ContactCta />
    </>
  );
}

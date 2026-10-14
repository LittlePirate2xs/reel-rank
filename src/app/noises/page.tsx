import type { Metadata } from "next";
import { getNoises } from "@/lib/supabase";
import { NoiseCard } from "@/components/noises/NoiseCard";
import { Tag } from "@/components/primitives/Tag";
import { SplitText } from "@/components/primitives/SplitText";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { site } from "@/content/site";
import { pageMetadata, breadcrumbJsonLd, baseUrl } from "@/lib/seo";
import type { Noise } from "@/types";

/* ============================================================================
   All The Little Noises — Community Gallery Route (/noises)

   Server Component:
   - Resiliently fetches noises from Supabase (falling back to SEEDED_NOISES)
   - Schema.org breadcrumbs and VideoObject structured data for SEO/AEO/GEO
   - Apple-grade visual hierarchy with Tag, SplitText, and responsive NoiseGrid
   ========================================================================= */

export const metadata: Metadata = pageMetadata({
  title: "All The Little Noises — Community Gallery",
  description:
    "Community visual ideas and generated short-form film experiments brought to life by Reel & Rank in Houston. Submit your idea in 300 words.",
  path: "/noises",
  keywords: [
    "All The Little Noises",
    "community gallery",
    "video ideas",
    "motion graphics Houston",
    "creative studio gallery",
  ],
});

function noisesVideoObjectsJsonLd(noises: Noise[]) {
  return noises.map((noise) => {
    const poster = noise.poster_url?.startsWith("http")
      ? noise.poster_url
      : `${baseUrl}${noise.poster_url?.startsWith("/") ? "" : "/"}${noise.poster_url || "opengraph-image"}`;
    const content = noise.video_url?.startsWith("http")
      ? noise.video_url
      : `${baseUrl}${noise.video_url?.startsWith("/") ? "" : "/"}${noise.video_url || ""}`;

    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: noise.title,
      description: noise.idea_summary,
      thumbnailUrl: [poster],
      contentUrl: content,
      uploadDate: noise.created_at || "2026-10-01T00:00:00Z",
      author: {
        "@type": "Person",
        name: noise.author || "Community Creator",
      },
      publisher: {
        "@type": "Organization",
        name: site.name,
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/opengraph-image`,
        },
      },
    };
  });
}

export default async function NoisesPage() {
  const noises = await getNoises();

  return (
    <>
      {/* Schema.org Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "All The Little Noises", path: "/noises" },
            ]),
          ),
        }}
      />

      {/* Schema.org VideoObject Structured Metadata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(noisesVideoObjectsJsonLd(noises)),
        }}
      />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden pt-40 pb-16 sm:pt-48">
        <div className="shell">
          <Tag tone="flare">Community Gallery</Tag>

          <h1 className="mt-8 text-display-2">
            <SplitText text="All The Little Noises" immediate />
          </h1>

          <p className="u-measure mt-8 text-lead text-ash">
            A living gallery of visual prompts, sound designs, and motion experiments
            submitted by visitors and rendered into life by {site.name}. Every noise
            begins as an idea in 300 words.
          </p>
        </div>
      </section>

      {/* Gallery Grid Section */}
      <section className="section-y pt-0" aria-labelledby="noises-index">
        <div className="shell">
          <SectionHeading
            id="noises-index"
            eyebrow={`${noises.length} community noises`}
            title="Generated gallery"
            lead="Explore generated video pieces, inspect the original prompt, and share your favorites."
          />

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {noises.map((noise, index) => (
              <NoiseCard
                key={noise.id || noise.slug}
                noise={noise}
                priority={index < 2}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Information Notice */}
      <section className="pb-24">
        <div className="shell">
          <p className="u-measure text-sm text-ash-dim">
            Want to see your vision on this wall? Head back to the homepage and
            submit your prompt in under 300 words — {site.foundedBy} and the team deliver an
            initial draft within one working day.
          </p>
        </div>
      </section>
    </>
  );
}

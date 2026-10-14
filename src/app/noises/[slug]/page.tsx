import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SEEDED_NOISES } from "@/content/noises";
import { getNoiseBySlug } from "@/lib/supabase";
import { NoisePlayer } from "@/components/noises/NoiseCard";
import { ShareButton } from "@/components/noises/ShareButton";
import { Tag } from "@/components/primitives/Tag";
import { SplitText } from "@/components/primitives/SplitText";
import { site } from "@/content/site";
import { pageMetadata, breadcrumbJsonLd, baseUrl } from "@/lib/seo";

/* ============================================================================
   Dynamic Noise Route (/noises/[slug])

   Server Component:
   - Promise-based params: type Params = { params: Promise<{ slug: string }> }
   - export const dynamicParams = true for on-demand generated community noises
   - export function generateStaticParams() pre-rendering seeded records
   - Dynamic OpenGraph metadata with video & article tags
   - Dedicated NoisePlayer with persistent audio sync, timecode, and film slate
   - Author credit with signature flare indicator, idea snippet, and ShareButton
   ========================================================================= */

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return SEEDED_NOISES.map((noise) => ({ slug: noise.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const noise = await getNoiseBySlug(decodedSlug);

  if (!noise) {
    return pageMetadata({
      title: "Noise Not Found",
      description: "The requested community noise was not found in the gallery.",
      path: `/noises/${slug}`,
    });
  }

  const posterUrl = noise.poster_url?.startsWith("http")
    ? noise.poster_url
    : `${baseUrl}${noise.poster_url?.startsWith("/") ? "" : "/"}${noise.poster_url || "opengraph-image"}`;

  const videoUrl = noise.video_url?.startsWith("http")
    ? noise.video_url
    : `${baseUrl}${noise.video_url?.startsWith("/") ? "" : "/"}${noise.video_url || ""}`;

  const meta = pageMetadata({
    title: `${noise.title} — All The Little Noises`,
    description: noise.idea_summary,
    path: `/noises/${noise.slug}`,
    image: posterUrl,
    type: "article",
    keywords: [noise.title, "All The Little Noises", "community video", "Reel & Rank", "Houston"],
  });

  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      videos: noise.video_url ? [{ url: videoUrl, width: 1920, height: 1080 }] : undefined,
    },
  };
}

export default async function NoiseDetailPage({ params }: Params) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const noise = await getNoiseBySlug(decodedSlug);

  if (!noise) {
    notFound();
  }

  const author = noise.author && noise.author.trim().length > 0 ? noise.author : "Community Creator";

  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: noise.title,
    description: noise.idea_summary,
    thumbnailUrl: [
      noise.poster_url?.startsWith("http")
        ? noise.poster_url
        : `${baseUrl}${noise.poster_url?.startsWith("/") ? "" : "/"}${noise.poster_url || "opengraph-image"}`,
    ],
    contentUrl: noise.video_url?.startsWith("http")
      ? noise.video_url
      : `${baseUrl}${noise.video_url?.startsWith("/") ? "" : "/"}${noise.video_url || ""}`,
    uploadDate: noise.created_at || "2026-10-01T00:00:00Z",
    author: {
      "@type": "Person",
      name: author,
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
              { name: noise.title, path: `/noises/${noise.slug}` },
            ]),
          ),
        }}
      />

      {/* Schema.org VideoObject Structured Metadata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(videoJsonLd),
        }}
      />

      <article className="relative overflow-hidden pt-36 pb-24 sm:pt-44">
        <div className="shell">
          {/* Back Navigation Link */}
          <Link
            href="/noises"
            className="u-press group mb-8 inline-flex items-center gap-2 font-mono text-micro uppercase tracking-wider text-ash transition-colors duration-160 ease-soft hoverable:hover:text-paper"
          >
            <ArrowLeft aria-hidden className="size-3.5 transition-transform duration-160 ease-soft group-hover:-translate-x-1" />
            <span>Back to Community Gallery</span>
          </Link>

          {/* Header Title Area */}
          <div className="flex flex-col gap-4">
            <div>
              <Tag tone="flare">Community Noise</Tag>
            </div>

            <h1 className="text-display-3 sm:text-display-2">
              <SplitText text={noise.title} immediate />
            </h1>

            {/* Author Credit, Flare Indicator, Views & Share */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--line)] pb-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-pill bg-flare shrink-0"
                  />
                  <span className="font-mono text-xs uppercase tracking-wider text-ash">
                    Idea by <span className="text-paper">{author}</span>
                  </span>
                </div>

                <span className="text-ash/40" aria-hidden="true">·</span>

                <span className="rounded-pill border border-[color:var(--line)] bg-ink-850 px-2.5 py-0.5 font-mono text-micro uppercase tabular-nums text-ash">
                  {noise.views ? noise.views.toLocaleString() : "0"} views
                </span>
              </div>

              <ShareButton
                url={`/noises/${noise.slug}`}
                title={noise.title}
                text={noise.idea_summary}
                label="Share this noise"
              />
            </div>
          </div>

          {/* Dedicated Noise Video Player */}
          <div className="mt-8">
            <NoisePlayer noise={noise} />
          </div>

          {/* Original Idea & Prompt Section */}
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="rounded-md border border-[color:var(--line)] bg-ink-900 p-6 sm:p-8">
                <h2 className="font-mono text-micro uppercase tracking-widest text-ash">
                  Original Visitor Prompt
                </h2>
                <blockquote className="mt-4 text-lead text-paper leading-relaxed font-sans">
                  &ldquo;{noise.idea_summary}&rdquo;
                </blockquote>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-between rounded-md border border-[color:var(--line)] bg-ink-900/50 p-6 sm:p-8">
              <div>
                <h3 className="text-display-4">Make a noise</h3>
                <p className="mt-3 text-sm text-ash leading-relaxed">
                  Have an idea in mind? Leave your prompt in under 300 words.
                  {site.name} delivers an initial render within 24 hours.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-[color:var(--line)]">
                <Link
                  href="/#make-a-noise"
                  className="u-press inline-flex min-h-10 w-full items-center justify-center rounded-sm border border-flare/40 bg-flare/10 px-4 py-2 font-mono text-micro uppercase tracking-wider text-flare transition-[background-color,border-color] duration-160 ease-swift hoverable:hover:bg-flare hoverable:hover:text-ink-950"
                >
                  Submit your prompt &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

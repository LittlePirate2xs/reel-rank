import type { Metadata } from "next";
import { site } from "@/content/site";
import { offers } from "@/content/offers";
import type { Film, WorkItem } from "@/types";

/** Canonical base URL. Override with NEXT_PUBLIC_SITE_URL in production. */
export const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? site.url
).replace(/\/$/, "");

type PageMetaInput = {
  title: string;
  description: string;
  /** Path beginning with "/". */
  path: string;
  /** Absolute or root-relative OG image path. */
  image?: string;
  type?: "website" | "article";
  keywords?: string[];
};

/** Build a complete, consistent Metadata object for any route. */
export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  keywords,
}: PageMetaInput): Metadata {
  const url = `${baseUrl}${path === "/" ? "" : path}`;
  const ogImage = image ?? "/opengraph-image";

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      locale: "en_US",
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/* ---------------------------------------------------------------------------
   Structured data
   ------------------------------------------------------------------------ */

export function unifiedGraphJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${baseUrl}/#founder`,
        name: site.foundedBy,
        jobTitle: site.founderJobTitle,
        url: baseUrl,
        worksFor: { "@id": `${baseUrl}/#studio` },
        sameAs: [...site.founderSameAs],
        alumniOf: site.founderCorporateHistory.map((org) => ({
          "@type": "Organization",
          name: org,
        })),
      },
      {
        "@type": ["ProfessionalService", "LocalBusiness"],
        "@id": `${baseUrl}/#studio`,
        name: site.name,
        description: site.description,
        url: baseUrl,
        email: site.email,
        founder: { "@id": `${baseUrl}/#founder` },
        geo: {
          "@type": "GeoCoordinates",
          latitude: site.location.latitude,
          longitude: site.location.longitude,
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: site.location.city,
          addressRegion: site.location.region,
          addressCountry: "US",
        },
        areaServed: {
          "@type": "City",
          name: site.location.city,
        },
        numberOfEmployees: {
          "@type": "QuantitativeValue",
          value: 3,
        },
        knowsAbout: [
          "Motion graphics",
          "Video advertising",
          "Selling campaigns",
          "Search engine optimization",
          "Generative engine optimization",
          "Answer engine optimization",
        ],
        hasOfferCatalog: {
          "@id": `${baseUrl}/#catalog`,
        },
      },
      {
        "@type": "OfferCatalog",
        "@id": `${baseUrl}/#catalog`,
        name: `${site.name} Service Catalog`,
        itemListElement: offers.map((offer, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@id": `${baseUrl}/offers/${offer.slug}#offer`,
          },
        })),
      },
      ...offers.map((offer) => ({
        "@type": "Offer",
        "@id": `${baseUrl}/offers/${offer.slug}#offer`,
        name: offer.name,
        description: offer.description,
        price: offer.priceFrom,
        priceCurrency: "USD",
        url: `${baseUrl}/offers/${offer.slug}`,
        seller: { "@id": `${baseUrl}/#studio` },
        itemOffered: {
          "@type": "Service",
          name: offer.name,
          description: offer.directAnswer,
          provider: { "@id": `${baseUrl}/#studio` },
          offers: { "@id": `${baseUrl}/offers/${offer.slug}#offer` },
        },
      })),
    ],
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${baseUrl}/#studio`,
    name: site.name,
    description: site.description,
    url: baseUrl,
    email: site.email,
    founder: {
      "@type": "Person",
      "@id": `${baseUrl}/#founder`,
      name: site.foundedBy,
      jobTitle: site.founderJobTitle,
      sameAs: [...site.founderSameAs],
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.location.latitude,
      longitude: site.location.longitude,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location.city,
      addressRegion: site.location.region,
      addressCountry: "US",
    },
    areaServed: { "@type": "City", name: site.location.city },
    numberOfEmployees: { "@type": "QuantitativeValue", value: 3 },
    knowsAbout: [
      "Motion graphics",
      "Video advertising",
      "Selling campaigns",
      "Search engine optimization",
      "Generative engine optimization",
      "Answer engine optimization",
    ],
    makesOffer: offers.map((offer) => ({
      "@type": "Offer",
      "@id": `${baseUrl}/offers/${offer.slug}#offer`,
      name: offer.name,
      description: offer.tagline,
      priceCurrency: "USD",
      price: offer.priceFrom,
      url: `${baseUrl}/offers/${offer.slug}`,
    })),
  };
}

export function videoObjectJsonLd(
  film: Film,
  workItem: { title: string; hook?: string; summary: string; year: string },
) {
  const uploadDate = film.uploadDate ?? `${workItem.year}-01-01T00:00:00Z`;
  const posterUrl = film.media.poster
    ? `${baseUrl}${film.media.poster.startsWith("/") ? "" : "/"}${film.media.poster}`
    : `${baseUrl}/opengraph-image`;
  const contentUrl = film.media.src
    ? `${baseUrl}${film.media.src.startsWith("/") ? "" : "/"}${film.media.src}`
    : `${baseUrl}/media/films/placeholder.mp4`;

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${workItem.title} — ${film.label}`,
    description: workItem.hook ? `${workItem.hook} ${workItem.summary}` : workItem.summary,
    thumbnailUrl: [posterUrl],
    contentUrl,
    uploadDate,
    ...(film.duration ? { duration: `PT${film.duration}S` } : {}),
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
}

export function workVideosJsonLd(workItem: WorkItem) {
  return workItem.films.map((film) => videoObjectJsonLd(film, workItem));
}

export function allWorkVideosJsonLd(workItems: WorkItem[]) {
  return workItems.flatMap((item) => workVideosJsonLd(item));
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.path === "/" ? "" : crumb.path}`,
    })),
  };
}

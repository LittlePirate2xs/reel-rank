import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/seo";
import { work } from "@/content/work";
import { offers, careerTiers } from "@/content/offers";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/work`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/offers`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/career`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.9 },
  ];

  const workRoutes: MetadataRoute.Sitemap = work.map((item) => ({
    url: `${baseUrl}/work/${item.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const offerRoutes: MetadataRoute.Sitemap = offers.map((offer) => ({
    url: `${baseUrl}/offers/${offer.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const careerRoutes: MetadataRoute.Sitemap = careerTiers.map((tier) => ({
    url: `${baseUrl}/career#${tier.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...workRoutes, ...offerRoutes, ...careerRoutes];
}

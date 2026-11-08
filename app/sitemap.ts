import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { guides } from "@/lib/guides/index";

export default function sitemap(): MetadataRoute.Sitemap {
  const guideEntries: MetadataRoute.Sitemap = guides.map((g) => ({
    url: absoluteUrl(`/guides/${g.slug}`),
    lastModified: new Date(g.publishedAt),
    changeFrequency: "monthly",
    priority: g.priority === "high" ? 0.8 : 0.7,
  }));

  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/tools/readiness-interpreter"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/tools/hrv-optimizer"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/tools/sleep-score"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/guides"),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...guideEntries,
  ];
}

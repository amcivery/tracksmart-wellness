import type { Metadata } from "next";

export const siteConfig = {
  name: "TrackSmart Wellness",
  title: "TrackSmart Wellness | Free Oura & Whoop Score Interpreters 2026",
  description:
    "Free wearable data interpretation tools for Oura, Whoop, and Garmin in 2026, including readiness score calculators, recovery explainers, and HRV optimization guidance.",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000",
  keywords: [
    "Oura readiness score explained 2026",
    "Whoop recovery score explained",
    "low readiness score what to do",
    "readiness score calculator",
    "Oura readiness score low",
    "Oura readiness score ranges 2026",
    "why is my Oura readiness score so low",
    "Whoop strain score explained",
    "HRV calculator wearable",
    "improve HRV Oura",
    "HRV readiness score",
    "how to boost HRV",
    "free wearable data interpretation",
    "Garmin Body Battery explained",
    "TrackSmart Wellness",
  ],
  organization: {
    name: "TrackSmart Wellness",
    description:
      "Educational wellness tools that help people interpret wearable recovery and readiness scores.",
    logo: "/logo.png",
    sameAs: [],
  },
} as const;

export interface PageMetadataInput {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
}

export function absoluteUrl(path = "") {
  return new URL(path || "/", siteConfig.siteUrl).toString();
}

export function createPageMetadata({
  title,
  description,
  keywords = [],
  path = "/",
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const mergedKeywords = Array.from(
    new Set([...siteConfig.keywords, ...keywords]),
  );

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

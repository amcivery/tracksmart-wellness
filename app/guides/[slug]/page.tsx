import { notFound } from "next/navigation";
import Script from "next/script";
import { guides, getGuide } from "@/lib/guides/index";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import GuideLayout from "@/components/GuideLayout";

// ─── Static params (pre-rendered at build time) ───────────────────────────────

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

// ─── Per-page metadata ────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  return createPageMetadata({
    title: guide.metaTitle,
    description: guide.metaDescription,
    keywords: guide.keywords,
    path: `/guides/${guide.slug}`,
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  // Article schema for Google
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.metaTitle,
    description: guide.metaDescription,
    datePublished: guide.publishedAt,
    dateModified: guide.publishedAt,
    author: {
      "@type": "Organization",
      name: "TrackSmart Wellness",
      url: absoluteUrl("/"),
    },
    publisher: {
      "@type": "Organization",
      name: "TrackSmart Wellness",
      url: absoluteUrl("/"),
    },
    mainEntityOfPage: absoluteUrl(`/guides/${guide.slug}`),
    keywords: guide.keywords.join(", "),
  };

  // FAQ schema
  const faqSchema =
    guide.faq && guide.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: guide.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
          mainEntityOfPage: absoluteUrl(`/guides/${guide.slug}`),
        }
      : null;

  return (
    <>
      <Script
        id={`guide-article-schema-${guide.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <Script
          id={`guide-faq-schema-${guide.slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <GuideLayout guide={guide} />
    </>
  );
}

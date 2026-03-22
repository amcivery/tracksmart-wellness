import Script from "next/script";
import HRVOptimizer from "@/components/HRVOptimizer";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Free HRV Optimizer & Simulator for Oura & Whoop 2026",
  description:
    "Use this free HRV calculator wearable tool to improve HRV Oura and Whoop trends, model HRV readiness score changes, and learn how to boost HRV with better recovery habits.",
  keywords: [
    "HRV calculator wearable",
    "improve HRV Oura",
    "HRV readiness score",
    "how to boost HRV",
    "HRV by age",
    "age-adjusted HRV range",
    "Whoop HRV optimizer",
    "Oura HRV simulator 2026",
  ],
  path: "/tools/hrv-optimizer",
});

export default function HRVOptimizerPage() {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to simulate HRV improvement over 30 days",
    description:
      "Enter your baseline HRV, today's HRV, and recovery habits to model how your HRV could improve with better sleep, lower alcohol intake, and smarter training.",
    totalTime: "PT1M",
    tool: [
      {
        "@type": "HowToTool",
        name: "TrackSmart Wellness HRV Optimizer",
      },
    ],
    step: [
      {
        "@type": "HowToStep",
        name: "Enter your HRV baseline and today's reading",
        text: "Add your normal HRV baseline, optional age, and your latest wearable reading so the simulator can measure your recovery gap.",
      },
      {
        "@type": "HowToStep",
        name: "Adjust recovery inputs",
        text: "Set sleep hours, alcohol, magnesium use, training load, and stress level to reflect your current routine.",
      },
      {
        "@type": "HowToStep",
        name: "Run the 30-day simulation",
        text: "Generate the projected trendline to compare your flat baseline against the modeled HRV improvement curve.",
      },
      {
        "@type": "HowToStep",
        name: "Use the suggestions and risk indicators",
        text: "Review the personalized recommendations, optimal HRV range note, and low HRV warnings before changing your plan.",
      },
    ],
    mainEntityOfPage: absoluteUrl("/tools/hrv-optimizer"),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Script
        id="hrv-howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <SiteHeader activePath="/tools/hrv-optimizer" />
      <HRVOptimizer />
      <SiteFooter />
    </div>
  );
}

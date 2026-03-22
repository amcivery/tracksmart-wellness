import Script from "next/script";
import ReadinessInterpreter from "@/components/ReadinessInterpreter";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Oura Readiness Score Explained & Calculator 2026 | Free Tool",
  description:
    "Use this free readiness score calculator to understand Oura readiness score low patterns, Whoop recovery score explained ranges, and low readiness score what to do in plain English.",
  keywords: [
    "Oura readiness score low",
    "Whoop recovery score explained",
    "readiness score calculator",
    "low readiness score what to do",
    "Oura readiness score explained 2026",
  ],
  path: "/tools/readiness-interpreter",
});

export default function ReadinessInterpreterPage() {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to interpret your wearable readiness score",
    description:
      "Enter your readiness score, add context, and compare what-if changes to understand what your wearable data means today.",
    totalTime: "PT2M",
    tool: [
      {
        "@type": "HowToTool",
        name: "TrackSmart Wellness Readiness Interpreter",
      },
    ],
    step: [
      {
        "@type": "HowToStep",
        name: "Choose your wearable score type",
        text: "Select Oura Readiness, Whoop Recovery, Whoop Strain, or Garmin Body Battery from the dropdown.",
      },
      {
        "@type": "HowToStep",
        name: "Enter your current score",
        text: "Add the score you see in your wearable app so the calculator can place it in the correct interpretation range.",
      },
      {
        "@type": "HowToStep",
        name: "Add context",
        text: "Toggle items like poor sleep, alcohol last night, desk job, or high training load to make the explanation more realistic.",
      },
      {
        "@type": "HowToStep",
        name: "Review the projected score and action plan",
        text: "Use the gauge, plain-English explanation, and what-if sliders to understand low readiness score what to do next.",
      },
    ],
    mainEntityOfPage: absoluteUrl("/tools/readiness-interpreter"),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Script
        id="readiness-howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <SiteHeader activePath="/tools/readiness-interpreter" />
      <ReadinessInterpreter />
      <SiteFooter />
    </div>
  );
}

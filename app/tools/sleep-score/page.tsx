import Script from "next/script";
import SleepScoreBreakdown from "@/components/SleepScoreBreakdown";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title:
    "Free Sleep Score Calculator & Habit Impact Simulator 2026 – Breakdown by Stage",
  description:
    "Upload or enter your sleep data to get a detailed sleep score breakdown by stage, efficiency, and disturbances. Use the habit simulator to see how caffeine cutoff, consistent bedtime, and screen habits could improve your sleep score in 2026.",
  keywords: [
    "sleep score calculator 2026",
    "sleep score breakdown by stage",
    "sleep efficiency calculator free",
    "how to improve sleep score Oura",
    "sleep habit simulator",
    "deep sleep percentage calculator",
    "REM sleep score meaning",
    "sleep score low why",
    "caffeine effect on sleep score",
    "sleep stage breakdown tool",
    "Oura sleep score explained 2026",
    "Whoop sleep score breakdown",
    "best sleep score calculator free",
    "sleep onset latency calculator",
    "how to improve deep sleep percentage",
    "sleep quality score meaning",
    "sleep tracker score explained",
  ],
  path: "/tools/sleep-score",
});

export default function SleepScorePage() {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to calculate and improve your sleep score",
    description:
      "Enter your sleep metrics or upload a CSV export from Oura, Whoop, Garmin, or Apple Watch to get a detailed sleep score breakdown and simulate how habit changes could improve your score.",
    totalTime: "PT2M",
    tool: [
      {
        "@type": "HowToTool",
        name: "TrackSmart Wellness Sleep Score Calculator",
      },
    ],
    step: [
      {
        "@type": "HowToStep",
        name: "Enter or upload your sleep data",
        text: "Upload a CSV sleep export from your wearable device, or manually enter time in bed, total sleep time, deep sleep, REM sleep, awakenings, and sleep onset latency.",
      },
      {
        "@type": "HowToStep",
        name: "Review your sleep score breakdown",
        text: "See your overall sleep score and how each component (efficiency, stage balance, disturbances, onset latency) contributes to the total with weighted percentages.",
      },
      {
        "@type": "HowToStep",
        name: "Explore your sleep stage distribution",
        text: "View a visual breakdown of deep, REM, and light sleep percentages compared to ideal ranges so you know which stages need improvement.",
      },
      {
        "@type": "HowToStep",
        name: "Simulate habit improvements",
        text: "Toggle habits like caffeine cutoff before 2 PM, consistent bedtime, no screens before bed, or no alcohol to see projected score improvements and prioritize changes.",
      },
    ],
    mainEntityOfPage: absoluteUrl("/tools/sleep-score"),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Script
        id="sleep-howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <SiteHeader activePath="/tools/sleep-score" />
      <SleepScoreBreakdown />
      <SiteFooter />
    </div>
  );
}

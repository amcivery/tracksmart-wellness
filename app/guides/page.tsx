import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { guides, deviceMeta, type Device } from "@/lib/guides/index";
import { createPageMetadata } from "@/lib/seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = createPageMetadata({
  title: "Wearable Data Guides – Oura, Whoop & Garmin Explained in Plain English",
  description:
    "Free plain-English guides to help you interpret Oura readiness scores, Whoop recovery data, Garmin Body Battery, and HRV from any wearable. No jargon, no sign-up.",
  keywords: [
    "oura readiness score guides",
    "whoop recovery explained",
    "garmin body battery meaning",
    "wearable data interpretation guides",
    "HRV explained plain english",
  ],
  path: "/guides",
});

const deviceFilters: { key: Device | "all"; label: string }[] = [
  { key: "all", label: "All Guides" },
  { key: "oura", label: "Oura Ring" },
  { key: "whoop", label: "Whoop" },
  { key: "garmin", label: "Garmin" },
  { key: "cross-device", label: "All Devices" },
];

export default function GuidesIndexPage() {
  // High-priority guides first, then medium
  const sortedGuides = [...guides].sort((a, b) => {
    if (a.priority === b.priority) return 0;
    return a.priority === "high" ? -1 : 1;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader activePath="/guides" />

      <div className="relative isolate">
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.10),_transparent_40%)]" />

        <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-14 sm:px-6 lg:px-8">
          {/* ── Hero ── */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              <BookOpen className="h-3.5 w-3.5" />
              Free guides
            </div>
            <h1 className="mt-5 text-balance text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
              Wearable Data Guides in Plain English
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              What does your Oura readiness score of 60 actually mean? Should
              you train when Whoop shows red? Why is your Garmin Body Battery
              always low? These guides answer the questions your wearable
              app doesn&apos;t.
            </p>
          </div>

          {/* ── Device filter legend ── */}
          <div className="mt-10 flex flex-wrap gap-2">
            {deviceFilters.map(({ key, label }) => {
              if (key === "all") {
                return (
                  <span
                    key={key}
                    className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-sm font-medium text-slate-200"
                  >
                    {label} ({guides.length})
                  </span>
                );
              }
              const m = deviceMeta[key];
              const count = guides.filter((g) => g.device === key).length;
              return (
                <span
                  key={key}
                  className={`rounded-full border px-3 py-1 text-sm font-medium ${m.color} ${m.bg} ${m.border}`}
                >
                  {label} ({count})
                </span>
              );
            })}
          </div>

          {/* ── Guide cards ── */}
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sortedGuides.map((guide) => {
              const m = deviceMeta[guide.device];
              const pubDate = new Date(guide.publishedAt).toLocaleDateString(
                "en-US",
                { year: "numeric", month: "short", day: "numeric" }
              );

              return (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg transition hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900"
                >
                  {/* Device badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${m.color} ${m.bg} ${m.border}`}
                    >
                      {m.label}
                    </span>
                    {guide.priority === "high" && (
                      <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-400/20">
                        Popular
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="mt-4 text-base font-bold leading-snug text-white">
                    {guide.metaTitle}
                  </h2>

                  {/* Description */}
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-400 line-clamp-3">
                    {guide.metaDescription}
                  </p>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                    <span>{pubDate}</span>
                    <span className="flex items-center gap-1 font-medium text-cyan-300 transition group-hover:gap-2">
                      Read guide
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── More guides coming CTA ── */}
          <div className="mt-16 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              More guides coming
            </p>
            <h2 className="mt-3 text-2xl font-bold text-white">
              We&apos;re publishing new guides weekly
            </h2>
            <p className="mt-3 text-base text-slate-400">
              Garmin Body Battery, HRV benchmarks by age, Whoop strain
              optimization, cross-device comparisons, and more. Sign up on the{" "}
              <Link
                href="/#email-optin-form"
                className="text-cyan-300 hover:underline"
              >
                homepage
              </Link>{" "}
              to get them as they publish.
            </p>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

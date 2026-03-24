import Link from "next/link";
import Script from "next/script";
import {
  Activity,
  ArrowRight,
  BedDouble,
  Brain,
  ChevronRight,
  HeartPulse,
  MoonStar,
  Sparkles,
} from "lucide-react";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const toolCards = [
  {
    href: "/tools/readiness-interpreter",
    title: "Readiness Interpreter",
    description:
      "Get your Oura readiness score explained in plain English, understand a low readiness score what to do next, and use our readiness score calculator logic to turn overnight signals into a smarter day plan.",
    eyebrow: "Oura + Garmin",
    accent: "from-cyan-400/30 via-sky-500/20 to-transparent",
    icon: MoonStar,
    placeholderTitle: "Recovery Snapshot",
    placeholderMetric: "Readiness 71",
    placeholderTrend: "Sleep debt improving",
  },
  {
    href: "/tools/hrv-optimizer",
    title: "HRV Optimizer",
    description:
      "See your Whoop recovery score explained, compare HRV and strain context side by side, and get fast recommendations when your wearable suggests backing off or pushing harder.",
    eyebrow: "Whoop + HRV",
    accent: "from-emerald-400/30 via-teal-500/20 to-transparent",
    icon: HeartPulse,
    placeholderTitle: "HRV Decision View",
    placeholderMetric: "Recovery 64%",
    placeholderTrend: "Moderate strain recommended",
  },
  {
    href: "/tools/sleep-score",
    title: "Sleep Score Breakdown",
    description:
      "Upload your sleep data or enter metrics manually to get a detailed sleep score breakdown by stage with efficiency analysis. Use the habit simulator to see how caffeine cutoff, consistent bedtime, and screen habits could improve your sleep score.",
    eyebrow: "All Devices",
    accent: "from-violet-400/30 via-purple-500/20 to-transparent",
    icon: BedDouble,
    placeholderTitle: "Sleep Breakdown",
    placeholderMetric: "Score 74",
    placeholderTrend: "Deep sleep below target",
  },
] as const;

const benefits = [
  {
    title: "What Does a Low Oura Readiness Score Actually Mean?",
    body:
      "We translate sleep balance, HRV, resting heart rate, body temperature, and timing signals into plain-English explanations so you know whether today calls for recovery, focus work, or a lighter training session.",
    icon: Brain,
  },
  {
    title: "Whoop Strain Score Explained for Busy Professionals",
    body:
      "If your calendar is full, your wearable still needs context. TrackSmart Wellness helps you interpret strain, recovery, and sleep pressure in a way that fits meetings, travel, parenting, and real-world schedules.",
    icon: Activity,
  },
  {
    title: "Turn Your Wearable Data Into Real Action Plans",
    body:
      "Instead of generic wellness advice, you get quick next steps: train, walk, fuel, hydrate, nap, reduce caffeine, or protect bedtime. The goal is fewer guesses and better decisions from the numbers you already have.",
    icon: Sparkles,
  },
  {
    title: "Sleep Score Breakdown: See What Your Tracker Misses",
    body:
      "Most sleep trackers give you a single number. Our sleep score breakdown shows exactly how deep sleep, REM, efficiency, and disturbances contribute\u2014then lets you simulate how small habit changes like earlier caffeine cutoff or consistent bedtime could boost your score.",
    icon: BedDouble,
  },
] as const;

const faqs = [
  {
    question: "Why is my Oura readiness score so low even when I think I slept enough?",
    answer:
      "A low readiness score can come from more than total sleep time. Oura also weighs HRV trends, resting heart rate, body temperature shifts, sleep timing, recent strain, and how well your body recovered from prior days. If one or two of those signals are off, your score can drop even after a long night.",
  },
  {
    question: "What are Oura readiness score ranges in 2026, and what should I do at each level?",
    answer:
      "In practical terms, most people treat the lower range as a recovery-first day, the middle range as a moderate output day, and the higher range as a green light for heavier training or cognitively demanding work. The best interpretation depends on your baseline, recent stress load, and whether the trend is improving or slipping over several days.",
  },
  {
    question: "How is a Whoop recovery score explained differently from an Oura readiness score?",
    answer:
      "Both scores estimate recovery, but the weighting and framing are different. Whoop centers recovery around HRV, resting heart rate, sleep, and recent strain, while Oura adds its own readiness model and sleep timing emphasis. TrackSmart Wellness helps you compare the same underlying physiology without getting lost in brand-specific labels.",
  },
  {
    question: "If my readiness score is low, what should I do today for exercise, caffeine, and sleep?",
    answer:
      "A lower score usually points toward lowering intensity, prioritizing hydration and nutrition, being more careful with caffeine timing, and protecting bedtime. The right move is not always complete rest, but it often means reducing all-out efforts and making recovery easier for the next 24 hours.",
  },
  {
    question: "Can a readiness score calculator really help if I use Garmin, Oura, and Whoop together?",
    answer:
      "Yes, as long as the calculator focuses on patterns instead of pretending every device measures the exact same thing. The value comes from comparing directionally similar signals like HRV, resting heart rate, sleep quality, and recent load so you can make one coherent decision instead of juggling three dashboards.",
  },
  {
    question: "What is the best way to understand wearable data in 2026 without paying for another app?",
    answer:
      "The most useful approach is translating your metrics into a short explanation plus a specific action plan. That is the core idea behind TrackSmart Wellness: free interpretation tools that tell you what your wearable data likely means today and how to respond without needing another subscription.",
  },
  {
    question: "How is a sleep score calculated and what does each sleep stage contribute?",
    answer:
      "A sleep score typically weighs sleep efficiency (time asleep vs. time in bed), the balance of deep and REM sleep stages, the number of awakenings, and how quickly you fell asleep. Our free sleep score calculator breaks down each component so you can see exactly which areas are dragging your score down and which habits could improve it most.",
  },
] as const;

export const metadata = createPageMetadata({
  title:
    "Free Oura Readiness Interpreter, Sleep Score Calculator & Whoop Recovery Tools – 2026",
  description:
    "TrackSmart Wellness helps you understand Oura, Whoop, and Garmin data in 2026 with free readiness score explanations, sleep score breakdown by stage, HRV optimization, and action plans.",
  keywords: [
    "Oura readiness score explained 2026",
    "Whoop recovery score explained",
    "low readiness score what to do",
    "readiness score calculator",
    "Oura readiness score ranges 2026",
    "why is my Oura readiness score so low",
    "Garmin recovery interpretation",
    "free wearable data interpretation",
    "HRV optimizer",
    "sleep score calculator 2026",
    "sleep score breakdown by stage",
    "sleep efficiency calculator free",
  ],
  path: "/",
});

export default function LandingPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
    mainEntityOfPage: absoluteUrl("/"),
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Script
        id="landing-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <SiteHeader />

      <div className="relative isolate">
        <div className="absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(180deg,_rgba(15,23,42,0.2),_rgba(2,6,23,0.95))]" />
        <div className="absolute inset-x-0 top-24 -z-10 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

        <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pb-14 pt-6 sm:px-6 lg:px-8 lg:pb-20 lg:pt-8">

          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Oura, Whoop, Garmin
              </div>

              <h1 className="mt-6 max-w-4xl text-balance text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Free Oura Readiness Interpreter, Sleep Score Calculator &amp;
                Whoop Recovery Tools – 2026
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                Stop guessing what your low readiness score means. Get
                plain-English explanations + action plans instantly. No sign-up
                required.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/tools/readiness-interpreter"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Try Readiness Interpreter
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/tools/hrv-optimizer"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/70 px-6 py-4 text-base font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
                >
                  Try HRV Optimizer
                  <ChevronRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/tools/sleep-score"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/70 px-6 py-4 text-base font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
                >
                  Try Sleep Score Tool
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>

              <div className="mt-8 inline-flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300 shadow-2xl shadow-slate-950/30">
                <span className="font-medium text-slate-100">
                  Used by 1,200+ biohackers
                </span>
                <span className="hidden text-slate-600 sm:inline">•</span>
                <span>Educational only</span>
                <span className="hidden text-slate-600 sm:inline">•</span>
                <span>100% free</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 via-sky-400/10 to-emerald-400/10 blur-3xl" />
              <div className="overflow-hidden rounded-[2rem] border border-slate-800/80 bg-slate-900/70 p-4 shadow-2xl shadow-cyan-950/25 backdrop-blur">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/90 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Oura Recovery
                      </p>
                      <MoonStar className="h-4 w-4 text-cyan-300" />
                    </div>
                    <p className="mt-5 text-4xl font-black text-white">72</p>
                    <p className="mt-2 text-sm text-cyan-200">
                      Readiness explained: moderate recovery, ease into output.
                    </p>
                    <div className="mt-6 h-24 rounded-2xl bg-[linear-gradient(180deg,rgba(34,211,238,0.18),rgba(15,23,42,0.3)),radial-gradient(circle_at_20%_20%,rgba(103,232,249,0.18),transparent_40%)] p-3">
                      <div className="flex h-full items-end gap-2">
                        {[36, 52, 44, 68, 61, 74, 70].map((height, index) => (
                          <div
                            key={index}
                            className="flex-1 rounded-t-full bg-cyan-300/70"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/90 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Whoop Decision
                      </p>
                      <HeartPulse className="h-4 w-4 text-emerald-300" />
                    </div>
                    <p className="mt-5 text-4xl font-black text-white">64%</p>
                    <p className="mt-2 text-sm text-emerald-200">
                      Recovery score explained: keep strain controlled today.
                    </p>
                    <div className="mt-6 space-y-3">
                      {[
                        ["HRV", "Baseline -6%"],
                        ["Resting HR", "+3 bpm"],
                        ["Sleep", "6h 44m"],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                        >
                          <span className="text-slate-400">{label}</span>
                          <span className="font-medium text-slate-100">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.5rem] border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
                  Your wearable data should feel useful, not cryptic. We turn
                  readiness, HRV, strain, and sleep signals into a day plan in
                  under a minute.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Free tools
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Interpret today&apos;s recovery signals without the jargon
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-400">
                Pick the tool that matches your wearable workflow and get
                immediate explanations built for real decisions.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {toolCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/25 transition hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900"
                >
                  <div
                    className={`rounded-[1.75rem] bg-gradient-to-br ${card.accent} p-px`}
                  >
                    <div className="rounded-[1.7rem] bg-slate-950/95 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                            {card.eyebrow}
                          </p>
                          <h3 className="mt-2 text-2xl font-bold text-white">
                            {card.title}
                          </h3>
                        </div>
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3 text-slate-200">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-900 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-200">
                              {card.placeholderTitle}
                            </p>
                          </div>
                          <p className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm font-semibold text-white">
                            {card.placeholderMetric}
                          </p>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-3">
                          {[68, 48, 76].map((height, index) => (
                            <div
                              key={index}
                              className="flex h-24 items-end rounded-2xl bg-slate-950 px-2 pb-2"
                            >
                              <div
                                className="w-full rounded-xl bg-gradient-to-t from-cyan-400 to-emerald-300"
                                style={{ height: `${height}%` }}
                              />
                            </div>
                          ))}
                        </div>

                        <p className="mt-4 text-sm text-slate-400">
                          {card.placeholderTrend}
                        </p>
                      </div>

                      <p className="mt-5 text-base leading-7 text-slate-300">
                        {card.description}
                      </p>

                      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                        Launch free tool
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  key={benefit.title}
                  className="rounded-[2rem] border border-slate-800 bg-slate-900/60 p-6 backdrop-blur"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300 ring-1 ring-inset ring-slate-800">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">
                    {benefit.title}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-slate-400">
                    {benefit.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-t border-slate-800 bg-slate-950/80">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-16">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Stay in the loop
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Get future wearable interpretation tools by email
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-400">
                Join the list for new Oura, Whoop, and Garmin explainers,
                recovery frameworks, and HRV decision tools as TrackSmart
                Wellness grows.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6">
              <form
                id="email-optin-form"
                action="https://formspree.io/f/mzdjwwne"
                method="POST"
                className="space-y-4"
              >
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-200"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-white px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Get Updates
                </button>
              </form>
              <p className="mt-4 text-sm font-medium text-emerald-400">
                Thanks! Check your email for the 2026 Wearable Score Cheat
                Sheet.
              </p>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Disclaimer: TrackSmart Wellness is for educational purposes only
                and does not provide medical advice, diagnosis, or treatment.
                Always use your own judgment and consult a qualified clinician
                for health concerns.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Common wearable data questions, answered clearly
            </h2>
            <div className="mt-8 space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-slate-800 bg-slate-950/80 p-5"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-base font-semibold text-white marker:content-none">
                    <span>{faq.question}</span>
                    <span className="mt-0.5 text-cyan-300 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

      </div>
      <SiteFooter />
    </main>
  );
}

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import {
  type Guide,
  deviceMeta,
  getRelatedGuides,
} from "@/lib/guides/index";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Split a section body string into rendered blocks. */
function parseBody(body: string): React.ReactNode[] {
  return body.split("\n\n").map((block, i) => {
    // Numbered list detection: every line starts with a digit + period
    const lines = block.split("\n");
    const isNumberedList = lines.every((l) => /^\d+\.\s/.test(l.trim()));

    if (isNumberedList) {
      return (
        <ol key={i} className="mt-4 space-y-3 pl-0">
          {lines.map((line, j) => {
            const text = line.replace(/^\d+\.\s/, "");
            const dotIdx = line.indexOf(". ");
            const num = line.slice(0, dotIdx);
            return (
              <li key={j} className="flex gap-3 text-slate-300 leading-7">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-400">
                  {num}
                </span>
                <span>{text}</span>
              </li>
            );
          })}
        </ol>
      );
    }

    return (
      <p key={i} className="mt-4 text-base leading-7 text-slate-300">
        {block}
      </p>
    );
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── Main export ──────────────────────────────────────────────────────────────

interface GuideLayoutProps {
  guide: Guide;
}

export default function GuideLayout({ guide }: GuideLayoutProps) {
  const meta = deviceMeta[guide.device];
  const related = guide.relatedGuides
    ? getRelatedGuides(guide.relatedGuides)
    : [];

  const pubDate = new Date(guide.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader activePath={`/guides/${guide.slug}`} />

      {/* ── Page shell ── */}
      <div className="relative isolate">
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.10),_transparent_40%)]" />

        <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">

          {/* ── Breadcrumb ── */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/guides" className="hover:text-slate-300 transition">Guides</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-400 line-clamp-1">{guide.title}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">

            {/* ── Article ── */}
            <article>
              {/* Hero */}
              <div className="mb-10">
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${meta.color} ${meta.bg} ${meta.border}`}>
                  {meta.label}
                </div>

                <h1 className="mt-4 text-balance text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {guide.metaTitle}
                </h1>

                <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
                  <BookOpen className="h-4 w-4" />
                  <span>Published {pubDate}</span>
                  <span className="text-slate-700">·</span>
                  <span>Educational guide</span>
                </div>
              </div>

              {/* Intro */}
              <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                {guide.intro.split("\n\n").map((para, i) => (
                  <p key={i} className={`text-base leading-7 text-slate-200 ${i > 0 ? "mt-4" : ""}`}>
                    {para}
                  </p>
                ))}
              </div>

              {/* Sections */}
              <div className="space-y-10">
                {guide.sections.map((section, idx) => (
                  <section key={idx}>
                    <h2 className="text-xl font-bold text-white sm:text-2xl">
                      {section.heading}
                    </h2>
                    <div className="mt-1 h-px w-12 rounded-full bg-cyan-400/40" />
                    <div className="mt-4">{parseBody(section.body)}</div>
                  </section>
                ))}
              </div>

              {/* Tool CTA — shown inline on mobile, hidden on desktop (sidebar handles it) */}
              {guide.relatedTool && (
                <div className="mt-12 lg:hidden">
                  <ToolCta tool={guide.relatedTool} meta={meta} />
                </div>
              )}

              {/* FAQ */}
              {guide.faq && guide.faq.length > 0 && (
                <section className="mt-14">
                  <h2 className="text-2xl font-bold text-white">
                    Frequently Asked Questions
                  </h2>
                  <div className="mt-6 space-y-4">
                    {guide.faq.map((item, i) => (
                      <details
                        key={i}
                        className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
                      >
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-base font-semibold text-white marker:content-none">
                          <span>{item.question}</span>
                          <span className="mt-0.5 flex-shrink-0 text-cyan-300 transition group-open:rotate-45">
                            +
                          </span>
                        </summary>
                        <p className="mt-4 text-base leading-7 text-slate-400">
                          {item.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {/* Related guides — mobile */}
              {related.length > 0 && (
                <section className="mt-14 lg:hidden">
                  <RelatedGuidesList guides={related} />
                </section>
              )}

              {/* Back link */}
              <div className="mt-14">
                <Link
                  href="/guides"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-slate-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to all guides
                </Link>
              </div>
            </article>

            {/* ── Sidebar ── */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {guide.relatedTool && (
                  <ToolCta tool={guide.relatedTool} meta={meta} />
                )}
                {related.length > 0 && (
                  <RelatedGuidesList guides={related} />
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

// ─── Sidebar pieces ───────────────────────────────────────────────────────────

function ToolCta({
  tool,
  meta,
}: {
  tool: NonNullable<Guide["relatedTool"]>;
  meta: (typeof deviceMeta)[keyof typeof deviceMeta];
}) {
  return (
    <div className={`rounded-2xl border p-5 ${meta.bg} ${meta.border}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${meta.color}`}>
        Free tool
      </p>
      <p className="mt-2 font-bold text-white">{tool.label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{tool.description}</p>
      <Link
        href={tool.href}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
      >
        Try it free
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function RelatedGuidesList({ guides }: { guides: Guide[] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Related guides
      </p>
      <ul className="mt-4 space-y-3">
        {guides.map((g) => {
          const gMeta = deviceMeta[g.device];
          return (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="group flex items-start gap-3"
              >
                <span
                  className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${gMeta.color} ${gMeta.bg} flex-shrink-0`}
                >
                  {gMeta.label}
                </span>
                <span className="text-sm text-slate-400 leading-5 transition group-hover:text-slate-100">
                  {g.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

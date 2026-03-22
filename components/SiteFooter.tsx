import Link from "next/link";
import { Watch } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-100"
        >
          <Watch className="h-4 w-4" />
          TrackSmart Wellness
        </Link>
        <div className="flex gap-4 text-sm text-slate-500">
          <Link href="/guides" className="transition hover:text-slate-300">
            Guides
          </Link>
          <Link
            href="/tools/readiness-interpreter"
            className="transition hover:text-slate-300"
          >
            Readiness Tool
          </Link>
          <Link
            href="/tools/hrv-optimizer"
            className="transition hover:text-slate-300"
          >
            HRV Optimizer
          </Link>
        </div>
        <p className="max-w-xs text-xs text-slate-600">
          Educational purposes only. Not medical advice. Always consult a
          qualified clinician for health concerns.
        </p>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { ShieldCheck, Watch } from "lucide-react";

const navLinks = [
  { href: "/tools/readiness-interpreter", label: "Readiness Tool" },
  { href: "/tools/hrv-optimizer", label: "HRV Optimizer" },
  { href: "/guides", label: "Guides" },
];

interface SiteHeaderProps {
  /** Pass the current page's path to highlight the matching nav link. */
  activePath?: string;
}

export default function SiteHeader({ activePath = "" }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-300/20">
            <Watch className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-slate-100">
            TrackSmart Wellness
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 text-sm">
          {navLinks.map(({ href, label }) => {
            const isActive =
              activePath === href || activePath.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 transition ${
                  isActive
                    ? "font-medium text-cyan-300"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Badge */}
        <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200 sm:flex">
          <ShieldCheck className="h-3.5 w-3.5" />
          Educational only
        </div>
      </div>
    </header>
  );
}

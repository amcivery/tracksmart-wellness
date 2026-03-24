"use client";

import Link from "next/link";
import { ChevronDown, ShieldCheck, Watch } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const toolLinks = [
  { href: "/tools/readiness-interpreter", label: "Readiness Interpreter" },
  { href: "/tools/hrv-optimizer", label: "HRV Optimizer" },
  { href: "/tools/sleep-score", label: "Sleep Score Breakdown" },
];

interface SiteHeaderProps {
  /** Pass the current page's path to highlight the matching nav link. */
  activePath?: string;
}

export default function SiteHeader({ activePath = "" }: SiteHeaderProps) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isToolActive = activePath.startsWith("/tools");
  const isGuidesActive =
    activePath === "/guides" || activePath.startsWith("/guides/");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          {/* Tools dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setToolsOpen(!toolsOpen)}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 transition ${
                isToolActive
                  ? "font-medium text-cyan-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              Tools
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {toolsOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-slate-950/40 backdrop-blur sm:left-0 sm:right-auto">
                {toolLinks.map(({ href, label }) => {
                  const isActive =
                    activePath === href || activePath.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setToolsOpen(false)}
                      className={`block px-4 py-2.5 text-sm transition ${
                        isActive
                          ? "bg-cyan-400/10 font-medium text-cyan-300"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Guides link */}
          <Link
            href="/guides"
            className={`rounded-lg px-3 py-2 transition ${
              isGuidesActive
                ? "font-medium text-cyan-300"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            }`}
          >
            Guides
          </Link>
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

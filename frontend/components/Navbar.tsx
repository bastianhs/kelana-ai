"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ---------------------------------------------------------------------------
// Navbar — shared across all pages
// ---------------------------------------------------------------------------
export default function Navbar() {
  const pathname = usePathname();

  const links = [
    {
      href: "/",
      label: "Generate Trip",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      href: "/trips",
      label: "My Trips",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ];

  return (
    <header className="relative z-10 w-full border-b border-slate-800/50 backdrop-blur-sm bg-[#020817]/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-1.5 group">
          <span className="text-gradient font-black tracking-tight group-hover:opacity-90 transition-opacity">
            Kelana
          </span>
          <span className="text-slate-100 font-black tracking-tight group-hover:opacity-90 transition-opacity">
            AI
          </span>
        </Link>

        {/* Navigation pills */}
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {links.map(({ href, label, icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-500/15 border border-blue-500/30 text-blue-300"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent"
                }`}
              >
                {icon}
                {label}
              </Link>
            );
          })}
        </nav>

        {/* AI badge */}
        <div className="hidden sm:flex items-center gap-1.5 badge-glow rounded-full px-3 py-1 text-xs text-blue-300 font-semibold uppercase tracking-widest">
          <div className="ai-dot" style={{ width: 6, height: 6 }} />
          Powered by AI
        </div>
      </div>
    </header>
  );
}

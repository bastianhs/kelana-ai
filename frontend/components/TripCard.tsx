"use client";

import Link from "next/link";
import type { Trip } from "@/services/tripService";

// ---------------------------------------------------------------------------
// Country code to flag emoji
// ---------------------------------------------------------------------------
const COUNTRY_FLAGS: Record<string, string> = {
  "japan": "🇯🇵",
  "united states": "🇺🇸",
  "usa": "🇺🇸",
  "france": "🇫🇷",
  "united kingdom": "🇬🇧",
  "uk": "🇬🇧",
  "italy": "🇮🇹",
  "spain": "🇪🇸",
  "germany": "🇩🇪",
  "netherlands": "🇳🇱",
  "belgium": "🇧🇪",
  "switzerland": "🇨🇭",
  "austria": "🇦🇹",
  "czech republic": "🇨🇿",
  "czechia": "🇨🇿",
  "poland": "🇵🇱",
  "hungary": "🇭🇺",
  "romania": "🇷🇴",
  "greece": "🇬🇷",
  "turkey": "🇹🇷",
  "egypt": "🇪🇬",
  "south africa": "🇿🇦",
  "morocco": "🇲🇦",
  "thailand": "🇹🇭",
  "vietnam": "🇻🇳",
  "cambodia": "🇰🇭",
  "laos": "🇱🇦",
  "indonesia": "🇮🇩",
  "malaysia": "🇲🇾",
  "singapore": "🇸🇬",
  "philippines": "🇵🇭",
  "south korea": "🇰🇷",
  "korea": "🇰🇷",
  "china": "🇨🇳",
  "hong kong": "🇭🇰",
  "taiwan": "🇹🇼",
  "india": "🇮🇳",
  "sri lanka": "🇱🇰",
  "nepal": "🇳🇵",
  "bhutan": "🇧🇹",
  "pakistan": "🇵🇰",
  "iran": "🇮🇷",
  "uae": "🇦🇪",
  "united arab emirates": "🇦🇪",
  "saudi arabia": "🇸🇦",
  "israel": "🇮🇱",
  "jordan": "🇯🇴",
  "australia": "🇦🇺",
  "new zealand": "🇳🇿",
  "fiji": "🇫🇯",
  "canada": "🇨🇦",
  "mexico": "🇲🇽",
  "brazil": "🇧🇷",
  "argentina": "🇦🇷",
  "chile": "🇨🇱",
  "peru": "🇵🇪",
  "colombia": "🇨🇴",
  "ecuador": "🇪🇨",
  "costa rica": "🇨🇷",
  "panama": "🇵🇦",
};

function getFlagEmoji(destination: string): string {
  const lower = destination.toLowerCase().trim();
  return COUNTRY_FLAGS[lower] || "🌍";
}

// ---------------------------------------------------------------------------
// Category badge
// ---------------------------------------------------------------------------
function CategoryBadge({ category }: { category: string }) {
  const cls =
    category.toLowerCase() === "luxury"
      ? "badge-luxury"
      : category.toLowerCase() === "backpacker"
      ? "badge-backpacker"
      : "badge-standard";
  return (
    <span
      className={`${cls} text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-widest`}
    >
      {category}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Travel style badge
// ---------------------------------------------------------------------------
function TravelStyleBadge({ style }: { style: string }) {
  return (
    <span className="bg-slate-700/50 text-slate-300 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize">
      {style}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Inline stat (icon + label + value)
// ---------------------------------------------------------------------------
function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
      <span className="text-slate-500 shrink-0">{icon}</span>
      <span className="text-slate-500">{label}:</span>
      <span className="text-slate-300 font-medium">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TripCard
// ---------------------------------------------------------------------------
export type TripCardProps = {
  trip: Trip;
};

export default function TripCard({ trip }: TripCardProps) {
  const flagEmoji = getFlagEmoji(trip.destination);
  const formattedDate = new Date(trip.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/trips/${trip.id}`} className="group block focus:outline-none">
      <article className="result-card rounded-2xl p-5 h-full flex flex-col gap-4 transition-all duration-300 group-hover:border-blue-500/40 group-hover:shadow-[0_0_24px_rgba(59,130,246,0.1)] group-focus-visible:ring-2 group-focus-visible:ring-blue-500/60">
        {/* Top row: flag + destination + badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex items-start gap-2">
            <span className="text-2xl shrink-0" role="img" aria-label={trip.destination}>
              {flagEmoji}
            </span>
            <div>
              <h2 className="text-lg font-bold text-gradient truncate leading-tight">
                {trip.destination}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <TravelStyleBadge style={trip.travel_style} />
                <span className="text-slate-500 text-xs">
                  {trip.days} {trip.days === 1 ? "day" : "days"}
                </span>
              </div>
            </div>
          </div>
          <CategoryBadge category={trip.category} />
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-2">
          <Stat
            icon={
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            label="Budget"
            value={`$${trip.budget.toLocaleString()}`}
          />
          <Stat
            icon={
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            }
            label="Daily"
            value={`$${trip.daily_budget.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          />
        </div>

        {/* AI recommendation snippet */}
        {trip.ai_recommendation && (
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mt-auto">
            {trip.ai_recommendation.replace(/[#*_`]/g, "").trim()}
          </p>
        )}

        {/* Footer: date + arrow */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-800/60">
          <span className="text-slate-600 text-xs">{formattedDate}</span>
          <span className="text-blue-500 text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
            View
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </div>
      </article>
    </Link>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getTrip, type Trip } from "@/services/tripService";

// ---------------------------------------------------------------------------
// Category Badge
// ---------------------------------------------------------------------------
function CategoryBadge({ category }: { category: string }) {
  const cls =
    category.toLowerCase() === "luxury"
      ? "badge-luxury"
      : category.toLowerCase() === "backpacker"
      ? "badge-backpacker"
      : "badge-standard";
  return (
    <span className={`${cls} text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest`}>
      {category}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="result-card rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <p className="text-xs uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-xl font-bold text-slate-100">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-slate-700/60 rounded w-1/3" />
      <div className="h-4 bg-slate-700/40 rounded w-1/4" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="result-card rounded-xl p-4 h-20" />
        ))}
      </div>
      <div className="space-y-2 mt-4">
        <div className="h-3 bg-slate-700/30 rounded w-full" />
        <div className="h-3 bg-slate-700/30 rounded w-5/6" />
        <div className="h-3 bg-slate-700/30 rounded w-4/5" />
        <div className="h-3 bg-slate-700/30 rounded w-full" />
        <div className="h-3 bg-slate-700/30 rounded w-3/4" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero Image
// ---------------------------------------------------------------------------
function HeroImage({ destination }: { destination: string }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgUrl(null);
    setImgError(false);

    const query = destination.trim() ? `${destination.trim()} travel` : "travel landscape";

    fetch(`/api/unsplash?query=${encodeURIComponent(query)}&orientation=landscape`)
      .then((res) => res.json())
      .then((data) => {
        if (data.url) setImgUrl(data.url);
        else setImgError(true);
      })
      .catch(() => setImgError(true));
  }, [destination]);

  return (
    <div className="relative w-full h-52 sm:h-64 md:h-72 rounded-2xl overflow-hidden mb-8 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-slate-900 to-purple-900/60" />
      {imgUrl && !imgError && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgUrl}
          alt={`Travel photo of ${destination}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0"
          onLoad={(e) => {
            (e.currentTarget as HTMLImageElement).classList.remove("opacity-0");
            (e.currentTarget as HTMLImageElement).classList.add("opacity-100");
          }}
          onError={() => setImgError(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-[#020817]/40 to-transparent" />
      <div className="absolute bottom-4 left-5 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 badge-glow rounded-full px-3 py-1 text-xs text-blue-300 font-semibold uppercase tracking-widest">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {destination}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trip detail content
// ---------------------------------------------------------------------------
function TripDetail({ trip }: { trip: Trip }) {
  const formattedDate = new Date(trip.created_at).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="animate-fade-in-up space-y-8">
      <HeroImage destination={trip.destination} />

      <div className="glass rounded-2xl p-6 md:p-8 space-y-6">
        {/* Title row */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gradient leading-tight">
              {trip.destination}
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 capitalize">
              {trip.travel_style} trip &middot; {trip.days}{" "}
              {trip.days === 1 ? "day" : "days"}
            </p>
            <p className="text-slate-600 text-xs mt-1">{formattedDate}</p>
          </div>
          <CategoryBadge category={trip.category} />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="Total Budget"
            value={`$${trip.budget.toLocaleString()}`}
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Duration"
            value={`${trip.days} ${trip.days === 1 ? "Day" : "Days"}`}
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            label="Daily Budget"
            value={`$${trip.daily_budget.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>

        {/* AI Recommendation */}
        {trip.ai_recommendation ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="ai-dot" />
              <span className="text-xs text-blue-400 uppercase tracking-widest font-semibold">
                AI Itinerary
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
            </div>
            <div className="result-card rounded-xl p-5">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-xl font-bold text-slate-100 mt-4 mb-2 first:mt-0" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-lg font-bold text-slate-100 mt-3 mb-1.5" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-base font-bold text-slate-100 mt-3 mb-1" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-slate-300 text-sm leading-relaxed mb-3 last:mb-0" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-outside text-slate-300 text-sm leading-relaxed mb-3 space-y-1.5 pl-5" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-outside text-slate-300 text-sm leading-relaxed mb-3 space-y-1.5 pl-5" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-slate-300 text-sm leading-relaxed pl-1" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-blue-300" {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="italic text-purple-300" {...props} />
                  ),
                  code: ({ node, inline, className, ...props }: any) =>
                    inline ? (
                      <code className="bg-slate-800/50 px-1.5 py-0.5 rounded text-cyan-300 text-xs font-mono" {...props} />
                    ) : (
                      <code className="block bg-slate-800/70 border border-slate-700/50 px-4 py-3 rounded-lg text-cyan-300 text-xs font-mono overflow-x-auto mb-3 whitespace-pre" {...props} />
                    ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-blue-400/50 pl-4 text-slate-400 italic mb-3" {...props} />
                  ),
                  hr: () => <hr className="my-4 border-slate-700/30" />,
                  a: ({ node, ...props }) => (
                    <a className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                }}
              >
                {trip.ai_recommendation}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="result-card rounded-xl p-5 text-center">
            <p className="text-slate-500 text-sm">No AI itinerary available for this trip.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TripDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [trip,    setTrip]    = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id || isNaN(id)) {
      notFound();
      return;
    }

    setLoading(true);
    setError(null);

    getTrip(id)
      .then((data) => setTrip(data))
      .catch((err: Error) => {
        if (err.message.startsWith("404")) {
          notFound();
        } else {
          setError(err.message || "Failed to load trip.");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="relative min-h-screen">
      {/* Background decoration */}
      <div className="bg-mesh" aria-hidden="true" />
      <div className="bg-grid"  aria-hidden="true" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Back link */}
        <Link
          href="/trips"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs mb-6 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All trips
        </Link>

        {/* Error state */}
        {error && (
          <div className="glass border border-red-500/30 rounded-xl px-5 py-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="glass rounded-2xl p-6 md:p-8">
            <DetailSkeleton />
          </div>
        )}

        {/* Content */}
        {!loading && !error && trip && <TripDetail trip={trip} />}
      </div>
    </div>
  );
}

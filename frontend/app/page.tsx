"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { type Trip, generateTrip } from "@/services/tripService";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const TRAVEL_STYLES = ["Adventure", "Family", "Luxury", "Backpacker", "Cultural", "Romantic"];

// ---------------------------------------------------------------------------
// Hero Image
// ---------------------------------------------------------------------------
// Fetches a photo from the Unsplash API via our server-side route handler
// (/api/unsplash) so the access key is never exposed to the browser.
// Falls back to a gradient placeholder when the API is unavailable.
function HeroImage({ destination }: { destination: string }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  // Re-fetch whenever the destination changes
  useEffect(() => {
    setImgUrl(null);
    setImgError(false);

    const query = destination.trim()
      ? `${destination.trim()} travel`
      : "travel landscape";

    fetch(`/api/unsplash?query=${encodeURIComponent(query)}&orientation=landscape`)
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setImgUrl(data.url);
        } else {
          setImgError(true);
        }
      })
      .catch(() => setImgError(true));
  }, [destination]);

  return (
    <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-2xl overflow-hidden mb-10 shadow-2xl">
      {/* Gradient placeholder shown while loading or on error */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-slate-900 to-purple-900/60" />

      {/* Actual image — fades in once loaded */}
      {imgUrl && !imgError && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgUrl}
          alt={destination ? `Travel photo of ${destination}` : "Travel destination"}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0"
          onLoad={(e) => {
            (e.currentTarget as HTMLImageElement).classList.remove("opacity-0");
            (e.currentTarget as HTMLImageElement).classList.add("opacity-100");
          }}
          onError={() => setImgError(true)}
        />
      )}

      {/* Dark gradient overlay so text reads on top of image */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-[#020817]/40 to-transparent" />

      {/* Floating destination label */}
      {destination && (
        <div className="absolute bottom-4 left-5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 badge-glow rounded-full px-3 py-1 text-xs text-blue-300 font-semibold uppercase tracking-widest">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {destination}
          </span>
        </div>
      )}
    </div>
  );
}

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
function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
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
// Trip Result
// ---------------------------------------------------------------------------
function TripResult({ trip }: { trip: Trip }) {
  return (
    <div className="animate-fade-in-up mt-8 w-full">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="ai-dot" />
        <p className="text-xs text-blue-400 uppercase tracking-widest font-semibold">AI Itinerary Generated</p>
        <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
      </div>

      <div className="glass rounded-2xl p-6 md:p-8 space-y-6">
        {/* Title row */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gradient">
              {trip.destination}
            </h2>
            <p className="text-slate-400 text-sm mt-1.5 capitalize">
              {trip.travel_style} trip &middot; {trip.days} {trip.days === 1 ? "day" : "days"}
            </p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Duration"
            value={`${trip.days} ${trip.days === 1 ? "Day" : "Days"}`}
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            label="Daily Budget"
            value={`$${trip.daily_budget.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>

        {/* AI Recommendation */}
        {trip.ai_recommendation && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-purple-400 uppercase tracking-widest font-semibold">AI Recommendation</span>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent" />
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
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading Spinner
// ---------------------------------------------------------------------------
function LoadingSpinner({ destination }: { destination: string }) {
  return (
    <div className="animate-fade-in-up mt-8 w-full">
      <div className="glass rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 animate-spin" />
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent border-t-purple-400 animate-spin"
            style={{ animationDuration: "0.6s", animationDirection: "reverse" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-slate-200">
            Crafting your itinerary for
            {destination && <span className="text-gradient"> {destination}</span>}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Our AI is planning your trip. This usually takes 5–15 seconds.
          </p>
        </div>
        <div className="w-full max-w-xs h-0.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full"
            style={{
              backgroundSize: "200% 100%",
              animation: "progressSlide 2s linear infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------
function friendlyError(err: unknown): { title: string; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (!navigator.onLine || raw.toLowerCase().includes("failed to fetch") || raw.toLowerCase().includes("networkerror")) {
    return { title: "No connection", message: "It looks like you're offline. Check your internet connection and try again." };
  }
  if (raw.includes("503") || raw.toLowerCase().includes("service unavailable")) {
    return { title: "Service unavailable", message: "The server is temporarily unavailable. Please wait a moment and try again." };
  }
  if (raw.includes("500") || raw.toLowerCase().includes("internal server error")) {
    return { title: "Server error", message: "Something went wrong on our end while generating your itinerary. Please try again." };
  }
  if (raw.includes("404") || raw.toLowerCase().includes("not found")) {
    return { title: "Not found", message: "The requested resource could not be found. Please try again later." };
  }
  if (raw.includes("422") || raw.toLowerCase().includes("unprocessable")) {
    return { title: "Invalid input", message: "Some of your trip details couldn't be processed. Check your inputs and try again." };
  }
  if (raw.includes("401") || raw.includes("403")) {
    return { title: "Access denied", message: "The AI service isn't authorised right now. Please contact support if this persists." };
  }
  if (raw.toLowerCase().includes("timeout") || raw.toLowerCase().includes("timed out")) {
    return { title: "Request timed out", message: "The AI took too long to respond. This sometimes happens with longer itineraries — please try again." };
  }
  return { title: "Something went wrong", message: "We couldn't generate your trip. Please try again, or adjust your inputs." };
}

function ErrorCard({ title, message, onRetry }: { title: string; message: string; onRetry: () => void }) {
  return (
    <div className="animate-fade-in-up flex flex-col gap-4 bg-red-500/8 border border-red-500/20 rounded-xl p-5">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div className="flex flex-col gap-1 pt-0.5">
          <p className="text-sm font-semibold text-red-300">{title}</p>
          <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="self-start flex items-center gap-2 text-xs font-semibold text-red-300 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:border-red-400/50 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Try again
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 w-full border-t border-slate-800/60 mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-gradient text-lg font-black tracking-tight">Kelana</span>
              <span className="text-slate-100 text-lg font-black tracking-tight">AI</span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs text-center sm:text-left leading-relaxed">
              AI-powered travel planning. Describe your dream trip and get a personalised itinerary in seconds.
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer navigation" className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-2">
            {[
              { label: "About", href: "#" },
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
              { label: "Support", href: "#" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            &copy; {year} KelanaAI. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-slate-600 hover:text-slate-300 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            {/* Twitter / X */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="text-slate-600 hover:text-slate-300 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    destination: "",
    budget: "",
    days: "",
    travelStyle: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);

  // The hero image destination — updates after a successful trip is returned
  const [heroDestination, setHeroDestination] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (while redirecting)
  if (!isAuthenticated) {
    return null;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleStyleSelect(style: string) {
    setFormData({ ...formData, travelStyle: style });
  }

  async function submitTrip() {
    setLoading(true);
    setError(null);
    setTrip(null);

    try {
      const data = await generateTrip({
        destination: formData.destination,
        budget: parseInt(formData.budget),
        days: parseInt(formData.days),
        travel_style: formData.travelStyle,
      });
      setTrip(data);
      setHeroDestination(data.destination);
      router.push("/trips");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await submitTrip();
  }

  const canSubmit =
    formData.destination.trim() &&
    formData.budget.trim() &&
    formData.days.trim() &&
    formData.travelStyle.trim() &&
    !loading;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Layered background */}
      <div className="bg-mesh" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />
      <div className="scan-line" aria-hidden="true" />

      {/* ------------------------------------------------------------------ */}
      {/* Header / Nav                                                         */}
      {/* ------------------------------------------------------------------ */}
      <Navbar />

      {/* ------------------------------------------------------------------ */}
      {/* Main content                                                         */}
      {/* ------------------------------------------------------------------ */}
      <main className="relative z-10 flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16 flex flex-col gap-8">

          {/* 1. Hero image */}
          <HeroImage destination={heroDestination} />

          {/* 2. Page heading + input form */}
          <div>
            {/* Heading */}
            <div className="mb-7 animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none mb-3">
                <span className="text-gradient">Plan your</span>
                <br />
                <span className="text-slate-100">perfect trip</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Describe your dream destination, set your budget, and let our AI craft a personalised itinerary for you.
              </p>
            </div>

            {/* Form card */}
            <div className="glass rounded-2xl p-6 md:p-8 animate-fade-in-up-delay-1">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

                {/* Destination */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="destination" className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Destination
                  </label>
                  <div className="glass-input rounded-xl px-4 py-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      id="destination"
                      type="text"
                      name="destination"
                      placeholder="e.g. Tokyo, Bali, Paris…"
                      value={formData.destination}
                      onChange={handleChange}
                      autoComplete="off"
                      className="w-full bg-transparent text-slate-100 text-sm outline-none placeholder-slate-600"
                    />
                  </div>
                </div>

                {/* Budget + Days — stacks on mobile, side-by-side on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="budget" className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Budget (USD)
                    </label>
                    <div className="glass-input rounded-xl px-4 py-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <input
                        id="budget"
                        type="number"
                        name="budget"
                        placeholder="e.g. 2000"
                        value={formData.budget}
                        onChange={handleChange}
                        min={0}
                        className="w-full bg-transparent text-slate-100 text-sm outline-none placeholder-slate-600"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="days" className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Duration (Days)
                    </label>
                    <div className="glass-input rounded-xl px-4 py-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <input
                        id="days"
                        type="number"
                        name="days"
                        placeholder="e.g. 7"
                        value={formData.days}
                        onChange={handleChange}
                        min={1}
                        className="w-full bg-transparent text-slate-100 text-sm outline-none placeholder-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Travel Style pills */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Travel Style</p>
                  <div className="flex flex-wrap gap-2">
                    {TRAVEL_STYLES.map((style) => {
                      const active = formData.travelStyle === style;
                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => handleStyleSelect(style)}
                          className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer ${
                            active
                              ? "bg-blue-500/20 border-blue-400/60 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.25)]"
                              : "bg-transparent border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {style}
                        </button>
                      );
                    })}
                  </div>
                  {!TRAVEL_STYLES.includes(formData.travelStyle) && formData.travelStyle && (
                    <p className="text-xs text-blue-400 mt-1">Custom: &ldquo;{formData.travelStyle}&rdquo;</p>
                  )}
                </div>

                {/* Error inline */}
                {error && (
                  <ErrorCard title={error.title} message={error.message} onRetry={submitTrip} />
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="btn-glow mt-1 text-white font-bold py-3.5 rounded-xl text-sm tracking-wide flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate AI Trip
                </button>
              </form>
            </div>
          </div>

          {/* 3. AI result / loading spinner — only shown after a submission */}
          {loading && <LoadingSpinner destination={formData.destination} />}
          {!loading && trip && <TripResult trip={trip} />}

        </div>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                               */}
      {/* ------------------------------------------------------------------ */}
      <Footer />
    </div>
  );
}

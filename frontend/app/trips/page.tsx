"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import TripCard from "@/components/TripCard";
import Navbar from "@/components/Navbar";
import { getTrips, type PaginatedTrips, type SortBy } from "@/services/tripService";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "latest",         label: "Latest first"       },
  { value: "oldest",         label: "Oldest first"       },
  { value: "highest_budget", label: "Highest budget"     },
];

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-2">
        <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </div>
      {hasSearch ? (
        <>
          <p className="text-slate-300 font-semibold text-lg">No trips match your search</p>
          <p className="text-slate-500 text-sm">Try a different keyword or clear the search.</p>
        </>
      ) : (
        <>
          <p className="text-slate-300 font-semibold text-lg">No trips yet</p>
          <p className="text-slate-500 text-sm">Plan your first adventure and it will appear here.</p>
          <Link href="/" className="btn-glow mt-2 px-5 py-2 rounded-xl text-sm font-semibold text-white">
            Plan a trip
          </Link>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------
function SkeletonCard() {
  return (
    <div className="result-card rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700/60 rounded w-2/3" />
          <div className="h-3 bg-slate-700/40 rounded w-1/3" />
        </div>
        <div className="h-5 w-20 bg-slate-700/40 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-700/40 rounded w-1/2" />
        <div className="h-3 bg-slate-700/40 rounded w-2/5" />
      </div>
      <div className="space-y-1.5 mt-auto">
        <div className="h-2.5 bg-slate-700/30 rounded w-full" />
        <div className="h-2.5 bg-slate-700/30 rounded w-4/5" />
      </div>
      <div className="flex justify-between pt-3 border-t border-slate-800/60">
        <div className="h-3 w-20 bg-slate-700/30 rounded" />
        <div className="h-3 w-12 bg-slate-700/30 rounded" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination controls
// ---------------------------------------------------------------------------
function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  // Build visible page numbers: always show first, last, current ±1
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) pages.add(i);
  const pageList = Array.from(pages).sort((a, b) => a - b);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8">
      <p className="text-slate-500 text-xs">
        Showing <span className="text-slate-300">{from}–{to}</span> of{" "}
        <span className="text-slate-300">{total}</span> trips
      </p>
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="p-2 rounded-lg result-card disabled:opacity-30 hover:border-blue-500/40 transition-colors disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {pageList.map((p, i) => {
          const prev = pageList[i - 1];
          const showEllipsis = prev !== undefined && p - prev > 1;
          return (
            <span key={p} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="px-1 text-slate-600 text-sm select-none">…</span>
              )}
              <button
                onClick={() => onChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "btn-glow text-white"
                    : "result-card text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                }`}
              >
                {p}
              </button>
            </span>
          );
        })}

        {/* Next */}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className="p-2 rounded-lg result-card disabled:opacity-30 hover:border-blue-500/40 transition-colors disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TripsPage() {
  const [search,  setSearch]  = useState("");
  const [sortBy,  setSortBy]  = useState<SortBy>("latest");
  const [page,    setPage]    = useState(1);
  const [data,    setData]    = useState<PaginatedTrips | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Debounce search: only fire after 350 ms of silence
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 350);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search]);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTrips({
        search:    debouncedSearch || undefined,
        sort_by:   sortBy,
        page,
        page_size: PAGE_SIZE,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trips.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sortBy, page]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  // Reset to page 1 when sort changes
  const handleSortChange = (value: SortBy) => {
    setSortBy(value);
    setPage(1);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background decoration */}
      <div className="bg-mesh" aria-hidden="true" />
      <div className="bg-grid"  aria-hidden="true" />

      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Page title */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-black text-gradient leading-tight">
            My Trips
          </h1>
          {data && !loading && (
            <p className="text-slate-500 text-sm mt-1">
              {data.total} {data.total === 1 ? "trip" : "trips"} saved
            </p>
          )}
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up-delay-1">
          {/* Search input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destination or travel style…"
              aria-label="Search trips"
              className="glass-input w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Sort selector */}
          <div className="relative shrink-0">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortBy)}
              aria-label="Sort trips"
              className="glass-input appearance-none rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-200 focus:outline-none cursor-pointer bg-transparent"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-slate-900">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="glass border border-red-500/30 rounded-xl px-5 py-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.items.map((trip, i) => (
                <div
                  key={trip.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
                >
                  <TripCard trip={trip} />
                </div>
              ))}
            </div>
            <Pagination
              page={data.page}
              totalPages={data.total_pages}
              total={data.total}
              pageSize={data.page_size}
              onChange={setPage}
            />
          </>
        ) : (
          <EmptyState hasSearch={!!debouncedSearch} />
        )}
      </div>
    </div>
  );
}

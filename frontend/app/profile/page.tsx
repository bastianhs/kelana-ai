"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authService, MeResponse } from "@/services/authService";
import Navbar from "@/components/Navbar";

type ProfileData = MeResponse["data"];

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, token } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch profile data
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    async function fetchProfile() {
      try {
        setIsFetching(true);
        const res = await authService.me(token!.access_token);
        setProfile(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsFetching(false);
      }
    }

    fetchProfile();
  }, [isAuthenticated, token]);

  // While auth is hydrating
  if (isLoading || (!isAuthenticated && !profile)) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-start pt-20 px-4">
      <div className="w-full max-w-lg">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Your account information and trip statistics.
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 rounded-lg px-4 py-3 text-sm bg-red-500/10 border border-red-500/30 text-red-300">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {isFetching && !error && (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-slate-800/50 border border-slate-700/50"
              />
            ))}
          </div>
        )}

        {/* Profile card */}
        {profile && !isFetching && (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
            {/* Avatar header */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-700/50">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <span className="text-blue-300 font-bold text-lg uppercase">
                  {profile.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-base font-semibold text-slate-100">
                  {profile.name}
                </p>
                <p className="text-xs text-slate-500">{profile.email}</p>
              </div>
            </div>

            {/* Info rows */}
            <div className="divide-y divide-slate-700/50">
              {/* Name */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Name
                  </span>
                </div>
                <span className="text-sm text-slate-200 font-medium">
                  {profile.name}
                </span>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Email
                  </span>
                </div>
                <span className="text-sm text-slate-200 font-medium">
                  {profile.email}
                </span>
              </div>

              {/* Total trips */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Total Trips Generated
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-300">
                  {profile.total_trips}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
    </>
  );
}

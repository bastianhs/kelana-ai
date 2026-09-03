"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// ---------------------------------------------------------------------------
// Toast Notification
// ---------------------------------------------------------------------------
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm rounded-lg px-4 py-3 text-sm font-medium animate-fade-in-up ${
        type === "success"
          ? "bg-green-500/20 border border-green-500/40 text-green-300"
          : "bg-red-500/20 border border-red-500/40 text-red-300"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p>{message}</p>
        <button
          onClick={onClose}
          className="text-current opacity-60 hover:opacity-100 transition-opacity"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Navbar — shared across all pages
// ---------------------------------------------------------------------------
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const links = [
    {
      href: "/",
      label: "Generate Trip",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      requiresAuth: true,
    },
    {
      href: "/trips",
      label: "My Trips",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      requiresAuth: true,
    },
    {
      href: "/assistant",
      label: "Assistant",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      requiresAuth: true,
    },
    {
      href: "/chat",
      label: "Chat",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      requiresAuth: true,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      requiresAuth: true,
    },
  ];

  function handleLogout() {
    logout();
    setToast({
      message: "Logged out successfully!",
      type: "success",
    });
    setTimeout(() => {
      router.push("/login");
    }, 800);
  }

  return (
    <>
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
            {links
              .filter((link) => !link.requiresAuth || isAuthenticated)
              .map(({ href, label, icon }) => {
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

          {/* Right section: Auth button or User badge + Logout */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Personalized welcome message */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs text-slate-300 border border-slate-700/50">
                  <span>Welcome back,</span>
                  <span className="font-semibold text-blue-300 truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span>👋</span>
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-red-300 hover:bg-red-500/10 border border-slate-700/50 hover:border-red-500/30 transition-all duration-200 cursor-pointer"
                  aria-label="Sign out"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                {/* Sign in and Register buttons */}
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 border border-slate-700/50 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-all duration-200"
                >
                  Register
                </Link>
              </>
            )}

            {/* AI badge - only show when not authenticated */}
            {!isAuthenticated && (
              <div className="hidden sm:flex items-center gap-1.5 badge-glow rounded-full px-3 py-1 text-xs text-blue-300 font-semibold uppercase tracking-widest">
                <div className="ai-dot" style={{ width: 6, height: 6 }} />
                Powered by AI
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

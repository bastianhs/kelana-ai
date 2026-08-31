"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { authService, type LoginRequest } from "@/services/authService";

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
// Login Page
// ---------------------------------------------------------------------------
export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/trips");
    }
  }, [isAuthenticated, router]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload: LoginRequest = {
        email: formData.email,
        password: formData.password,
      };

      const response = await authService.login(payload);
      const tokenData = response.data;

      if (!tokenData.access_token) {
        throw new Error("No token received from server");
      }

      // Store entire token object
      setToken(tokenData);

      // Fetch current user data
      const userResponse = await authService.getCurrentUser(tokenData.access_token);
      const userData = userResponse.data;

      // Store user data
      setUser({
        id: userData.id || "",
        name: userData.name || "",
        email: userData.email || "",
      });

      setToast({
        message: "Login successful! Redirecting...",
        type: "success",
      });

      // Redirect to trips after 1 second
      setTimeout(() => {
        router.push("/trips");
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setToast({
        message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = formData.email.trim() && formData.password && !loading;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Layered background */}
      <div className="bg-mesh" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />
      <div className="scan-line" aria-hidden="true" />

      {/* Header / Nav */}
      <Navbar />

      {/* Main content */}
      <main className="relative z-10 flex-1 w-full flex items-center justify-center">
        <div className="w-full max-w-md px-4 py-8 sm:px-6">
          {/* Heading */}
          <div className="mb-8 text-center animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              <span className="text-gradient">Sign In</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Welcome back! Sign in to your account
            </p>
          </div>

          {/* Form card */}
          <div className="glass rounded-2xl p-6 sm:p-8 animate-fade-in-up-delay-1">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              {/* Email field */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-slate-400 uppercase tracking-widest"
                >
                  Email Address
                </label>
                <div
                  className={`glass-input rounded-xl px-4 py-3 flex items-center gap-2 ${
                    errors.email ? "border-red-500/50" : ""
                  }`}
                >
                  <svg
                    className="w-4 h-4 text-slate-600 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    className="w-full bg-transparent text-slate-100 text-sm outline-none placeholder-slate-600"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-400 uppercase tracking-widest"
                >
                  Password
                </label>
                <div
                  className={`glass-input rounded-xl px-4 py-3 flex items-center gap-2 ${
                    errors.password ? "border-red-500/50" : ""
                  }`}
                >
                  <svg
                    className="w-4 h-4 text-slate-600 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    className="w-full bg-transparent text-slate-100 text-sm outline-none placeholder-slate-600"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="btn-glow mt-2 text-white font-bold py-3 rounded-xl text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Sign up link */}
              <p className="text-center text-xs text-slate-500">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

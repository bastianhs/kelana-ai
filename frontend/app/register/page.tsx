"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { authService, type RegisterRequest } from "@/services/authService";

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
// Register Page
// ---------------------------------------------------------------------------
export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const payload: RegisterRequest = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      await authService.register(payload);

      setToast({
        message: "Registration successful! Redirecting to login...",
        type: "success",
      });

      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setToast({
        message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.password &&
    formData.confirmPassword &&
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

      {/* Header / Nav */}
      <Navbar />

      {/* Main content */}
      <main className="relative z-10 flex-1 w-full flex items-center justify-center">
        <div className="w-full max-w-md px-4 py-8 sm:px-6">
          {/* Heading */}
          <div className="mb-8 text-center animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              <span className="text-gradient">Create Account</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Join us to start planning your perfect trips
            </p>
          </div>

          {/* Form card */}
          <div className="glass rounded-2xl p-6 sm:p-8 animate-fade-in-up-delay-1">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              {/* Name field */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name"
                  className="text-xs font-semibold text-slate-400 uppercase tracking-widest"
                >
                  Full Name
                </label>
                <div
                  className={`glass-input rounded-xl px-4 py-3 flex items-center gap-2 ${
                    errors.name ? "border-red-500/50" : ""
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    className="w-full bg-transparent text-slate-100 text-sm outline-none placeholder-slate-600"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name}</p>
                )}
              </div>

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
                    autoComplete="new-password"
                    className="w-full bg-transparent text-slate-100 text-sm outline-none placeholder-slate-600"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password field */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold text-slate-400 uppercase tracking-widest"
                >
                  Confirm Password
                </label>
                <div
                  className={`glass-input rounded-xl px-4 py-3 flex items-center gap-2 ${
                    errors.confirmPassword ? "border-red-500/50" : ""
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
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className="w-full bg-transparent text-slate-100 text-sm outline-none placeholder-slate-600"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400">{errors.confirmPassword}</p>
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
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* Sign in link */}
              <p className="text-center text-xs text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Sign in
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

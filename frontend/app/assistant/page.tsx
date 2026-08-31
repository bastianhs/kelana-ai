"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import MarkdownContent from "@/components/MarkdownContent";
import { askAssistant, type AskResponse } from "@/services/assistantService";

// ---------------------------------------------------------------------------
// Loading Spinner
// ---------------------------------------------------------------------------
function LoadingSpinner() {
  return (
    <div className="animate-fade-in-up glass rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
      <div className="relative w-14 h-14">
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
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-200">Searching your travel documents…</p>
        <p className="text-xs text-slate-500">This usually takes a few seconds.</p>
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
  );
}

// ---------------------------------------------------------------------------
// Answer Card
// ---------------------------------------------------------------------------
function AnswerCard({ result }: { result: AskResponse }) {
  return (
    <div className="animate-fade-in-up space-y-3">
      <div className="glass rounded-2xl p-6 space-y-4">
        {/* Header row */}
        <div className="flex items-center gap-2">
          <div className="ai-dot" />
          <p className="text-xs text-blue-400 uppercase tracking-widest font-semibold">AI Answer</p>
          <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
        </div>

        {/* Answer text */}
        <div className="result-card rounded-xl p-5">
          <MarkdownContent>{result.answer}</MarkdownContent>
        </div>

        {/* Sources */}
        {result.documents && result.documents.length > 0 && (
          <div className="pt-3 border-t border-slate-800/60 space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Source</p>
            <div className="flex flex-col gap-2">
              {result.documents.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 result-card rounded-lg px-3 py-2"
                >
                  <svg
                    className="w-3.5 h-3.5 text-slate-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-xs text-slate-400 font-mono">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error Card
// ---------------------------------------------------------------------------
function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="animate-fade-in-up flex flex-col gap-4 bg-red-500/8 border border-red-500/20 rounded-xl p-5">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div className="flex flex-col gap-1 pt-0.5">
          <p className="text-sm font-semibold text-red-300">Something went wrong</p>
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
// Page
// ---------------------------------------------------------------------------
export default function AssistantPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskResponse | null>(null);
  const [lastQuestion, setLastQuestion] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

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

  if (!isAuthenticated) return null;

  async function submit() {
    const q = question.trim();
    if (!q || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setLastQuestion(q);

    try {
      const data = await askAssistant(q);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get an answer. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const canSubmit = question.trim().length > 0 && !loading;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Background decoration */}
      <div className="bg-mesh" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />
      <div className="scan-line" aria-hidden="true" />

      <Navbar />

      <main className="relative z-10 flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16 flex flex-col gap-8">

          {/* Page heading */}
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3">
              <div className="ai-dot" />
              <span className="text-xs text-blue-400 uppercase tracking-widest font-semibold">
                Travel Assistant
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none mb-3">
              <span className="text-gradient">Ask Kelana</span>
              <span className="text-slate-100">AI</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Powered by your trusted travel documents
            </p>
          </div>

          {/* Question form */}
          <div className="glass rounded-2xl p-6 md:p-8 animate-fade-in-up-delay-1">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label htmlFor="question" className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Your Question
              </label>

              <div className="flex gap-3">
                <div className="flex-1 glass-input rounded-xl px-4 py-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-slate-600 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <input
                    ref={inputRef}
                    id="question"
                    type="text"
                    placeholder="e.g. Can I bring medication into Japan?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    className="w-full bg-transparent text-slate-100 text-sm outline-none placeholder-slate-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  aria-label="Ask"
                  className="btn-glow px-5 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                >
                  Ask
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Answers are grounded in your uploaded documents.
              </p>
            </form>
          </div>

          {/* Result area */}
          {loading && <LoadingSpinner />}

          {!loading && error && (
            <ErrorCard message={error} onRetry={submit} />
          )}

          {!loading && result && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 px-1">
                Result for:{" "}
                <span className="text-slate-300 font-medium">&ldquo;{lastQuestion}&rdquo;</span>
              </p>
              <AnswerCard result={result} />
            </div>
          )}

          {/* Empty state hint */}
          {!loading && !result && !error && (
            <div className="animate-fade-in-up flex flex-col items-center gap-3 py-10 text-center">
              <div className="w-14 h-14 rounded-full glass flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <p className="text-slate-400 text-sm font-medium">Ask anything about your travels</p>
              <p className="text-slate-600 text-xs max-w-sm leading-relaxed">
                Try questions like &ldquo;What vaccines do I need for Southeast Asia?&rdquo; or
                &ldquo;What&apos;s the visa policy for Japan?&rdquo;
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

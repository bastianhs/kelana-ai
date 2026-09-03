"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import MarkdownContent from "@/components/MarkdownContent";
import {
  listConversations,
  createConversation,
  listMessages,
  sendMessage,
  renameConversation,
  type Conversation,
  type Message,
} from "@/services/chatService";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Typing indicator
// ---------------------------------------------------------------------------
function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-fade-in-up">
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Message bubble
// ---------------------------------------------------------------------------
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1 animate-fade-in-up">
        <div
          className="max-w-[72%] px-4 py-3 rounded-2xl rounded-br-sm text-sm text-slate-100 leading-relaxed"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
            boxShadow: "0 2px 12px rgba(99,102,241,0.25)",
          }}
        >
          {message.content}
        </div>
        <span className="text-xs text-slate-500 px-1">{formatDate(message.created_at)}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1 animate-fade-in-up">
      <div className="flex items-end gap-3">
        {/* AI avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="glass max-w-[72%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-slate-200 leading-relaxed">
          <MarkdownContent>{message.content}</MarkdownContent>
        </div>
      </div>
      <span className="text-xs text-slate-500 pl-10">{formatDate(message.created_at)}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-200">Start a conversation</h2>
        <p className="text-sm text-slate-500 max-w-xs">
          Ask KelanaAI anything about travel — itineraries, destinations, tips, and more.
        </p>
      </div>
      <button
        onClick={onNew}
        className="btn-glow px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Chat
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Rename state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auth guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  // Load conversations on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    listConversations()
      .then(setConversations)
      .catch(console.error);
  }, [isAuthenticated]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Load messages when active conversation changes
  const loadMessages = useCallback(async (id: number) => {
    setIsLoadingMessages(true);
    setMessages([]);
    try {
      const msgs = await listMessages(id);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  function handleSelectConversation(id: number) {
    setActiveId(id);
    loadMessages(id);
  }

  async function handleNewChat() {
    setIsCreating(true);
    try {
      const conv = await createConversation("New Conversation");
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      setMessages([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSend() {
    const content = input.trim();
    if (!content || !activeId || isSending) return;

    // Optimistically add the user message
    const optimistic: Message = {
      id: Date.now(),
      conversation_id: activeId,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setIsSending(true);

    // Auto-rename the conversation on the first message
    const conv = conversations.find((c) => c.id === activeId);
    if (conv && conv.title === "New Conversation") {
      const shortTitle = content.length > 40 ? content.slice(0, 40) + "…" : content;
      renameConversation(activeId, shortTitle)
        .then((updated) =>
          setConversations((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          )
        )
        .catch(console.error);
    }

    try {
      const aiMsg = await sendMessage(activeId, content);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(content);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Rename handlers
  function startEditing(conv: Conversation) {
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  }

  async function commitRename(id: number) {
    const title = editingTitle.trim();
    if (!title) return cancelEditing();
    try {
      const updated = await renameConversation(id, title);
      setConversations((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch (err) {
      console.error(err);
    } finally {
      cancelEditing();
    }
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingTitle("");
  }

  // ----- Render guards -----
  if (isLoading) return null;
  if (!isAuthenticated) return null;

  const activeConv = conversations.find((c) => c.id === activeId) ?? null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Background */}
      <div className="bg-mesh" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />

      <Navbar />

      {/* Body — sidebar + chat panel */}
      <div className="relative z-10 flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 3.5rem)" }}>
        {/* ---------------------------------------------------------------- */}
        {/* Sidebar                                                          */}
        {/* ---------------------------------------------------------------- */}
        <aside className="w-64 flex-none flex flex-col border-r border-slate-800/60 bg-[#020817]/80 backdrop-blur-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              Conversations
            </span>
            <button
              onClick={handleNewChat}
              disabled={isCreating}
              aria-label="New conversation"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors disabled:opacity-50"
            >
              {isCreating ? (
                <span className="spinner" style={{ width: 14, height: 14 }} />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          </div>

          {/* List */}
          <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5" aria-label="Conversation list">
            {conversations.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-8 px-4">
                No conversations yet. Start a new chat!
              </p>
            )}
            {conversations.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <div
                  key={conv.id}
                  className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                    isActive
                      ? "bg-blue-500/15 border border-blue-500/25 text-blue-300"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
                  }`}
                  onClick={() => {
                    if (editingId !== conv.id) handleSelectConversation(conv.id);
                  }}
                >
                  {/* Icon */}
                  <svg
                    className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-blue-400" : "text-slate-600 group-hover:text-slate-400"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>

                  {/* Title / inline edit */}
                  {editingId === conv.id ? (
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => commitRename(conv.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(conv.id);
                        if (e.key === "Escape") cancelEditing();
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 min-w-0 bg-slate-900 border border-blue-500/40 rounded px-1.5 py-0.5 text-xs text-slate-100 outline-none"
                    />
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{conv.title}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{formatDate(conv.created_at)}</p>
                    </div>
                  )}

                  {/* Rename button — visible on hover when not editing */}
                  {editingId !== conv.id && (
                    <button
                      aria-label="Rename conversation"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(conv);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-slate-500 hover:text-slate-300"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* ---------------------------------------------------------------- */}
        {/* Chat main area                                                   */}
        {/* ---------------------------------------------------------------- */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeId === null ? (
            <EmptyState onNew={handleNewChat} />
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-800/60 bg-[#020817]/60 backdrop-blur-sm shrink-0">
                <div className="ai-dot" />
                <h1 className="text-sm font-semibold text-slate-200 truncate">
                  {activeConv?.title ?? "Chat"}
                </h1>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-10 h-10">
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 animate-spin" />
                      </div>
                      <p className="text-xs text-slate-500">Loading messages…</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm text-slate-600">Type a message to begin.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))
                )}

                {/* Typing indicator */}
                {isSending && <TypingIndicator />}

                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="shrink-0 px-6 py-4 border-t border-slate-800/60 bg-[#020817]/60 backdrop-blur-sm">
                <div className="flex items-end gap-3 glass-input rounded-2xl px-4 py-3">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
                    rows={1}
                    disabled={isSending}
                    aria-label="Message input"
                    className="flex-1 resize-none bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none leading-relaxed max-h-40 overflow-y-auto disabled:opacity-50"
                    style={{ minHeight: "1.5rem" }}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = "auto";
                      el.style.height = Math.min(el.scrollHeight, 160) + "px";
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isSending}
                    aria-label="Send message"
                    className="btn-glow w-9 h-9 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40"
                  >
                    {isSending ? (
                      <span className="spinner" style={{ width: 16, height: 16 }} />
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-700 text-center mt-2">
                  KelanaAI can make mistakes. Double-check important travel details.
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

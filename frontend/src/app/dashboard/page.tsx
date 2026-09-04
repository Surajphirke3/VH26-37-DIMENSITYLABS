"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getMachines, createConversation } from "@/lib/api";
import type { Machine } from "@/lib/types";
import MachineSelector from "@/components/chat/MachineSelector";
import ChatInterface from "@/components/chat/ChatInterface";
import Spinner from "@/components/ui/Spinner";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useTheme } from "@/lib/theme-context";

interface ConvEntry { id: string; label: string; }

export default function DashboardPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [conversations, setConversations] = useState<ConvEntry[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { if (!authLoading && !user) router.replace("/login"); }, [user, authLoading, router]);
  useEffect(() => { if (user) getMachines().then(setMachines).catch(console.error); }, [user]);

  const startNewConversation = async (): Promise<string | null> => {
    try {
      const conv = await createConversation();
      const label = `Session ${conversations.length + 1}`;
      setConversations((prev) => [...prev, { id: conv.conversation_id, label }]);
      setActiveConvId(conv.conversation_id);
      return conv.conversation_id;
    } catch (err) { console.error("Failed to create conversation", err); return null; }
  };

  const handleFirstMessage = (query: string) => {
    if (!activeConvId) return;
    const short = query.length > 40 ? query.slice(0, 40) + "…" : query;
    setConversations((prev) => prev.map((c) => (c.id === activeConvId ? { ...c, label: short } : c)));
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-[var(--text-muted)]">Authenticating…</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200">
      {/* ── Sidebar ── */}
      <aside
        className="shrink-0 flex flex-col transition-all duration-300 border-r border-[var(--border)]"
        style={{
          width: sidebarOpen ? "256px" : "0px",
          background: "var(--bg-surface)",
          backdropFilter: "blur(20px)",
          overflow: "hidden",
        }}
      >
        <div style={{ minWidth: "256px" }}>
          {/* Logo */}
          <div
            className="px-4 py-4 flex items-center gap-3 border-b border-[var(--border)]"
          >
            <div className="relative shrink-0">
              <div
                className="absolute inset-0 rounded-lg opacity-60"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  filter: "blur(8px)",
                }}
              />
              <img
                src={theme === "light" ? "/mend-x.png" : "/mend-x-dark.png"}
                alt="MEND - X"
                className="relative w-8 h-8 rounded-lg object-contain"
              />
            </div>
            <div className="min-w-0">
              <span
                className="font-black text-sm tracking-tight block"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                MEND - X
              </span>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                From Failure to Function
              </span>
            </div>
          </div>

          {/* Machine Selector */}
          <div className="px-3 py-3 border-b border-[var(--border)]">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-1 text-slate-500 dark:text-[#334155]">
              Machine Filter
            </p>
            <MachineSelector machines={machines} selected={selectedMachine} onChange={setSelectedMachine} />
          </div>

          {/* Sessions */}
          <div className="flex-1 px-3 py-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#334155]">
                Sessions
              </p>
              <button
                id="new-session-btn"
                onClick={startNewConversation}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-semibold transition-all hover:scale-105 bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-[#a5b4fc]"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                New
              </button>
            </div>

            <div className="space-y-1">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all duration-200 truncate flex items-center gap-2 group ${
                    activeConvId === c.id
                      ? "sidebar-item-active font-semibold shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="mt-auto px-4 py-3 border-t border-[var(--border)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {(user?.full_name ?? user?.email ?? "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate text-slate-800 dark:text-[#e2e8f0]">
                {user?.full_name ?? user?.email}
              </p>
              <p className="text-[10px] capitalize text-slate-500 dark:text-[#475569]">
                {user?.role}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {user?.role === "admin" && (
              <button
                onClick={() => router.push("/admin")}
                className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all"
                title="Admin Panel"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              title="Sign Out"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-base)]">
        {/* Top Bar */}
        <header
          className="flex items-center gap-3 px-4 py-3 shrink-0 border-b border-[var(--border)] transition-colors"
          style={{
            background: "var(--bg-surface)",
            backdropFilter: "blur(20px)",
          }}
        >
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 rounded-lg transition-all hover:scale-110 text-slate-600 dark:text-[#475569] bg-slate-100 dark:bg-white/[0.04]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-slate-900 dark:text-[#e2e8f0]">
              Troubleshooting Assistant
            </h1>
            {selectedMachine ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="status-dot-online" style={{ width: "5px", height: "5px" }} />
                <p className="text-xs text-emerald-600 dark:text-[#10b981]">
                  {selectedMachine.name}
                  {selectedMachine.model ? ` · ${selectedMachine.model}` : ""}
                </p>
              </div>
            ) : (
              <p className="text-xs mt-0.5 text-slate-500 dark:text-[#334155]">
                No machine filter — searching all indexed manuals
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
            >
              <div className="status-dot-online" style={{ width: "6px", height: "6px" }} />
              <span className="text-xs font-medium text-emerald-600 dark:text-[#6ee7b7]">
                AI Online
              </span>
            </div>
          </div>
        </header>

        {/* Chat / Welcome */}
        {activeConvId === null ? (
          <div
            className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden bg-[var(--bg-base)]"
          >
            {/* BG Glow */}
            <div
              className="absolute w-[500px] h-[500px] rounded-full pointer-events-none opacity-40 dark:opacity-100"
              style={{
                background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />

            <div className="relative max-w-lg text-center animate-slide-up">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-3xl opacity-50"
                    style={{
                      background: "radial-gradient(circle, rgba(99,102,241,0.6), transparent 70%)",
                      filter: "blur(20px)",
                      transform: "scale(1.3)",
                    }}
                  />
                  <img
                    src="/mend-x.png"
                    alt="MEND - X"
                    className="relative w-24 h-24 object-contain rounded-3xl animate-float"
                    style={{ animationDuration: "4s" }}
                  />
                </div>
              </div>

              <h2
                className="text-4xl font-black tracking-tight mb-1"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                MEND - X
              </h2>
              <p className="text-sm font-semibold mb-4 text-emerald-600 dark:text-[#10b981]">
                From Failure to Function
              </p>
              <p className="text-sm leading-relaxed mb-8 text-slate-600 dark:text-[#94a3b8]">
                Industrial RAG Troubleshooting System. Select a machine or ask about any alarm code, symptom, or repair procedure — backed by indexed technical manuals.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {["Error Code Lookup", "Step-by-step Repair", "Manual Citations", "Multi-machine RAG"].map((f) => (
                  <span
                    key={f}
                    className="text-xs px-3 py-1.5 rounded-full font-medium bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-[#a5b4fc]"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <button
                id="start-session-btn"
                onClick={startNewConversation}
                className="px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 0 32px rgba(99,102,241,0.4)",
                }}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Troubleshooting Session
                </span>
              </button>
            </div>
          </div>
        ) : (
          <ChatInterface
            conversationId={activeConvId}
            machineId={selectedMachine?.id ?? null}
            onMachineSelect={(id) => {
              const m = machines.find((x) => x.id === id);
              if (m) setSelectedMachine(m);
            }}
            onFirstMessage={handleFirstMessage}
          />
        )}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  UploadCloud,
  Search,
  Cpu,
  Activity,
  Sliders,
  BookOpen,
  Settings,
} from "lucide-react";
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
        <p className="text-sm text-[var(--text-muted)] tracking-widest uppercase">Authenticating...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200">
      {/* ── Sidebar ── */}
      <aside
        className="shrink-0 flex flex-col transition-all duration-300 border-r border-[var(--border)] relative z-20"
        style={{
          width: sidebarOpen ? "280px" : "0px",
          background: "var(--bg-surface)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div style={{ width: "280px", opacity: sidebarOpen ? 1 : 0 }} className="flex flex-col h-full transition-opacity duration-300">
          {/* Logo & Console Indicator */}
          <div className="px-5 py-5 flex items-center justify-between border-b border-[var(--border)]">
            <Link href="/dashboard" className="flex items-center gap-3 group" title="MEND-X Diagnostics Console">
              <div className="relative shrink-0">
                <img
                  src={theme === "light" ? "/brand-icon-light.png" : "/brand-icon-dark.png"}
                  alt="MEND-X"
                  className="w-8 h-8 rounded-lg object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-[var(--text-primary)]">MEND-X</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase">
                    CONSOLE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </span>
              </div>
            </Link>
            <Link
              href="/"
              className="text-[10px] font-mono text-slate-400 hover:text-indigo-500 transition-colors px-1.5 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.05]"
              title="Return to Public Website"
            >
              Portal ↗
            </Link>
          </div>

          {/* Machine Selector */}
          <div className="px-4 py-4 border-b border-[var(--border)]">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5 px-2 text-slate-500 dark:text-slate-500">
              Machine Filter
            </p>
            <MachineSelector machines={machines} selected={selectedMachine} onChange={setSelectedMachine} />
          </div>

          {/* Platform Navigation */}
          <div className="px-3 py-3 border-b border-[var(--border)]">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-1 text-slate-500 dark:text-[#334155]">
              Platform Hub
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <Link
                href="/documents"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">Manuals</span>
              </Link>
              <Link
                href="/upload"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">Upload</span>
              </Link>
              <Link
                href="/search"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Search</span>
              </Link>
              <Link
                href="/models"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Cpu className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="truncate">Models</span>
              </Link>
              <Link
                href="/status"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Activity className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate">Status</span>
              </Link>
              <Link
                href="/help"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span className="truncate">Handbook</span>
              </Link>
            </div>
          </div>

          {/* Sessions */}
          <div className="flex-1 px-4 py-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3 px-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">
                Active Sessions
              </p>
              <button
                onClick={startNewConversation}
                className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all hover:scale-105 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500"
              >
                + New
              </button>
            </div>

            <div className="space-y-1.5">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 truncate flex items-center gap-3 group ${
                    activeConvId === c.id
                      ? "bg-indigo-500/10 text-indigo-500 font-semibold border border-indigo-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${activeConvId === c.id ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"}`} />
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Footer */}
          <div className="mt-auto px-6 py-4 border-t border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 border border-white/10 flex items-center justify-center text-white font-bold text-xs">
                {(user?.full_name ?? user?.email ?? "U")[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold truncate text-[var(--text-primary)]">{user?.full_name ?? user?.email}</p>
                <p className="text-[10px] uppercase text-slate-500">{user?.role}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/settings"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all"
              title="System Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
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
      <main className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-base)] relative">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none z-0" />

        {/* Top Bar */}
        <header
          className="flex items-center gap-4 px-6 py-4 shrink-0 border-b border-[var(--border)] backdrop-blur-md relative z-10"
          style={{ background: "var(--bg-surface)" }}
        >
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M4 6h16M4 12h16M4 18h16" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          <div className="flex-1">
            <h1 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">Troubleshooting Console</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                {selectedMachine ? `${selectedMachine.name} · ${selectedMachine.model}` : "SYSTEM READY"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              AI Online
            </div>
          </div>
        </header>

        {/* Chat Area */}
        {activeConvId === null ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-transparent relative z-10 animate-slide-up">
            <div className="max-w-md text-center">
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full" />
                <img src={theme === "light" ? "/logo-solid.png" : "/logo-dark.png"} alt="MEND-X Logo" className="relative w-24 h-24 mx-auto object-contain animate-float" />
              </div>
              <h2 className="text-2xl font-black mb-2 text-[var(--text-primary)] tracking-tight">Ready to Troubleshoot?</h2>
              <p className="text-sm text-[var(--text-muted)] mb-8 leading-relaxed">Select a machine or start a new session to begin diagnosing industrial issues using AI-powered tech manuals.</p>
              <button
                onClick={startNewConversation}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Start Session
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden relative z-10">
            <ChatInterface
              conversationId={activeConvId}
              machineId={selectedMachine?.id ?? null}
              onMachineSelect={(id) => {
                const m = machines.find((x) => x.id === id);
                if (m) setSelectedMachine(m);
              }}
              onFirstMessage={handleFirstMessage}
            />
          </div>
        )}
      </main>
    </div>
  );
}

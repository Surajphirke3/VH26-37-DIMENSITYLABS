"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Layers,
  Wrench,
  ChevronRight,
  Plus,
  AlertTriangle,
  Zap,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getMachines, createConversation } from "@/lib/api";
import type { Machine } from "@/lib/types";
import MachineSelector from "@/components/chat/MachineSelector";
import ChatInterface from "@/components/chat/ChatInterface";
import Spinner from "@/components/ui/Spinner";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useTheme } from "@/lib/theme-context";

interface ConvEntry {
  id: string;
  label: string;
}

const COMMON_FAULT_PROBES = [
  {
    title: "Spindle Overheat & Thermal Drift",
    machine: "HAAS VF-4 CNC",
    code: "Alarm 102",
    tag: "Thermal",
  },
  {
    title: "PROFINET Bus Communication Timeout",
    machine: "SIEMENS S7-1500",
    code: "Event 0x80",
    tag: "Bus Fault",
  },
  {
    title: "Axis 3 Resolver Feedback Drift",
    machine: "KUKA KR210 Arm",
    code: "KRC4 1024",
    tag: "Kinematics",
  },
  {
    title: "Pulse Coder Voltage Failure",
    machine: "FANUC M20iA",
    code: "SRVO-062",
    tag: "Encoders",
  },
];

export default function DashboardPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const router = useRouter();

  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [conversations, setConversations] = useState<ConvEntry[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      getMachines().then(setMachines).catch(console.error);
    }
  }, [user]);

  const startNewConversation = async (machine?: Machine): Promise<string | null> => {
    try {
      if (machine) setSelectedMachine(machine);
      const conv = await createConversation();
      const label = machine
        ? `${machine.name} Session`
        : `Session ${conversations.length + 1}`;
      setConversations((prev) => [...prev, { id: conv.conversation_id, label }]);
      setActiveConvId(conv.conversation_id);
      return conv.conversation_id;
    } catch (err) {
      console.error("Failed to create conversation", err);
      return null;
    }
  };

  const handleFirstMessage = (query: string) => {
    if (!activeConvId) return;
    const short = query.length > 40 ? query.slice(0, 40) + "…" : query;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvId ? { ...c, label: short } : c))
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-[var(--text-muted)] tracking-widest uppercase">
            Authenticating Console...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200">
      {/* ── SIDEBAR ── */}
      <aside
        className="shrink-0 flex flex-col transition-all duration-300 border-r border-[var(--border)] relative z-20 select-none"
        style={{
          width: sidebarOpen ? "280px" : "0px",
          background: "var(--bg-surface)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{ width: "280px", opacity: sidebarOpen ? 1 : 0 }}
          className="flex flex-col h-full transition-opacity duration-300"
        >
          {/* Logo & Console Indicator */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--border)]">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group"
              title="MEND-X Diagnostics Console"
            >
              <div className="relative shrink-0">
                <Image
                  src={isLight ? "/brand-icon-light.png" : "/brand-icon-dark.png"}
                  alt="MEND-X"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-[var(--text-primary)]">
                    MEND<span className="text-teal-600 dark:text-teal-400">-X</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase">
                    CONSOLE
                  </span>
                </div>
                <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  SYSTEM ONLINE
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
          <div className="px-4 py-3.5 border-b border-[var(--border)]">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2 px-1 text-slate-400 dark:text-slate-500">
              Active Machine Filter
            </p>
            <MachineSelector
              machines={machines}
              selected={selectedMachine}
              onChange={setSelectedMachine}
            />
          </div>

          {/* Platform Navigation */}
          <div className="px-3 py-3 border-b border-[var(--border)]">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2 px-2 text-slate-400 dark:text-slate-500">
              Console Operations
            </p>
            <div className="space-y-0.5 text-xs">
              <Link
                href="/documents"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Technical Manuals</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">PDFs</span>
              </Link>
              <Link
                href="/upload"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Upload Engine</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">RAG</span>
              </Link>
              <Link
                href="/search"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Deep Vector Search</span>
                </div>
              </Link>
              <Link
                href="/status"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Infrastructure Status</span>
                </div>
              </Link>
              <Link
                href="/settings"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>System Settings</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Active Troubleshooting Sessions */}
          <div className="flex-1 px-3 py-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-2 px-2">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Diagnostic Sessions
              </p>
              <button
                onClick={() => startNewConversation(selectedMachine ?? undefined)}
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg font-bold bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400 transition-all cursor-pointer"
                title="Start a new diagnostic session"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>

            <div className="space-y-1">
              {conversations.length === 0 ? (
                <div className="px-3 py-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
                  No active sessions. Click &apos;+ New&apos; or pick a quick start below.
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all duration-200 truncate flex items-center justify-between group ${
                      activeConvId === c.id
                        ? "bg-indigo-600 text-white font-bold shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          activeConvId === c.id ? "bg-white" : "bg-emerald-500"
                        }`}
                      />
                      <span className="truncate">{c.label}</span>
                    </div>
                    <ChevronRight
                      className={`w-3 h-3 shrink-0 ${
                        activeConvId === c.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* User Footer */}
          <div className="mt-auto px-4 py-3 border-t border-[var(--border)] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {(user?.full_name ?? user?.email ?? "T")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate text-[var(--text-primary)]">
                  {user?.full_name ?? user?.email?.split("@")[0] ?? "Technician"}
                </p>
                <p className="text-[10px] font-mono uppercase text-slate-400 truncate">
                  {user?.role ?? "Operator"}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-base)] relative">
        <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none z-0" />

        {/* Top Control Bar */}
        <header
          className="flex items-center justify-between px-6 py-3.5 shrink-0 border-b border-[var(--border)] backdrop-blur-md relative z-10 bg-[var(--bg-surface)]/80"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors text-slate-500 hover:text-[var(--text-primary)]"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                  Diagnostics Control Workspace
                </h1>
                {selectedMachine && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {selectedMachine.name}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {selectedMachine
                  ? `TARGET: ${selectedMachine.model} · GROUNDED`
                  : "READY · NO CONVERSATION ACTIVE"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>CANopen / Modbus TCP Connected</span>
            </div>

            <ThemeToggle />
          </div>
        </header>

        {/* ── WORKSPACE CONTENT ── */}
        {activeConvId === null ? (
          <div className="flex-1 overflow-y-auto p-6 lg:p-10 relative z-10 flex flex-col items-center justify-center">
            <div className="max-w-4xl w-full mx-auto space-y-8 animate-slide-up">
              
              {/* Center Hero Banner */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white dark:bg-white/[0.05] border border-slate-200/90 dark:border-white/10 shadow-lg mb-1">
                  <Image
                    src={isLight ? "/brand-icon-light.png" : "/brand-icon-dark.png"}
                    alt="MEND-X Industrial Core"
                    width={52}
                    height={52}
                    className="w-12 h-12 object-contain"
                    priority
                  />
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                    MEND-X Diagnostic Operations Center
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
                    AI-assisted troubleshooting engine directly grounded on verified OEM documentation, electrical schematics, and live machine telemetry.
                  </p>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => startNewConversation(selectedMachine ?? undefined)}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 via-indigo-600 to-indigo-700 hover:from-teal-500 hover:via-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Launch New Diagnostic Session</span>
                    <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/20">
                      Enter ↵
                    </span>
                  </button>
                </div>
              </div>

              {/* Connected Machine Quick-Select Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Target Equipment Quick-Select
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Click any machine to diagnose
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {machines.slice(0, 4).map((m) => {
                    const isCurrent = selectedMachine?.id === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedMachine(m);
                          startNewConversation(m);
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 group cursor-pointer ${
                          isCurrent
                            ? "bg-indigo-50/90 dark:bg-indigo-500/10 border-indigo-500 shadow-md"
                            : "bg-white/80 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300">
                            {m.manufacturer || "OEM"}
                          </span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {m.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                          {m.model}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Common Diagnostic Queries / Fault Trees */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Common Industrial Fault Inquiries
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COMMON_FAULT_PROBES.map((probe, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const matched = machines.find((m) =>
                          probe.machine.toLowerCase().includes(m.name.toLowerCase())
                        );
                        startNewConversation(matched ?? undefined);
                      }}
                      className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] hover:border-amber-400 dark:hover:border-amber-500/40 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            {probe.code}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {probe.machine}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {probe.title}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Pipeline Telemetry Strip */}
              <div className="pt-2 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Vector Index</div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>pgvector Online</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Edge Routing</div>
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>NORD &lt;100ms</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Procedural Synthesis</div>
                  <div className="text-xs font-bold text-teal-600 dark:text-cyan-400 mt-0.5">
                    FORGE Active
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Hallucination Gate</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>100% Deterministic</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden relative z-10">
            <ChatInterface
              conversationId={activeConvId}
              machineId={selectedMachine?.id ?? null}
              onMachineSelect={(id) => {
                const found = machines.find((m) => m.id === id);
                if (found) setSelectedMachine(found);
              }}
              onFirstMessage={handleFirstMessage}
            />
          </div>
        )}
      </main>
    </div>
  );
}

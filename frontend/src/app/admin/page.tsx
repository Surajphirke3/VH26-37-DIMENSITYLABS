"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getManuals, getMachines, deactivateMachine, getUsers } from "@/lib/api";
import type { Manual, Machine, User } from "@/lib/types";
import ManualList from "@/components/admin/ManualList";
import MachineForm from "@/components/admin/MachineForm";
import Spinner from "@/components/ui/Spinner";
import { Users, Shield, Wrench, Briefcase, ExternalLink, ArrowRight, UserPlus, CheckCircle2 } from "lucide-react";

type Tab = "manuals" | "machines" | "users";

const TAB_META = {
  manuals: {
    label: "Technical Manuals",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  machines: {
    label: "Equipment Fleet",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
  },
  users: {
    label: "Team & Operators",
    icon: <Users className="w-4 h-4" />,
  },
};

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("manuals");
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deactivating, setDeactivating] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  const loadData = useCallback(async () => {
    setFetching(true);
    try {
      const [m, mac, u] = await Promise.all([
        getManuals(),
        getMachines(),
        getUsers().catch(() => []),
      ]);
      setManuals(m);
      setMachines(mac);
      setUsers(u);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") loadData();
  }, [user, loadData]);

  const handleDeactivate = async (machineId: string) => {
    setDeactivating(machineId);
    try {
      await deactivateMachine(machineId);
      setMachines((prev) => prev.filter((m) => m.id !== machineId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeactivating(null);
    }
  };

  if (isLoading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm font-mono text-slate-400">Loading admin operations console…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between border-b border-[var(--border)] bg-slate-900/90 dark:bg-black/80 backdrop-blur-xl"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:scale-105 transition-all cursor-pointer"
            title="Return to Technician Workspace"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-lg opacity-50 bg-gradient-to-tr from-indigo-500 to-cyan-400 blur-sm"
              />
              <img src="/mend-x.png" alt="MEND - X" className="relative w-8 h-8 rounded-lg object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white">
                  MEND-X Administrative Console
                </h1>
                <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ADMIN SIDE
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                Knowledge Ingestion · Fleet Configuration · User Provisioning
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick toggle to User / Field Operator Side */}
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          >
            <span>User / Field Side</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            id="upload-manual-btn"
            onClick={() => router.push("/admin/manuals/upload")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs text-white transition-all hover:scale-105 bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/25 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Upload Manual</span>
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-in">
          {[
            {
              label: "Technical Manuals",
              value: manuals.length,
              sub: "Grounding Knowledge Base",
              color: "#6366f1",
              icon: "📄",
            },
            {
              label: "Registered Equipment",
              value: machines.length,
              sub: "Active Fleet Assets",
              color: "#10b981",
              icon: "⚙️",
            },
            {
              label: "Registered Users",
              value: users.length || 3,
              sub: "Admin, Managers, Technicians",
              color: "#38bdf8",
              icon: "👥",
            },
          ].map(({ label, value, sub, color, icon }) => (
            <div
              key={label}
              className="p-5 rounded-2xl bg-slate-900/80 border border-white/[0.08] shadow-sm backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="text-3xl font-black mt-1" style={{ color }}>{value}</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">{sub}</p>
                </div>
                <span className="text-2xl p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">{icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Management Suite & Customization Suite */}
        <div className="mb-8 p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/20 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Admin Ingestion &amp; System Customization Suite
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold">
              Full Administrator Authority
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <Link
              href="/upload"
              className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-blue-500/40 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="font-bold text-slate-200 group-hover:text-blue-400 block">Upload Engine</span>
                <span className="text-[10px] text-slate-500">PDF RAG Ingestion</span>
              </div>
              <span className="text-blue-400 text-sm group-hover:translate-x-0.5 transition-transform">↗</span>
            </Link>

            <Link
              href="/search"
              className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-emerald-500/40 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="font-bold text-slate-200 group-hover:text-emerald-400 block">Vector Search</span>
                <span className="text-[10px] text-slate-500">Inspect Embeddings</span>
              </div>
              <span className="text-emerald-400 text-sm group-hover:translate-x-0.5 transition-transform">↗</span>
            </Link>

            <Link
              href="/settings"
              className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-indigo-500/40 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="font-bold text-slate-200 group-hover:text-indigo-400 block">System Settings</span>
                <span className="text-[10px] text-slate-500">AI Models &amp; Routing</span>
              </div>
              <span className="text-indigo-400 text-sm group-hover:translate-x-0.5 transition-transform">↗</span>
            </Link>

            <Link
              href="/status"
              className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-rose-500/40 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="font-bold text-slate-200 group-hover:text-rose-400 block">System Status</span>
                <span className="text-[10px] text-slate-500">Health &amp; Telemetry</span>
              </div>
              <span className="text-rose-400 text-sm group-hover:translate-x-0.5 transition-transform">↗</span>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["manuals", "machines", "users"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                tab === t
                  ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
                  : "bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200"
              }`}
            >
              {TAB_META[t].icon}
              <span>{TAB_META[t].label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                  tab === t ? "bg-indigo-500/30 text-white" : "bg-white/[0.06] text-slate-500"
                }`}
              >
                {t === "manuals" ? manuals.length : t === "machines" ? machines.length : (users.length || 3)}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="rounded-2xl p-6 bg-slate-900/80 border border-white/[0.08] shadow-xl backdrop-blur-md">
          {tab === "manuals" && <ManualList manuals={manuals} onRefresh={loadData} />}

          {tab === "machines" && (
            <div className="space-y-6">
              <MachineForm onCreated={loadData} />

              {machines.length === 0 ? (
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3 bg-white/[0.04] border border-white/[0.07]">
                    <span className="text-xl">⚙️</span>
                  </div>
                  <p className="text-sm text-slate-400">No machines registered yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {machines.map((m, i) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-4 rounded-xl transition-all animate-fade-in bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 bg-indigo-500/10 border border-indigo-500/20">
                          ⚙️
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{m.name}</p>
                          <p className="text-xs text-slate-400">
                            {[m.manufacturer, m.model].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {m.category && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                            {m.category}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeactivate(m.id)}
                          disabled={deactivating === m.id}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                        >
                          {deactivating === m.id ? "…" : "Deactivate"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-white/[0.08]">
                <div>
                  <h3 className="text-base font-bold text-white">Registered Team & Operator Roster</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage role permissions across Administrators, Operations Managers, and Field Technicians.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg font-mono text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                    {users.length || 3} Active Accounts
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {(users.length > 0 ? users : [
                  { id: "1", full_name: "Admin User", email: "admin@mechmind.io", role: "admin" as const, is_active: true },
                  { id: "2", full_name: "Tech User", email: "tech@mechmind.io", role: "technician" as const, is_active: true },
                  { id: "3", full_name: "Manager User", email: "manager@mechmind.io", role: "manager" as const, is_active: true },
                ]).map((u) => {
                  const isCurrentUser = user?.email === u.email;
                  return (
                    <div
                      key={u.id}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-center justify-between flex-wrap gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-md ${
                            u.role === "admin"
                              ? "bg-gradient-to-tr from-indigo-600 to-violet-600"
                              : u.role === "manager"
                              ? "bg-gradient-to-tr from-cyan-600 to-blue-600"
                              : "bg-gradient-to-tr from-emerald-600 to-teal-600"
                          }`}
                        >
                          {(u.full_name || u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {u.full_name || "Enterprise User"}
                            </span>
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                Current Session
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono text-slate-400">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border flex items-center gap-1.5 ${
                            u.role === "admin"
                              ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                              : u.role === "manager"
                              ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                              : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          {u.role === "admin" && <Shield className="w-3 h-3" />}
                          {u.role === "manager" && <Briefcase className="w-3 h-3" />}
                          {u.role === "technician" && <Wrench className="w-3 h-3" />}
                          <span className="uppercase">{u.role}</span>
                        </span>

                        <span className="flex items-center gap-1 font-mono text-xs text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Role Matrix Helper */}
              <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/[0.06] font-mono text-xs space-y-2 text-slate-400">
                <div className="text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  Role Permissions Matrix:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-2 rounded-lg bg-white/[0.02]">
                    <span className="text-indigo-400 font-bold block mb-1">🛡️ ADMINISTRATOR</span>
                    <span>Full platform control: manual uploads, machine registry, LLM models, and team provisioning.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02]">
                    <span className="text-cyan-400 font-bold block mb-1">💼 OPERATIONS MANAGER</span>
                    <span>Fleet telemetry tracking, downtime reporting, cross-machine disambiguation oversight.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02]">
                    <span className="text-emerald-400 font-bold block mb-1">🔧 FIELD TECHNICIAN</span>
                    <span>Mobile camera OCR inspection, error code troubleshooting, grounded step-by-step resolution.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

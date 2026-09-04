"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getManuals, getMachines, deactivateMachine } from "@/lib/api";
import type { Manual, Machine } from "@/lib/types";
import ManualList from "@/components/admin/ManualList";
import MachineForm from "@/components/admin/MachineForm";
import Spinner from "@/components/ui/Spinner";

type Tab = "manuals" | "machines";

const TAB_META = {
  manuals: {
    label: "Manuals",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  machines: {
    label: "Machines",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
  },
};

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("manuals");
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
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
      const [m, mac] = await Promise.all([getManuals(), getMachines()]);
      setManuals(m);
      setMachines(mac);
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#08090c" }}>
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm" style={{ color: "#475569" }}>Loading admin panel…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#08090c" }}>
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(15,17,23,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-xl transition-all hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#475569",
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-lg opacity-50"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", filter: "blur(8px)" }}
              />
              <img src="/mend-x.png" alt="MEND - X" className="relative w-8 h-8 rounded-lg object-contain" />
            </div>
            <div>
              <h1
                className="text-base font-black tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #a5b4fc, #c4b5fd)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Admin Panel
              </h1>
              <p className="text-[10px] font-medium" style={{ color: "#475569" }}>
                MEND - X Knowledge Management
              </p>
            </div>
          </div>
        </div>

        <button
          id="upload-manual-btn"
          onClick={() => router.push("/admin/manuals/upload")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 0 20px rgba(99,102,241,0.3)",
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload Manual
        </button>
      </header>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-in">
          {[
            { label: "Total Manuals", value: manuals.length, color: "#6366f1", icon: "📄" },
            { label: "Registered Machines", value: machines.length, color: "#10b981", icon: "⚙️" },
          ].map(({ label, value, color, icon }) => (
            <div
              key={label}
              className="p-4 rounded-2xl"
              style={{
                background: "rgba(15,17,23,0.8)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: "#475569" }}>{label}</p>
                  <p className="text-3xl font-black mt-1" style={{ color }}>{value}</p>
                </div>
                <span className="text-2xl">{icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["manuals", "machines"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={
                tab === t
                  ? {
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      color: "#a5b4fc",
                      boxShadow: "0 0 12px rgba(99,102,241,0.1)",
                    }
                  : {
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "#475569",
                    }
              }
            >
              {TAB_META[t].icon}
              {TAB_META[t].label}
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={
                  tab === t
                    ? { background: "rgba(99,102,241,0.2)", color: "#818cf8" }
                    : { background: "rgba(255,255,255,0.05)", color: "#334155" }
                }
              >
                {t === "manuals" ? manuals.length : machines.length}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          className="rounded-2xl p-6 animate-fade-in"
          style={{
            background: "rgba(15,17,23,0.8)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {tab === "manuals" && <ManualList manuals={manuals} onRefresh={loadData} />}

          {tab === "machines" && (
            <div className="space-y-6">
              <MachineForm onCreated={loadData} />

              {machines.length === 0 ? (
                <div className="text-center py-10">
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <span className="text-xl">⚙️</span>
                  </div>
                  <p className="text-sm" style={{ color: "#334155" }}>No machines registered yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {machines.map((m, i) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-4 rounded-xl transition-all animate-fade-in"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        animationDelay: `${i * 0.05}s`,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0"
                          style={{
                            background: "rgba(99,102,241,0.1)",
                            border: "1px solid rgba(99,102,241,0.2)",
                          }}
                        >
                          ⚙️
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>{m.name}</p>
                          <p className="text-xs" style={{ color: "#475569" }}>
                            {[m.manufacturer, m.model].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {m.category && (
                          <span
                            className="text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{
                              background: "rgba(99,102,241,0.1)",
                              border: "1px solid rgba(99,102,241,0.2)",
                              color: "#818cf8",
                            }}
                          >
                            {m.category}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeactivate(m.id)}
                          disabled={deactivating === m.id}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: deactivating === m.id ? "#475569" : "#f87171",
                          }}
                          onMouseEnter={(e) => {
                            if (deactivating !== m.id) {
                              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
                          }}
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
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LandingLayout from "@/components/landing/LandingLayout";
import { useTheme } from "@/lib/theme-context";

const MARQUEE_ITEMS = [
  "HAAS VF-4 CNC",
  "SIEMENS S7-1500",
  "KUKA KR210",
  "FANUC M20iA",
  "ABB IRB 6700",
  "MITSUBISHI MELSEC",
  "ALLEN-BRADLEY PLC",
  "BOSCH REXROTH",
  "YASKAWA MP3300",
  "BECKHOFF CX5130",
];

const STATS = [
  { value: "$260K", label: "Average downtime cost per hour in heavy industry" },
  { value: "4.5h", label: "Average time to locate correct manual procedure" },
  { value: "42%", label: "Breakdowns caused by absent or wrong documentation" },
  { value: "<8s", label: "MEND-X time to full verified repair protocol" },
];

const MODEL_TIERS = [
  {
    name: "NORD",
    tier: "01 — LOW TIER",
    color: "#3b82f6",
    colorBg: "rgba(59,130,246,0.08)",
    colorBorder: "rgba(59,130,246,0.25)",
    desc: "Lightweight edge model for rapid-fire queries: error code lookups, symptom triage, and binary yes/no diagnostics. Optimized for PLCs and offline line controllers.",
    specs: ["Groq / Llama 3.1 8B", "Sub-100ms latency", "Edge device friendly", "Error code matching"],
    logoDark: "/nord-dark.png",
    logoLight: "/nord-light.png",
  },
  {
    name: "FORGE",
    tier: "02 — MID TIER",
    color: "#f59e0b",
    colorBg: "rgba(245,158,11,0.08)",
    colorBorder: "rgba(245,158,11,0.25)",
    desc: "The production workhorse. Handles multi-step repair procedures, component cross-references, and mid-complexity fault trees for mid-level maintenance engineers.",
    specs: ["Gemini 2.0 Flash", "1–3s latency", "Multi-step procedures", "Component cross-reference"],
    logoDark: "/forge-dark.png",
    logoLight: "/forge-light.png",
  },
  {
    name: "APEX",
    tier: "03 — HIGH TIER",
    color: "#8b5cf6",
    colorBg: "rgba(139,92,246,0.08)",
    colorBorder: "rgba(139,92,246,0.25)",
    desc: "Maximum reasoning tier for critical failures, root cause analysis, and safety-critical systems. Deployed for aerospace, automotive, and high-voltage environments.",
    specs: ["Claude Sonnet 3.5", "3–8s latency", "Root cause analysis", "Safety-critical systems"],
    logoDark: "/apex-dark.png",
    logoLight: "/apex-light.png",
  }
];

export default function HomePage() {
  const { theme } = useTheme();

  return (
    <LandingLayout>
      {/* ─── Ambient Glow Grid Background ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-grid">
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full orb opacity-20" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full orb opacity-15" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", animationDelay: "-5s" }} />
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full orb opacity-10" style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)", animationDelay: "-2s" }} />
      </div>

      {/* ─── HERO SECTION ─── */}
      <section className="relative z-10 pt-40 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Dynamic Status Pill */}
        <div className="inline-flex items-center gap-3 mb-10 px-4 py-2 rounded-full glass border border-[var(--border)] animate-slide-up shadow-sm" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
            <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">System Operational</span>
          </div>
          <span className="w-px h-4 bg-[var(--border)]" />
          <span className="font-mono text-[10px] font-bold text-slate-500 tracking-widest uppercase">MEND-X Core v1.2.1</span>
        </div>

        {/* Hero Headline with Cyber Glitch Accent - Removing standard text gradient for CSS animated ones */}
        <div className="relative mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h1 className="font-black text-[clamp(3.5rem,8vw,7rem)] leading-[1] tracking-tighter uppercase text-[var(--text-primary)]">
            From <span className="opacity-90">Failure</span>
            <br />
            To <span className="gradient-text-emerald font-black" style={{ filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.3))' }}>Function.</span>
          </h1>
        </div>

        <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl leading-relaxed mb-12 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          Factory lines halt. Alarms trigger. Technicians scramble through 800-page PDFs.
          <span className="text-[var(--text-primary)] font-semibold mx-1">MEND-X eliminates the blind spot.</span>
          A zero-hallucination industrial RAG engine that transforms OEM manuals into precise, cited repair protocols.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <Link
            href="/dashboard"
            className="group relative w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_auto] group-hover:bg-[position:100%_center] transition-all duration-500" />
            <svg className="relative w-4 h-4 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="relative z-10">Launch Troubleshooting Console</span>
          </Link>
          <Link
            href="/problem"
            className="group w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-sm text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--glass-bg-hover)] border border-[var(--border)] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            Explore the Crisis
            <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ─── LIVE INFINITE MARQUEE ─── */}
      <div className="relative z-10 w-full overflow-hidden border-y border-[var(--border)] py-4 backdrop-blur-sm bg-[var(--bg-elevated)]/30">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--bg-base)] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--bg-base)] to-transparent z-10" />
        <div className="flex gap-8 items-center" style={{ animation: "marquee 25s linear infinite", whiteSpace: "nowrap" }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex-shrink-0 font-mono text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ─── INDUSTRIAL METRICS GRID ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="glass-card hover:border-indigo-500/30 p-8 flex flex-col gap-3 group animate-slide-up"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center font-mono text-xs font-bold text-indigo-500 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                0{i + 1}
              </div>
              <span className="font-black text-4xl sm:text-5xl text-[var(--text-primary)] font-mono tracking-tighter mt-4 group-hover:gradient-text transition-all">
                {stat.value}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TRI-TIER LLM ROUTING SYSTEM ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24">
        <div className="text-center mb-16 animate-slide-up">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-indigo-500 tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-4">
            Adaptive Intelligence
          </span>
          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
            Not one model.<br />
            <span className="gradient-text">Three. Matched to severity.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MODEL_TIERS.map((model, i) => (
            <div
              key={model.name}
              className="cyber-card relative p-8 group animate-slide-up bg-white/50 dark:bg-transparent"
              style={{ animationDelay: `${0.2 * i}s` }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                   style={{ background: `radial-gradient(circle at top right, ${model.color}15, transparent 60%)` }} />

              <div className="flex items-center justify-between mb-8 relative z-10">
                <span className="font-mono text-[10px] font-black tracking-widest uppercase border border-current px-2 py-1 rounded" style={{ color: model.color, backgroundColor: `${model.color}10` }}>
                  {model.tier}
                </span>
              </div>

              <div className="h-10 mb-6 relative z-10 flex items-center">
                <Image
                  src={theme === "light" ? model.logoLight : model.logoDark}
                  alt={model.name}
                  width={100}
                  height={40}
                  style={{ width: "auto", height: "auto" }}
                  className="object-contain transition-opacity"
                />
              </div>

              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-8 relative z-10 min-h-[60px]">
                {model.desc}
              </p>

              <div className="space-y-3 relative z-10 border-t border-[var(--border)] pt-6">
                {model.specs.map((spec) => (
                  <div key={spec} className="flex items-center gap-3 text-xs font-medium text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full shadow-sm flex-shrink-0" style={{ background: model.color, boxShadow: `0 0 8px ${model.color}` }} />
                    {spec}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA FOOTER BLOCK ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-24">
        <div className="glass rounded-[2rem] p-10 sm:p-16 text-center border-indigo-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] mb-6 relative z-10">
            Stop losing shifts.<br />Start MEND-X.
          </h2>
          <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-xl mx-auto mb-10 relative z-10 leading-relaxed">
            Every failure comes with a solution written in a manual somewhere. We just make sure you find it in 8 seconds instead of 4 hours.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm text-[var(--bg-base)] bg-[var(--text-primary)] hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              Open Console
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

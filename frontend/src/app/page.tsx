"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LandingLayout from "@/components/landing/LandingLayout";

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
    logo: "/nord-dark.png",
  },
  {
    name: "FORGE",
    tier: "02 — MID TIER",
    color: "#f59e0b",
    colorBg: "rgba(245,158,11,0.08)",
    colorBorder: "rgba(245,158,11,0.25)",
    desc: "The production workhorse. Handles multi-step repair procedures, component cross-references, and mid-complexity fault trees for mid-level maintenance engineers.",
    specs: ["Gemini 2.0 Flash", "1–3s latency", "Multi-step procedures", "Component cross-reference"],
    logo: "/forge-dark.png",
  },
  {
    name: "APEX",
    tier: "03 — HIGH TIER",
    color: "#8b5cf6",
    colorBg: "rgba(139,92,246,0.08)",
    colorBorder: "rgba(139,92,246,0.25)",
    desc: "Maximum reasoning tier for critical failures, root cause analysis, and safety-critical systems. Deployed for aerospace, automotive, and high-voltage environments.",
    specs: ["Claude Sonnet 3.5", "3–8s latency", "Root cause analysis", "Safety-critical systems"],
    logo: "/apex-dark.png",
  },
];

export default function HomePage() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <LandingLayout>
      {/* ─── BG ambient layer ─── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 left-1/5 w-[500px] h-[500px] bg-violet-700/10 rounded-full blur-[130px]" />
      </div>

      {/* ─── HERO ─── */}
      <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Top badge */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] font-mono text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>VCET HACKATHON 2026</span>
            <span className="text-white/20">·</span>
            <span>TEAM [VH26-37]</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 font-mono text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SYSTEM OPERATIONAL
          </div>
        </div>

        {/* Giant industrial headline — editorial style, not AI bland */}
        <div className="mb-8">
          <p className="font-mono text-xs text-slate-500 uppercase tracking-[0.3em] mb-4">
            MEND - X · INDUSTRIAL AI DIAGNOSTIC ENGINE
          </p>
          <h1 className="font-black text-[clamp(3rem,9vw,7.5rem)] leading-[0.9] tracking-[-0.04em] uppercase text-white">
            FROM
            <br />
            FAILURE
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #6366f1, #8b5cf6, #10b981)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              TO FUNCTION.
            </span>
          </h1>
        </div>

        <div className="max-w-xl mb-12">
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Factory lines halt. Alarms trigger. Technicians scramble through 800-page PDFs.
            <span className="text-white font-semibold"> MEND-X eliminates the gap</span> — 
            a zero-hallucination RAG engine that converts any OEM manual into instant, 
            page-cited repair protocols.
          </p>
        </div>

        {/* Dual CTAs */}
        <div className="flex flex-wrap gap-4 items-center mb-20">
          <Link
            href="/dashboard"
            className="px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 shadow-xl shadow-indigo-600/25 transition-all hover:-translate-y-0.5 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Launch Console
          </Link>
          <Link
            href="/architecture"
            className="px-7 py-3.5 rounded-xl text-sm font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all flex items-center gap-2"
          >
            Explore Architecture
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* ─── Marquee strip ─── */}
        <div className="relative overflow-hidden border-y border-white/[0.05] py-3 mb-20 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="flex gap-8" style={{ animation: "marquee 18s linear infinite", whiteSpace: "nowrap" }}>
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="flex-shrink-0 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-indigo-500/60" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-28">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] rounded-2xl overflow-hidden border border-white/[0.06]">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="bg-[#07080c] px-6 py-8 flex flex-col gap-2 hover:bg-[#0d0e14] transition-colors"
            >
              <span className="font-black text-4xl sm:text-5xl text-white font-mono tracking-tighter">{stat.value}</span>
              <span className="text-xs text-slate-500 leading-relaxed">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── THREE MODEL TIERS ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-28">
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em]">THE THREE INTELLIGENCE TIERS</span>
          </div>
          <h2 className="font-black text-4xl sm:text-5xl text-white tracking-tight leading-tight mb-4">
            Not one model.<br />Three, matched to severity.
          </h2>
          <p className="text-slate-400 text-base max-w-2xl">
            Industrial plants range from edge PLCs with no internet to cloud-connected control centers handling life-critical decisions. MEND-X routes every query to the right inference tier automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MODEL_TIERS.map((model, i) => (
            <div
              key={model.name}
              className="group relative rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 cursor-default"
              style={{
                background: model.colorBg,
                border: `1px solid ${model.colorBorder}`,
              }}
            >
              {/* Tier number */}
              <div className="font-mono text-[10px] font-bold mb-5 tracking-[0.25em] uppercase" style={{ color: model.color, opacity: 0.7 }}>
                {model.tier}
              </div>

              {/* Logo */}
              <div className="mb-5 h-12 flex items-center">
                <Image
                  src={model.logo}
                  alt={model.name}
                  width={90}
                  height={40}
                  className="object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>

              {/* Description */}
              <p className="text-sm text-slate-400 leading-relaxed mb-6">{model.desc}</p>

              {/* Specs */}
              <ul className="space-y-2">
                {model.specs.map((spec) => (
                  <li key={spec} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: model.color }} />
                    {spec}
                  </li>
                ))}
              </ul>

              {/* Glow edge on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ boxShadow: `inset 0 0 30px ${model.color}10, 0 0 30px ${model.color}10` }}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/architecture"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-colors font-mono"
          >
            Deep dive into system architecture
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ─── SHORT PROBLEM HOOK ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-28">
        <div
          className="rounded-2xl p-8 sm:p-14 border border-red-500/15 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.04) 0%, rgba(15,17,23,1) 60%)" }}
        >
          <div className="absolute top-0 right-0 font-black text-[16rem] leading-none text-red-500/[0.04] select-none pointer-events-none font-mono tracking-tighter -mt-10 -mr-8">
            !
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/25 text-red-400 font-mono text-[10px] font-bold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              The Crisis
            </span>
            <h2 className="font-black text-3xl sm:text-5xl text-white leading-tight tracking-tight mb-5">
              Every minute a line<br />stops costs $4,333.
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-8">
              The average unplanned industrial outage lasts over 4 hours. That's $1M+ per incident — not from broken hardware, but from technicians unable to find the right page in the right manual fast enough.
            </p>
            <Link
              href="/problem"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 transition-all"
            >
              See the full problem statement
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Page navigation teaser ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              href: "/problem",
              label: "Problem & Solution",
              desc: "The $260K/hr crisis, hallucination dangers, and why MEND-X is the only viable answer.",
              icon: "⚡",
              accent: "#ef4444",
            },
            {
              href: "/architecture",
              label: "System Architecture",
              desc: "Three-tier LLM routing, pgvector RAG pipeline, FastAPI backend internals, and data flow diagrams.",
              icon: "⬡",
              accent: "#6366f1",
            },
            {
              href: "/workflow",
              label: "How It Works",
              desc: "From PDF upload to verified answer in 8 seconds. Every step of the diagnostic pipeline visualized.",
              icon: "◎",
              accent: "#10b981",
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all flex flex-col gap-3"
            >
              <div className="text-2xl font-mono" style={{ color: card.accent }}>{card.icon}</div>
              <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">{card.label}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
              <div className="flex items-center gap-1.5 text-xs font-semibold font-mono mt-auto pt-3 border-t border-white/[0.06]" style={{ color: card.accent }}>
                Explore
                <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </LandingLayout>
  );
}

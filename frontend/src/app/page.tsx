"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LandingLayout from "@/components/landing/LandingLayout";
import DowntimeCalculator from "@/components/landing/DowntimeCalculator";
import DiagnosticSimulator from "@/components/landing/DiagnosticSimulator";
import EngineeringBlogs from "@/components/landing/EngineeringBlogs";
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
  { value: "\$260K", label: "Average downtime cost per hour in heavy industry" },
  { value: "4.5h", label: "Average time to locate correct manual procedure" },
  { value: "42%", label: "Breakdowns caused by absent or wrong documentation" },
  { value: "<8s", label: "MEND-X time to full verified repair protocol" },
];

const MODEL_TIERS = [
  {
    name: "Compound Mini",
    tier: "01 — FAST EDGE / TRIAGE",
    color: "#3b82f6",
    colorBg: "rgba(59,130,246,0.08)",
    colorBorder: "rgba(59,130,246,0.25)",
    desc: "Lightweight Groq LPU model for rapid-fire queries: error code lookups, symptom triage, and binary yes/no diagnostics. Optimized for PLCs and line controllers.",
    specs: ["Groq Compound Mini", "Sub-100ms latency", "LPU acceleration", "Error code matching"],
    logoDark: "/nord-dark.png",
    logoLight: "/nord-light.png",
  },
  {
    name: "GPT-OSS 20B",
    tier: "02 — MID TIER WORKHORSE",
    color: "#f59e0b",
    colorBg: "rgba(245,158,11,0.08)",
    colorBorder: "rgba(245,158,11,0.25)",
    desc: "The production diagnostic workhorse. Handles multi-step repair procedures, component cross-references, and mid-complexity fault trees for maintenance technicians.",
    specs: ["GPT-OSS 20B (Groq Fast)", "1–2s latency", "Multi-step procedures", "128k context window"],
    logoDark: "/forge-dark.png",
    logoLight: "/forge-light.png",
  },
  {
    name: "GPT-OSS 120B",
    tier: "03 — DEEP REASONING",
    color: "#8b5cf6",
    colorBg: "rgba(139,92,246,0.08)",
    colorBorder: "rgba(139,92,246,0.25)",
    desc: "Maximum reasoning tier for critical failures, root cause analysis, cross-manual ambiguity, and safety-critical industrial drives.",
    specs: ["GPT-OSS 120B (Groq)", "2–4s latency", "Root cause analysis", "Deep reasoning chain"],
    logoDark: "/apex-dark.png",
    logoLight: "/apex-light.png",
  }
];

const FEATURES = [
  { title: "Zero-Hallucination RAG", desc: "Deterministic chunking (512 tokens) with 0.72 cosine similarity threshold. Every response cites its source page.", icon: "🎯" },
  { title: "Multi-Tenant Isolation", desc: "pgvector ANN search scoped by machine_id. Air-gapped deployments supported on restricted networks.", icon: "🔒" },
  { title: "Sub-8s Response Time", desc: "Tri-tier LLM cascade (Mini <100ms, 20B 1-2s, 120B 2-4s) auto-routes by severity on Groq LPU.", icon: "⚡" },
  { title: "OEM Manual Ingestion", desc: "PyMuPDF pipeline extracts 1.2M+ vendor manuals. Automatic schema inference and cross-reference mapping.", icon: "📚" },
  { title: "Compliance-Ready", desc: "DO-254 (Aerospace), IEC-61508 (Functional Safety), GDPR data residency, air-gap deployment options.", icon: "✅" },
  { title: "Field Technician UX", desc: "Mobile-first error code entry. Speaks technician language: bolt torque specs, component part numbers, tool requirements.", icon: "📱" }
];

const SECURITY_MATRIX = [
  { feature: "End-to-End Encryption", miniImplements: "TLS 1.3 on edge", gpt20bImplements: "mTLS + encrypted payloads", gpt120bImplements: "Zero-knowledge proofs for reasoning traces" },
  { feature: "Data Residency", miniImplements: "On-device vectors", gpt20bImplements: "Customer-VPC pgvector (optional)", gpt120bImplements: "Air-gapped reasoning sandbox" },
  { feature: "Audit Trails", miniImplements: "Local query logs", gpt20bImplements: "Immutable decision trees", gpt120bImplements: "Full reasoning transparency + citations" },
  { feature: "Access Control", miniImplements: "API key + role-based", gpt20bImplements: "RBAC + machine-level scoping", gpt120bImplements: "Signature-enforced root cause audit" }
];

const FAQ = [
  { q: "How is hallucination prevented?", a: "Every response is backed by a cited page from the OEM manual corpus. If the vector similarity falls below 0.72, the system refuses with clarification prompts instead of guessing. This 'refusal circuit' fires when data is ambiguous or outside training scope." },
  { q: "Can MEND-X work offline / air-gapped?", a: "Yes. Compound Mini runs on edge devices. GPT-OSS 20B and 120B provide high-throughput manual reasoning with zero data retention on Groq LPU or customer VPC." },
  { q: "How do you handle manual PDFs?", a: "PyMuPDF extracts text + table structure. Deterministic chunking (512 tokens, 128 overlap) preserves context boundaries. We ingest 1.2M+ pages and map cross-references automatically (e.g., 'See Service Bulletin 7F-61-00')." },
  { q: "What's the latency breakdown?", a: "Compound Mini: <100ms. GPT-OSS 20B: 1–2s (includes vector search + LPU inference). GPT-OSS 120B: 2–4s (full multi-hop reasoning). Cached queries hit in <50ms." },
  { q: "Is this HIPAA / GDPR / DO-254 compliant?", a: "We support compliance-ready deployments: encrypted data stores, immutable audit logs, machine-scoped access control, and air-gapped reasoning. Compliance certification requires your deployment review; we provide architecture & audit trails." },
  { q: "How do you prevent malicious prompts?", a: "Input is sanitized and scoped to machine context. The refusal circuit also rejects queries outside the manual domain. We don't execute arbitrary code or scripts; reasoning is constrained to manual interpretation." }
];

export default function HomePage() {
  const { theme } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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

        {/* Hero Headline */}
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
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-24 pb-28 scroll-mt-28">
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 tracking-widest bg-teal-500/10 px-3.5 py-1.5 rounded-full border border-teal-500/25 mb-5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            Adaptive Intelligence Architecture
          </div>
          <h2 className="font-black text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight leading-tight">
            Not one model.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500">
              Three. Matched to severity.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-4 leading-relaxed">
            PLCs demand sub-100ms edge speed; complex catastrophic breakdowns require deep reasoning. MEND-X dynamically routes every query to the exact intelligence tier needed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MODEL_TIERS.map((model, i) => (
            <div
              key={model.name}
              className="relative p-8 rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white/90 dark:bg-[#0c1017]/90 border-slate-200/90 dark:border-white/10 backdrop-blur-xl flex flex-col justify-between"
              style={{
                boxShadow: `0 8px 30px ${model.color}10`,
              }}
            >
              {/* Top Accent Line */}
              <div
                className="absolute top-0 left-8 right-8 h-1 rounded-full opacity-70"
                style={{ background: model.color }}
              />

              <div>
                {/* Tier Badge & Latency Pill */}
                <div className="flex items-center justify-between mb-6">
                  <span
                    className="font-mono text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md border"
                    style={{
                      color: model.color,
                      backgroundColor: `${model.color}12`,
                      borderColor: `${model.color}30`,
                    }}
                  >
                    {model.tier}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {model.name.includes("Mini") ? "<100ms" : model.name.includes("20B") ? "1-2s" : "2-4s"}
                  </span>
                </div>

                {/* Prominent Model Logo Banner */}
                <div className="h-14 sm:h-16 w-full flex items-center my-3">
                  <Image
                    src={theme === "light" ? model.logoLight : model.logoDark}
                    alt={model.name}
                    width={180}
                    height={60}
                    className="h-12 sm:h-14 w-auto max-w-[180px] object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-200"
                    priority
                  />
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    {model.name}
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: model.color }}
                    />
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                    {model.name.includes("Mini")
                      ? "Edge Heuristic Triage · Low Latency"
                      : model.name.includes("20B")
                      ? "Production RAG Synthesizer · Workhorse"
                      : "Root Cause Reasoning Engine · Deep Logic"}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 min-h-[48px]">
                  {model.desc}
                </p>
              </div>

              {/* Specs & Link */}
              <div className="space-y-3 pt-5 border-t border-slate-200/80 dark:border-white/[0.08]">
                {model.specs.map((spec) => (
                  <div
                    key={spec}
                    className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: model.color, boxShadow: `0 0 6px ${model.color}` }}
                    />
                    <span>{spec}</span>
                  </div>
                ))}

                <Link
                  href="/models"
                  className="inline-flex items-center gap-1.5 mt-4 pt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 group transition-colors"
                >
                  <span>Explore {model.name} Technical Architecture</span>
                  <svg
                    className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── INTERACTIVE DOWNTIME CALCULATOR ─── */}
      <DowntimeCalculator />

      {/* ─── LIVE DIAGNOSTIC SIMULATOR ─── */}
      <DiagnosticSimulator />

      {/* ─── ENGINEERING BLOGS / NEWS ─── */}
      <EngineeringBlogs />

      {/* ─── FEATURE MATRIX ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 border-t border-[var(--border)]">
        <div className="text-center mb-16 animate-slide-up">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-pink-500 tracking-widest bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20 mb-4">
            Full Spectrum
          </span>
          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
            Every technician <span className="gradient-text-rose">deserves precision.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="cyber-card p-6 animate-slide-up" style={{ animationDelay: `${0.1 * i}s` }}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-black text-lg text-[var(--text-primary)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECURITY & COMPLIANCE MATRIX ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 border-t border-[var(--border)]">
        <div className="text-center mb-16 animate-slide-up">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-cyan-500 tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 mb-4">
            Defense & Compliance
          </span>
          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
            Security is not a <span className="gradient-text-emerald">nice-to-have.</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 font-black text-[var(--text-primary)]">Requirement</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] font-bold text-blue-500 uppercase tracking-widest">Compound Mini (Fast)</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest">GPT-OSS 20B (Workhorse)</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] font-bold text-violet-500 uppercase tracking-widest">GPT-OSS 120B (Reasoning)</th>
              </tr>
            </thead>
            <tbody>
              {SECURITY_MATRIX.map((row, i) => (
                <tr key={i} className="border-b border-[var(--border)]">
                  <td className="px-4 py-4 font-semibold text-[var(--text-primary)]">{row.feature}</td>
                  <td className="px-4 py-4 text-[var(--text-muted)] text-xs">{row.miniImplements}</td>
                  <td className="px-4 py-4 text-[var(--text-muted)] text-xs">{row.gpt20bImplements}</td>
                  <td className="px-4 py-4 text-[var(--text-muted)] text-xs">{row.gpt120bImplements}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── FAQ ACCORDION ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-24 border-t border-[var(--border)]">
        <div className="text-center mb-12 animate-slide-up">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-slate-500 tracking-widest bg-slate-500/10 px-3 py-1 rounded-full border border-slate-500/20 mb-4">
            Q&A
          </span>
          <h2 className="font-black text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight">Frequently Asked</h2>
        </div>

        <div className="space-y-3">
          {FAQ.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
              className="w-full text-left px-6 py-4 rounded-xl border border-[var(--border)] glass-hover transition-all group animate-slide-up"
              style={{ animationDelay: `${0.05 * idx}s` }}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">{item.q}</p>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              {expandedFaq === idx && (
                <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)] pt-3">
                  {item.a}
                </p>
              )}
            </button>
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
            <Link
              href="/problem"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm border border-[var(--border)] text-[var(--text-primary)] hover:border-indigo-500/50 transition-colors flex items-center justify-center gap-2"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

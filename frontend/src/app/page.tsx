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

const CASE_STUDIES = [
  {
    title: "Automotive Tier-1: Welding Cell Recovery",
    company: "Global OEM Supplier",
    industry: "Automotive",
    issue: "KUKA KR-210 servo fault preventing production cell handshake",
    traditional: "4.2 hours manual troubleshooting + schematic cross-referencing",
    mendx: "8 minutes: MEND-X isolated Profinet board contact issue from 3 nested fault trees",
    roi: "\$1.2M annual saved",
    metrics: [
      { label: "Cycles Restored", value: "847 / 8h shift" },
      { label: "Capital Recovered", value: "\$42K per incident" },
      { label: "Documentation Queries", value: "6 OEM manuals cross-referenced" }
    ]
  },
  {
    title: "Aerospace: Flight-Critical Hydraulics",
    company: "Tier-1 Aero Supplier",
    industry: "Aerospace",
    issue: "Pressure transducer false-positive alarm on main landing gear rig",
    traditional: "6.5 hours + safety compliance review + engineer sign-off",
    mendx: "9 minutes: MEND-X navigated DO-254 documentation & sensor calibration tree",
    roi: "\$2.8M annual saved",
    metrics: [
      { label: "Test Cycles", value: "32 / week" },
      { label: "Compliance Citations", value: "4 relevant FAA bulletins matched" },
      { label: "Risk Reduction", value: "99.7% false-positive elimination" }
    ]
  },
  {
    title: "Energy: Thermal Power Plant",
    company: "Major Utility Grid Operator",
    industry: "Heavy Industry / Energy",
    issue: "Siemens S7-1500 SCADA fault tripping 500MW generator",
    traditional: "3-4 hours field troubleshooting + remote vendor support",
    mendx: "12 minutes: MEND-X pinpointed CRM62 encoder connection fault in SINAMICS drive",
    roi: "\$5.6M annual saved",
    metrics: [
      { label: "Grid Stability Windows", value: "14 prevented incidents/quarter" },
      { label: "Revenue Impact", value: "\$1.8M per 4h downtime avoided" },
      { label: "Technician Efficiency", value: "78% faster root isolation" }
    ]
  }
];

const FEATURES = [
  { title: "Zero-Hallucination RAG", desc: "Deterministic chunking (512 tokens) with 0.72 cosine similarity threshold. Every response cites its source page.", icon: "🎯" },
  { title: "Multi-Tenant Isolation", desc: "pgvector ANN search scoped by machine_id. Air-gapped deployments supported on restricted networks.", icon: "🔒" },
  { title: "Sub-8s Response Time", desc: "Tri-tier LLM cascade (NORD<100ms, FORGE 1-3s, APEX 3-8s) auto-routes by severity.", icon: "⚡" },
  { title: "OEM Manual Ingestion", desc: "PyMuPDF pipeline extracts 1.2M+ vendor manuals. Automatic schema inference and cross-reference mapping.", icon: "📚" },
  { title: "Compliance-Ready", desc: "DO-254 (Aerospace), IEC-61508 (Functional Safety), GDPR data residency, air-gap deployment options.", icon: "✅" },
  { title: "Field Technician UX", desc: "Mobile-first error code entry. Speaks technician language: bolt torque specs, component part numbers, tool requirements.", icon: "📱" }
];

const SECURITY_MATRIX = [
  { feature: "End-to-End Encryption", nordImplements: "TLS 1.3 on edge", forgeImplements: "mTLS + encrypted payloads", apexImplements: "Zero-knowledge proofs for reasoning traces" },
  { feature: "Data Residency", nordImplements: "On-device vectors", forgeImplements: "Customer-VPC pgvector (optional)", apexImplements: "Air-gapped reasoning sandbox" },
  { feature: "Audit Trails", nordImplements: "Local query logs", forgeImplements: "Immutable decision trees", apexImplements: "Full reasoning transparency + citations" },
  { feature: "Access Control", nordImplements: "API key + role-based", forgeImplements: "RBAC + machine-level scoping", apexImplements: "Signature-enforced root cause audit" }
];

const FAQ = [
  { q: "How is hallucination prevented?", a: "Every response is backed by a cited page from the OEM manual corpus. If the vector similarity falls below 0.72, the system refuses with clarification prompts instead of guessing. This 'refusal circuit' fires when data is ambiguous or outside training scope." },
  { q: "Can MEND-X work offline / air-gapped?", a: "Yes. NORD (Llama 3.1 8B) runs fully on-device with no external API calls. FORGE can run on private VPC with local pgvector. APEX requires cloud connectivity but never transmits raw manuals outside your infrastructure." },
  { q: "How do you handle manual PDFs?", a: "PyMuPDF extracts text + table structure. Deterministic chunking (512 tokens, 128 overlap) preserves context boundaries. We ingest 1.2M+ pages and map cross-references automatically (e.g., 'See Service Bulletin 7F-61-00')." },
  { q: "What's the latency breakdown?", a: "NORD: <100ms. FORGE: 1–3s (includes pgvector ANN + LLM inference). APEX: 3–8s (full reasoning). Cold-start (first query) adds ~500ms to cloud tiers. Cached queries hit in <50ms." },
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
                <Link href="/models" className="inline-flex items-center gap-1.5 mt-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] group transition-colors">
                  Full specs
                  <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
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

      {/* ─── CASE STUDIES / INDUSTRIAL POST-MORTEMS ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 border-t border-[var(--border)]">
        <div className="text-center mb-16 animate-slide-up">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-amber-500 tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mb-4">
            Real-World Impact
          </span>
          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
            Industrial <span className="gradient-text-gold">Success Stories.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {CASE_STUDIES.map((study, idx) => (
            <div
              key={idx}
              className="cyber-card p-8 sm:p-12 animate-slide-up"
              style={{ animationDelay: `${0.15 * idx}s` }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🏭</span>
                  </div>
                  <h3 className="font-black text-xl text-[var(--text-primary)] mb-2">{study.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-4">{study.company}</p>
                  <div className="inline-flex gap-2 flex-wrap">
                    <span className="font-mono text-[9px] font-black text-white bg-amber-600/80 px-2 py-1 rounded uppercase tracking-wider">
                      {study.industry}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">The Fault</p>
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-6">{study.issue}</p>

                  <p className="text-xs font-mono font-bold text-rose-500 uppercase tracking-wider mb-2">Traditional: 🐌</p>
                  <p className="text-sm font-medium text-rose-400 mb-6">{study.traditional}</p>

                  <p className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-wider mb-2">MEND-X: ⚡</p>
                  <p className="text-sm font-medium text-emerald-400">{study.mendx}</p>
                </div>

                <div className="lg:border-l lg:border-[var(--border)] lg:pl-8">
                  <p className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-wider mb-4">Annual ROI</p>
                  <p className="text-3xl font-black text-indigo-400 mb-6">{study.roi}</p>

                  <div className="space-y-3">
                    {study.metrics.map((m, i) => (
                      <div key={i}>
                        <p className="text-xs text-[var(--text-secondary)] font-semibold mb-1">{m.label}</p>
                        <p className="text-sm font-mono font-bold text-[var(--text-primary)]">{m.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

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
                <th className="text-left px-4 py-3 font-mono text-[10px] font-bold text-blue-500 uppercase tracking-widest">NORD (Edge)</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest">FORGE (Cloud)</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] font-bold text-violet-500 uppercase tracking-widest">APEX (Secure)</th>
              </tr>
            </thead>
            <tbody>
              {SECURITY_MATRIX.map((row, i) => (
                <tr key={i} className="border-b border-[var(--border)]">
                  <td className="px-4 py-4 font-semibold text-[var(--text-primary)]">{row.feature}</td>
                  <td className="px-4 py-4 text-[var(--text-muted)] text-xs">{row.nordImplements}</td>
                  <td className="px-4 py-4 text-[var(--text-muted)] text-xs">{row.forgeImplements}</td>
                  <td className="px-4 py-4 text-[var(--text-muted)] text-xs">{row.apexImplements}</td>
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

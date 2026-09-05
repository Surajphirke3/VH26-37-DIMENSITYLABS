"use client";

import React, { useState } from "react";
import Link from "next/link";
import LandingLayout from "@/components/landing/LandingLayout";

const IMPACT_BREAKDOWN = [
  { sector: "Automotive", annualDowntime: "$8.2B", avgIncident: "\$420K", incidents: "1,847/year/plant" },
  { sector: "Aerospace", annualDowntime: "\$3.1B", avgIncident: "\$1.2M", incidents: "342/year/facility" },
  { sector: "Heavy Industry / Energy", annualDowntime: "\$12.6B", avgIncident: "\$780K", incidents: "2,104/year/grid operator" },
  { sector: "Pharma / Food & Beverage", annualDowntime: "\$2.8B", avgIncident: "\$310K", incidents: "1,421/year/plant" },
  { sector: "Semiconductor", annualDowntime: "\$5.4B", avgIncident: "\$650K", incidents: "987/year/fab" },
];

const ROOT_CAUSES = [
  { cause: "Documentation Maze", percent: 42, desc: "Technicians waste 4.5h navigating fragmented manuals, outdated specs, and conflicting vendor bulletins." },
  { cause: "Knowledge Loss", percent: 28, desc: "Retiring experienced technicians leave tribal knowledge. New staff have no reference; troubleshooting becomes guesswork." },
  { cause: "Incorrect Diagnosis", percent: 18, desc: "Manual cross-referencing leads to misidentified components. Wrong parts replaced, escalating repair time and cost." },
  { cause: "Regulatory / Compliance Risk", percent: 12, desc: "Aerospace & pharma cite wrong service bulletins, creating audit failures and safety violations." },
];

const COST_DRIVERS = [
  { driver: "Downtime Capital Loss", severity: "CRITICAL", cost: "\$260K/hour", example: "A stopped production line loses revenue at 60 units/hour × \$4,300/unit = \$258K/hour." },
  { driver: "Labor Escalation", severity: "HIGH", cost: "\$12K–\$18K/incident", example: "Overtime pay for extended troubleshooting. Technician burnout + training replacements." },
  { driver: "Expedited Parts", severity: "HIGH", cost: "\$8K–\$25K/incident", example: "Emergency air freight vs. standard 2-week lead times." },
  { driver: "Compliance / Audit Failures", severity: "CRITICAL", cost: "\$500K–\$5M/failure", example: "FDA warning letters, flight delays, insurance claims." },
  { driver: "Ripple Effects", severity: "MEDIUM", cost: "\$50K–\$200K/incident", example: "Missed customer deliveries, penalty clauses, SLA breaches." },
];

const INDUSTRY_SCENARIOS = [
  {
    title: "Automotive Scenario: Welding Cell Halt",
    pain: "A KUKA KR-210 servo fault halts the entire welding station. Technicians have 3 service bulletins and 2 conflicting schematics. Is it the Profinet board? The encoder? A timing issue?",
    traditional: "4.2 hours → \$1.092M in lost throughput",
    mendx: "8 minutes → \$35K total cost (8 min downtime + parts + labor)",
    saved: "\$1.057M per incident × 12 incidents/year = \$12.68M annual recovery"
  },
  {
    title: "Aerospace Scenario: Flight-Critical Pressure Transducer",
    pain: "A false-positive alarm on a hydraulic pressure sensor grounds a test rig. Engineers must validate against DO-254 (design assurance) and DO-178B (software) guidance. Is the sensor bad, or is the threshold miscalibrated?",
    traditional: "6.5 hours + safety review + FAA compliance sign-off = \$2.3M lost test revenue",
    mendx: "9 minutes + auto-matched compliance bulletins = \$68K total",
    saved: "\$2.232M per incident × 8 incidents/year = \$17.86M annual recovery"
  },
  {
    title: "Energy Sector: 500MW Generator Trip",
    pain: "A Siemens SCADA fault triggers an unplanned shutdown of a major thermal plant. Grid operators lose revenue at \$1.8M per 4-hour window. Root cause: a CRM62 encoder connection fault buried in a 2,400-page SINAMICS manual.",
    traditional: "3–4 hours field troubleshooting + remote vendor escalation = \$5.6M+ lost revenue",
    mendx: "12 minutes + auto-isolated fault tree = \$140K total",
    saved: "\$5.46M per incident × 14 incidents/quarter = \$76.44M annual recovery"
  },
];

const SOLUTION_PILLARS = [
  {
    title: "Instant Manual Retrieval",
    desc: "No more hunting. MEND-X's pgvector ANN search scans 1.2M+ OEM manual pages and returns the exact relevant section in <100ms. Every response cites the source page.",
    metrics: ["0.72 cosine similarity threshold", "Deterministic 512-token chunking", "Cross-reference auto-mapping"]
  },
  {
    title: "Tri-Tier Adaptive Routing",
    desc: "Simple error codes (Compound Mini <100ms). Multi-step procedures (GPT-OSS 20B 1–2s). Critical root cause (GPT-OSS 120B 2–4s). Severity-matched LLM routing eliminates wasted compute and speeds diagnosis.",
    metrics: ["Groq Compound Mini", "GPT-OSS 20B fast workhorse", "GPT-OSS 120B deep reasoning"]
  },
  {
    title: "Zero-Hallucination Defense",
    desc: "If the system can't find a confident answer, it refuses gracefully with clarification prompts instead of guessing. Refusal circuits trigger on low confidence, out-of-scope queries, and ambiguous symptoms.",
    metrics: ["Refusal circuit enforcement", "In-scope validation", "Confidence thresholding"]
  },
  {
    title: "Technician-First UX",
    desc: "Mobile-first error code entry. Speaks the language of the shop floor: part numbers, bolt torque specs, tool requirements, step-by-step visuals. No jargon.",
    metrics: ["Field technician workflows", "Ultra-fast edge triage", "Voice input ready"]
  },
  {
    title: "Compliance & Audit Ready",
    desc: "DO-254 (aerospace), IEC-61508 (safety), GDPR (data residency). Every decision is logged, auditable, and tied to source documentation. Air-gapped deployments supported.",
    metrics: ["Immutable audit trails", "Encrypted data stores", "Air-gap deployment option"]
  },
  {
    title: "Rapid Onboarding",
    desc: "No months of manual ingestion. Drop a folder of PDFs, MEND-X auto-parses them with PyMuPDF, chunks deterministically, vectors with OpenAI text-embedding-3-small, and indexes via pgvector ANN in hours.",
    metrics: ["PyMuPDF extraction", "Automatic schema inference", "pgvector indexing"]
  },
];

export default function ProblemPage() {
  const [expandedRoot, setExpandedRoot] = useState<number | null>(null);

  return (
    <LandingLayout>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-grid">
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full orb opacity-20" style={{ background: "radial-gradient(circle, #ef4444 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full orb opacity-15" style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)", animationDelay: "-5s" }} />
      </div>

      {/* Hero */}
      <section className="relative z-10 pt-24 sm:pt-28 md:pt-32 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-3 mb-4 sm:mb-6 px-4 py-1.5 sm:py-2 rounded-full glass border border-[var(--border)] animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-rose-500/10 border border-rose-500/25">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
            <span className="font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400 tracking-widest uppercase">The Crisis</span>
          </div>
        </div>

        <h1 className="font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight uppercase text-[var(--text-primary)] mb-4 sm:mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          When Production <span className="gradient-text-rose">Stops.</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-[var(--text-muted)] max-w-3xl leading-relaxed mb-6 sm:mb-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          Factory lines don't fail quietly. They fail with sirens, flashing lights, and a ticking clock. Every minute of downtime burns capital at rates most teams can't quantify until the damage is done.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <Link
            href="/dashboard"
            className="group relative w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 bg-[length:200%_auto] group-hover:bg-[position:100%_center] transition-all duration-500" />
            <span className="relative z-10">See How MEND-X Helps</span>
          </Link>
        </div>
      </section>

      {/* Economic Impact */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 border-t border-[var(--border)]">
        <div className="text-center mb-12 animate-slide-up">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-amber-500 tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mb-4">
            By The Numbers
          </span>
          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
            The Cost of <span className="gradient-text-gold">Uncertainty.</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm mt-8">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 font-black text-[var(--text-primary)]">Sector</th>
                <th className="text-right px-4 py-3 font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest">Annual Industry Downtime</th>
                <th className="text-right px-4 py-3 font-mono text-[10px] font-bold text-rose-500 uppercase tracking-widest">Avg / Incident</th>
                <th className="text-right px-4 py-3 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">Incidents/Year</th>
              </tr>
            </thead>
            <tbody>
              {IMPACT_BREAKDOWN.map((row, i) => (
                <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface)]/30 transition-colors">
                  <td className="px-4 py-4 font-semibold text-[var(--text-primary)]">{row.sector}</td>
                  <td className="text-right px-4 py-4 font-mono font-bold text-amber-400">{row.annualDowntime}</td>
                  <td className="text-right px-4 py-4 font-mono font-bold text-rose-400">{row.avgIncident}</td>
                  <td className="text-right px-4 py-4 font-mono text-slate-400">{row.incidents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 p-8 cyber-card bg-amber-950/20 border-amber-800/30">
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            <span className="font-black text-amber-400">Total addressable market:</span> <span className="text-amber-300">~\$32.1 billion in annual downtime costs globally.</span> MEND-X targets a 35–50% reduction through instant troubleshooting acceleration.
          </p>
        </div>
      </section>

      {/* Root Cause Analysis */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 border-t border-[var(--border)]">
        <div className="text-center mb-12 animate-slide-up">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-violet-500 tracking-widest bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20 mb-4">
            Root Cause Taxonomy
          </span>
          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
            Why Breakdowns <span className="gradient-text">Linger.</span>
          </h2>
        </div>

        <div className="space-y-3 mt-8">
          {ROOT_CAUSES.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setExpandedRoot(expandedRoot === idx ? null : idx)}
              className="w-full text-left p-6 rounded-xl border border-[var(--border)] glass-hover transition-all group animate-slide-up"
              style={{ animationDelay: `${0.1 * idx}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--text-primary)] group-hover:text-violet-400 transition-colors">{item.cause}</h3>
                  <div className="mt-2 w-full bg-[var(--bg-surface)] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-violet-400"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <span className="font-mono font-bold text-violet-400">{item.percent}%</span>
                </div>
              </div>
              {expandedRoot === idx && (
                <p className="mt-4 text-sm text-[var(--text-muted)] pt-4 border-t border-[var(--border)]">
                  {item.desc}
                </p>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Cost Drivers */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 border-t border-[var(--border)]">
        <div className="text-center mb-12 animate-slide-up">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-rose-500 tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 mb-4">
            Economics
          </span>
          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
            Where the Money <span className="gradient-text-rose">Hemorrhages.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {COST_DRIVERS.map((driver, i) => (
            <div key={i} className="cyber-card p-6 animate-slide-up" style={{ animationDelay: `${0.1 * i}s` }}>
              <div className="flex items-start gap-3 mb-3">
                <div className={`px-2 py-1 rounded font-mono text-[9px] font-bold uppercase tracking-widest ${driver.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
                  {driver.severity}
                </div>
              </div>
              <h4 className="font-bold text-[var(--text-primary)] mb-2">{driver.driver}</h4>
              <p className="text-2xl font-black text-rose-400 font-mono mb-3">{driver.cost}</p>
              <p className="text-sm text-[var(--text-muted)]">{driver.example}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Industry Deep Dives */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 border-t border-[var(--border)]">
        <div className="text-center mb-12 animate-slide-up">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-cyan-500 tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 mb-4">
            Sector Analysis
          </span>
          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
            Across Industries: The <span className="gradient-text-emerald">Same Story.</span>
          </h2>
        </div>

        <div className="space-y-8 mt-8">
          {INDUSTRY_SCENARIOS.map((scenario, idx) => (
            <div key={idx} className="cyber-card p-8 animate-slide-up" style={{ animationDelay: `${0.15 * idx}s` }}>
              <h3 className="font-black text-xl text-[var(--text-primary)] mb-4">{scenario.title}</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">The Pain</p>
                  <p className="text-sm text-[var(--text-muted)]">{scenario.pain}</p>
                </div>
                <div>
                  <p className="text-xs font-mono font-bold text-rose-500 uppercase tracking-wider mb-2">Traditional Path</p>
                  <p className="text-lg font-bold text-rose-400">{scenario.traditional}</p>
                </div>
                <div>
                  <p className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-wider mb-2">With MEND-X</p>
                  <p className="text-lg font-bold text-emerald-400">{scenario.mendx}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border)]">
                <p className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 16.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm-1.207-5.351a6 6 0 11-8.485-8.486 6 6 0 018.485 8.486z" clipRule="evenodd" /></svg>
                  Annual Recovery: <span className="text-amber-300 font-mono font-black">{scenario.saved}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Solution */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 border-t border-[var(--border)]">
        <div className="text-center mb-16 animate-slide-up">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-emerald-500 tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-4">
            The Answer
          </span>
          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
            MEND-X: Six Pillars of <span className="gradient-text-emerald">Resolution.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SOLUTION_PILLARS.map((pillar, i) => (
            <div key={i} className="cyber-card p-8 animate-slide-up" style={{ animationDelay: `${0.1 * i}s` }}>
              <h3 className="font-black text-lg text-[var(--text-primary)] mb-3">{pillar.title}</h3>
              <p className="text-sm text-[var(--text-muted)] mb-6">{pillar.desc}</p>
              <ul className="space-y-2">
                {pillar.metrics.map((m, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-24">
        <div className="glass rounded-[2rem] p-10 sm:p-16 text-center border-emerald-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] mb-6 relative z-10">
            The Crisis Ends<br />When Troubleshooting Accelerates.
          </h2>
          <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-xl mx-auto mb-10 relative z-10 leading-relaxed">
            Stop betting on manual searches. Start leveraging precise, cited, sub-8-second diagnostics backed by the entire universe of OEM manuals.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm text-[var(--bg-base)] bg-emerald-500 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              Launch Console
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/architecture"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm border border-[var(--border)] text-[var(--text-primary)] hover:border-emerald-500/50 transition-colors flex items-center justify-center gap-2"
            >
              Explore Architecture
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

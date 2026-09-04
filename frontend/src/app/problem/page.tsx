"use client";

import React, { useState } from "react";
import Link from "next/link";
import LandingLayout from "@/components/landing/LandingLayout";

const PROBLEMS = [
  {
    id: "downtime",
    title: "Unplanned Downtime is Industry's Silent Killer",
    tag: "CORE PROBLEM 01",
    tagColor: "#ef4444",
    content: [
      "According to Aberdeen Research, unplanned downtime costs industrial manufacturing plants an average of $260,000 per hour. Across automotive, aerospace, food processing, and semiconductor fabrication, a single production line halt can cascade into entire shift losses.",
      "In 2023, Ford's Michigan Assembly Plant lost an estimated $2.1M in a single shift due to a PLC communication fault that took maintenance 6 hours to diagnose because the relevant manual chapter was buried on page 412 of a 900-page PDF no one could locate.",
      "The hardware almost always works. The bottleneck is the knowledge retrieval layer.",
    ],
    stat: { value: "$260K", label: "Per hour, unplanned downtime cost" },
  },
  {
    id: "documentation",
    title: "1,000-Page PDF Labyrinths",
    tag: "CORE PROBLEM 02",
    tagColor: "#f59e0b",
    content: [
      "Modern industrial machines ship with service manuals that span hundreds to thousands of pages: wiring diagrams, error code tables, torque specs, calibration procedures, PPE requirements, parts lists. They exist as unindexed, unstructured PDFs.",
      "Technicians lack full-text search that understands mechanical context. The index on page 900 says 'E-502: See Appendix C'. Appendix C cross-references Section 7.3. Section 7.3 references Figure 44b in the electrical schematic sub-manual that is in a different binder.",
      "42% of equipment breakdowns are directly caused by documentation failure — not mechanical failure.",
    ],
    stat: { value: "4.5h", label: "Average time to locate the correct procedure" },
  },
  {
    id: "hallucination",
    title: "Standard LLMs Are Actively Dangerous Here",
    tag: "CORE PROBLEM 03",
    tagColor: "#8b5cf6",
    content: [
      "The obvious response is: 'use ChatGPT'. This will get someone killed. Standard generative LLMs hallucinate plausible-sounding technical details. They fabricate torque values, invent wiring pin assignments, and produce steps that sound correct but will destroy a harmonic drive or cause a high-voltage arc fault.",
      "We tested GPT-4o on a KUKA KR210 axis 4 overload fault. It gave a confident, structured, wrong answer: it recommended disconnecting a servo brake capacitor that does not exist in the Rev-G hardware revision. A technician acting on this would cause a free-fall collapse of the arm.",
      "In safety-critical industrial environments, hallucination is not an inconvenience. It is a liability, a safety violation, and potentially a fatality.",
    ],
    stat: { value: "0%", label: "Hallucination tolerance in industrial maintenance" },
  },
];

const SOLUTIONS = [
  {
    label: "Strict RAG Grounding",
    desc: "Every token in every MEND-X response is anchored to a specific chunk retrieved from the actual OEM manual. If the information is not in the indexed document, the engine refuses to answer.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: "Page-Level Citations",
    desc: "Every answer cites the exact manual name, section, and page number. Technicians can verify the source with a single click. Compliance officers have full audit trails.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Safety-First Output Structure",
    desc: "Hazard classes are extracted and displayed before any procedural step. High-voltage, thermal, hydraulic pressure, and chemical hazards are flagged with mandatory PPE requirements.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    label: "Active Disambiguation",
    desc: "When a fault code matches multiple subsystems or machine generations, MEND-X asks clarifying questions. It never guesses which assembly you are working on.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Three-Tier LLM Routing",
    desc: "Query complexity is scored and routed to NORD (fast edge), FORGE (balanced production), or APEX (deep reasoning). Resource efficiency is built into the protocol, not bolted on.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
  },
  {
    label: "Fleet-Wide Multi-Machine",
    desc: "A single deployment indexes every machine on the shop floor — Haas CNCs, Siemens PLCs, KUKA robots, injection molders — under isolated, access-controlled machine tenants.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
];

export default function ProblemPage() {
  const [activeTab, setActiveTab] = useState("downtime");
  const active = PROBLEMS.find((p) => p.id === activeTab) ?? PROBLEMS[0];

  return (
    <LandingLayout>
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid opacity-15" />
      <div className="fixed top-1/4 left-0 w-[500px] h-[500px] bg-red-700/8 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* ─── Header ─── */}
      <div className="relative z-10 pt-28 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.06]">
        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em]">Problem & Solution</span>
        <h1 className="font-black text-4xl sm:text-6xl text-white tracking-tight leading-tight mt-3 mb-4">
          Why factories still<br />
          <span className="text-red-400">burn millions</span> on<br />
          breakdowns.
        </h1>
        <p className="text-slate-400 text-base max-w-xl">
          MEND-X was not built to be clever. It was built to solve a specific, expensive, preventable problem that the industrial sector has tolerated for decades.
        </p>
      </div>

      {/* ─── Problem Explorer ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: problem tabs */}
          <div className="lg:w-64 flex-shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
            {PROBLEMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={`flex-shrink-0 text-left px-4 py-3 rounded-xl border text-xs font-semibold transition-all ${
                  activeTab === p.id
                    ? "bg-white/[0.06] border-white/[0.15] text-white"
                    : "bg-transparent border-white/[0.04] text-slate-500 hover:text-slate-300 hover:border-white/[0.08]"
                }`}
              >
                <div className="font-mono text-[9px] mb-1" style={{ color: p.tagColor, opacity: 0.8 }}>
                  {p.tag}
                </div>
                {p.title}
              </button>
            ))}
          </div>

          {/* Right: problem body */}
          <div className="flex-1 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 sm:p-10">
            <div
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase tracking-widest mb-6 border"
              style={{ color: active.tagColor, background: `${active.tagColor}10`, borderColor: `${active.tagColor}30` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: active.tagColor }} />
              {active.tag}
            </div>

            <h2 className="font-black text-2xl sm:text-3xl text-white mb-6 leading-tight">{active.title}</h2>

            <div className="space-y-4 text-sm text-slate-400 leading-relaxed mb-8">
              {active.content.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Stat callout */}
            <div
              className="inline-flex items-center gap-4 px-6 py-4 rounded-xl border"
              style={{ background: `${active.tagColor}08`, borderColor: `${active.tagColor}20` }}
            >
              <span className="font-black text-3xl font-mono" style={{ color: active.tagColor }}>
                {active.stat.value}
              </span>
              <span className="text-xs text-slate-400">{active.stat.label}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Solution Grid ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
        <div className="mb-12">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em]">The Answer</span>
          <h2 className="font-black text-3xl sm:text-5xl text-white tracking-tight mt-3 mb-4">
            MEND-X solves each problem<br />
            with a deliberate mechanism.
          </h2>
          <p className="text-slate-400 text-sm max-w-lg">
            Not a collection of features — a coherent engineering response to a coherent industrial failure pattern.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SOLUTIONS.map((sol) => (
            <div
              key={sol.label}
              className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-indigo-500/25 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:bg-indigo-500/15 transition-colors">
                {sol.icon}
              </div>
              <h3 className="font-bold text-sm text-white mb-2">{sol.label}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{sol.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/workflow"
            className="inline-flex items-center gap-2 text-xs font-semibold font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            See the full workflow →
          </Link>
        </div>
      </section>
    </LandingLayout>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import LandingLayout from "@/components/landing/LandingLayout";

/* ── Live Animated Terminal ── */
const TERMINAL_SEQUENCE: { role: "user" | "system" | "ai"; text: string; delay: number }[] = [
  { role: "system", text: "MEND-X DIAGNOSTIC ENGINE ONLINE — v1.1.1", delay: 0 },
  { role: "system", text: "Vector store connected. 3 machines indexed.", delay: 600 },
  { role: "user", text: "Machine: Haas VF-4 CNC | Query: Alarm 102, spindle overheat", delay: 1400 },
  { role: "system", text: "Embedding query... [▓▓▓▓▓▓▓▓░░] 82%", delay: 2200 },
  { role: "system", text: "Searching pgvector namespace: haas_vf4... 8 chunks retrieved.", delay: 3000 },
  { role: "system", text: "Similarity scores: [0.97, 0.94, 0.92, 0.89, ...]", delay: 3600 },
  { role: "system", text: "Routing to FORGE (complexity_score: 0.61)", delay: 4200 },
  { role: "ai", text: "⚠ HAZARD: Allow 20min cooldown. High thermal risk. Wear heat gloves.", delay: 5000 },
  { role: "ai", text: "STEP 1: Check spindle chiller pressure. Expected 2.2–2.6 bar.", delay: 5700 },
  { role: "ai", text: "STEP 2: Clear mesh intake filters (40 PSI dry air, reverse direction).", delay: 6400 },
  { role: "ai", text: "STEP 3: Verify thermistor @ J8 pins 4&5. Normal: 10.2 kΩ.", delay: 7100 },
  { role: "system", text: "CITATION: Haas VF-Series Maintenance Manual Rev.G — Page 84", delay: 7900 },
  { role: "system", text: "CONFIDENCE: 99.4% | TIME: 8.2s | MODEL: FORGE", delay: 8500 },
];

const PHASES = [
  {
    id: "ingest",
    phase: "01",
    label: "Document Ingestion",
    tagline: "OEM PDF → Structured Knowledge",
    color: "#6366f1",
    icon: "📄",
    steps: [
      {
        title: "Admin uploads PDF",
        desc: "Drag-and-drop or API upload of OEM service manual. Admin tags machine ID, model, serial range, and manual revision.",
        detail: "Supported: scanned PDFs (with OCR), native digital PDFs, mixed-format binders up to 2,000 pages."
      },
      {
        title: "PyMuPDF extraction",
        desc: "Page-by-page text extraction. Tables, wiring diagrams, and figure captions are preserved as structured data, not discarded.",
        detail: "Error code tables are extracted as key-value pairs. Section hierarchy (H1 → H4) is preserved for later semantic context."
      },
      {
        title: "Semantic chunking",
        desc: "Pages are split into overlapping 512-token windows. Safety blocks, procedural steps, and error tables are identified as discrete semantic units.",
        detail: "Overlap: 128 tokens. Minimum chunk: 100 tokens. Maximum: 600 tokens (hard cap to preserve retrieval precision)."
      },
      {
        title: "Vector embedding",
        desc: "Each chunk is encoded into a 1536-dimension dense vector using a text-embedding model. Machine ID is attached as a namespace tag.",
        detail: "Stored in PostgreSQL with pgvector extension. Chunk metadata (manual_id, page, section, machine_id) stored in a linked relational table."
      },
    ],
  },
  {
    id: "query",
    phase: "02",
    label: "Query & Retrieval",
    tagline: "Natural Language → Verified Chunks",
    color: "#f59e0b",
    icon: "🔍",
    steps: [
      {
        title: "Operator submits query",
        desc: "Technician selects machine from dropdown and types symptom or error code in natural language. No query syntax required.",
        detail: "Machine selection scopes the vector search to that machine's namespace, preventing cross-manual contamination."
      },
      {
        title: "Query embedding",
        desc: "The operator's query is embedded into the same vector space as the manual chunks using the identical embedding model.",
        detail: "This ensures semantic similarity is computed in the same representation space as the stored knowledge."
      },
      {
        title: "pgvector ANN search",
        desc: "Approximate nearest-neighbor cosine similarity search returns the top-8 most relevant chunks from the selected machine's namespace.",
        detail: "If max similarity < 0.72, the engine enters refusal mode and informs the operator the information is not in the indexed manual."
      },
      {
        title: "Complexity scoring",
        desc: "The query and retrieved chunks are scored for complexity. Score 0–0.35 → NORD. 0.35–0.70 → FORGE. 0.70+ → APEX.",
        detail: "Complexity factors: number of procedural steps, presence of safety hazard flags, multiple cross-references, and query ambiguity score."
      },
    ],
  },
  {
    id: "generate",
    phase: "03",
    label: "Generation & Output",
    tagline: "Chunks → Verified Protocol",
    color: "#10b981",
    icon: "⚡",
    steps: [
      {
        title: "Constrained LLM synthesis",
        desc: "The LLM receives only the retrieved chunks as context. A strict system prompt prohibits any extrapolation from parametric memory.",
        detail: "The LLM is instructed to output structured JSON: safety_alerts[], steps[], citations[], confidence_score."
      },
      {
        title: "Safety extraction",
        desc: "Hazard classes (thermal, high-voltage, hydraulic, chemical) are parsed from the generated output and displayed first in the UI.",
        detail: "PPE requirements are linked to specific steps, not shown as a generic disclaimer. Each step carries its own safety class."
      },
      {
        title: "Citation attachment",
        desc: "Every procedural step is linked to the specific chunk it was derived from, which contains the manual name, page number, and section.",
        detail: "The raw chunk text is stored as a collapsible citation in the UI so technicians can read the exact OEM source text."
      },
      {
        title: "Structured UI rendering",
        desc: "The response is rendered as an ordered procedure card: hazard banner, numbered steps with sub-detail, citations panel, confidence badge.",
        detail: "Disambiguation cards appear when the query matched multiple machine types. The operator selects the correct machine before generation."
      },
    ],
  },
];

function TerminalAnimation() {
  const [visible, setVisible] = useState<typeof TERMINAL_SEQUENCE>([]);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    TERMINAL_SEQUENCE.forEach((item) => {
      setTimeout(() => {
        if (!cancelled) setVisible((prev) => [...prev, item]);
      }, item.delay);
    });
    return () => { cancelled = true; };
  }, [started]);

  return (
    <div ref={ref} className="font-mono text-xs leading-relaxed h-80 overflow-y-auto chat-scroll">
      {visible.map((item, i) => (
        <div
          key={i}
          className={`mb-1.5 ${
            item.role === "user"
              ? "text-indigo-300"
              : item.role === "ai"
              ? "text-emerald-300"
              : "text-slate-500"
          }`}
        >
          <span className="text-slate-600 mr-2 select-none">
            {item.role === "user" ? "OPERATOR ›" : item.role === "ai" ? "MEND-X ›" : "SYS ›"}
          </span>
          {item.text}
        </div>
      ))}
      {started && visible.length < TERMINAL_SEQUENCE.length && (
        <div className="flex items-center gap-1 mt-1">
          <div className="w-2 h-4 bg-emerald-400 animate-pulse" />
        </div>
      )}
    </div>
  );
}

export default function WorkflowPage() {
  const [activePhase, setActivePhase] = useState("ingest");
  const [activeStep, setActiveStep] = useState(0);
  const phase = PHASES.find((p) => p.id === activePhase)!;

  return (
    <LandingLayout>
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid opacity-15" />
      <div className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-800/8 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 pt-28 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.06]">
        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em]">How It Works</span>
        <h1 className="font-black text-4xl sm:text-6xl text-white tracking-tight leading-tight mt-3 mb-4">
          From PDF upload<br />
          <span className="text-emerald-400">to verified answer</span><br />
          in 8 seconds.
        </h1>
        <p className="text-slate-400 text-base max-w-xl">
          Every step of the MEND-X diagnostic pipeline is auditable, deterministic, and grounded. No magic. No guessing. Here is exactly what happens.
        </p>
      </div>

      {/* ─── Live Terminal Demo ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-b border-white/[0.05]">
        <div className="mb-8">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em]">Live Simulation</span>
          <h2 className="font-black text-2xl sm:text-3xl text-white mt-2">Watch the engine run</h2>
          <p className="text-slate-400 text-sm mt-2">Scroll here to trigger. The complete query cycle plays in real time below.</p>
        </div>

        <div className="rounded-2xl border border-indigo-500/25 bg-[#0a0c14]/90 overflow-hidden max-w-3xl">
          {/* Terminal bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-[#080911]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="font-mono text-[11px] text-slate-500 ml-2">MEND-X — DIAGNOSTIC CONSOLE</span>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
              LIVE TRACE
            </span>
          </div>
          <div className="p-5">
            <TerminalAnimation />
          </div>
        </div>
      </section>

      {/* ─── Interactive 3-Phase Workflow ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-b border-white/[0.05]">
        <div className="mb-10">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em]">Phase-by-Phase</span>
          <h2 className="font-black text-2xl sm:text-3xl text-white mt-2">The three operational phases</h2>
        </div>

        {/* Phase selectors */}
        <div className="flex flex-wrap gap-3 mb-8">
          {PHASES.map((p) => (
            <button
              key={p.id}
              onClick={() => { setActivePhase(p.id); setActiveStep(0); }}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border text-xs font-bold transition-all ${
                activePhase === p.id
                  ? "text-white border-white/[0.15] bg-white/[0.06]"
                  : "text-slate-500 border-white/[0.05] hover:text-slate-300"
              }`}
            >
              <span className="text-base">{p.icon}</span>
              <div className="text-left">
                <div className="font-mono text-[9px] opacity-60">{p.phase}</div>
                <div>{p.label}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Phase content */}
        <div
          className="rounded-2xl border p-7 sm:p-10"
          style={{ background: `${phase.color}06`, borderColor: `${phase.color}20` }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono font-black text-5xl opacity-10">{phase.phase}</span>
            <div>
              <h3 className="font-black text-xl text-white">{phase.label}</h3>
              <p className="text-xs font-mono" style={{ color: phase.color }}>{phase.tagline}</p>
            </div>
          </div>

          {/* Step list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {phase.steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(activeStep === i ? -1 : i)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  activeStep === i
                    ? "border-white/[0.15] bg-white/[0.05]"
                    : "border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded font-mono text-[11px] font-black flex items-center justify-center mt-0.5"
                      style={{ background: `${phase.color}20`, color: phase.color }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-sm text-white">{step.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                      {activeStep === i && (
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed border-t border-white/[0.06] pt-2">
                          ↳ {step.detail}
                        </p>
                      )}
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 flex-shrink-0 text-slate-600 transition-transform ${activeStep === i ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Key Timings ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="mb-10">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em]">Performance</span>
          <h2 className="font-black text-2xl sm:text-3xl text-white mt-2">Timing Breakdown</h2>
        </div>

        <div className="max-w-2xl space-y-3">
          {[
            { label: "Query embedding", time: "~80ms", pct: 8, color: "#6366f1" },
            { label: "pgvector ANN search", time: "~350ms", pct: 20, color: "#8b5cf6" },
            { label: "Tier routing + prompt assembly", time: "~120ms", pct: 10, color: "#a78bfa" },
            { label: "NORD generation (low-tier)", time: "~400ms", pct: 25, color: "#3b82f6" },
            { label: "FORGE generation (mid-tier)", time: "~2.2s", pct: 60, color: "#f59e0b" },
            { label: "APEX generation (high-tier)", time: "~6.5s", pct: 100, color: "#8b5cf6" },
            { label: "Output parse + citation render", time: "~90ms", pct: 7, color: "#10b981" },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-4">
              <div className="w-52 text-xs text-slate-400 flex-shrink-0">{row.label}</div>
              <div className="flex-1 bg-white/[0.04] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${row.pct}%`, background: row.color }}
                />
              </div>
              <div className="font-mono text-xs text-slate-300 w-16 text-right flex-shrink-0">{row.time}</div>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap gap-4">
          <Link
            href="/dashboard"
            className="px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Try the Live Console
          </Link>
          <Link
            href="/architecture"
            className="px-7 py-3.5 rounded-xl text-sm font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
          >
            Full Architecture →
          </Link>
        </div>
      </section>
    </LandingLayout>
  );
}

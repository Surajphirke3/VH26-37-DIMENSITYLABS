"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LandingLayout from "@/components/landing/LandingLayout";
import { useTheme } from "@/lib/theme-context";

const TECH_STACK = [
  { name: "Next.js 16", role: "Frontend", detail: "React 19 App Router, SSR + CSR, TailwindCSS v4", color: "#e2e8f0" },
  { name: "FastAPI", role: "Backend API", detail: "Async Python, OpenAPI docs, lifespan events, CORS", color: "#009688" },
  { name: "PostgreSQL", role: "Primary DB", detail: "User auth, machine registry, manual metadata storage", color: "#336791" },
  { name: "pgvector", role: "Vector Store", detail: "Cosine similarity ANN search across embedded PDF chunks", color: "#6366f1" },
  { name: "PyMuPDF", role: "PDF Engine", detail: "Page extraction, table preservation, figure detection", color: "#f59e0b" },
  { name: "OpenRouter", role: "LLM Gateway", detail: "Unified API across Groq, Google, Anthropic model families", color: "#8b5cf6" },
];

const DATA_FLOW = [
  { step: "01", label: "Admin uploads OEM PDF", detail: "Drag-drop upload with metadata tagging (machine ID, model, serial, revision year).", color: "#6366f1" },
  { step: "02", label: "PyMuPDF page extraction", detail: "Text, tables, and figure captions extracted page-by-page. Heading hierarchy preserved.", color: "#8b5cf6" },
  { step: "03", label: "Semantic chunking", detail: "Pages split into overlapping semantic windows. Error codes, steps, and safety blocks identified.", color: "#a78bfa" },
  { step: "04", label: "Embedding generation", detail: "Each chunk encoded via text-embedding-3-small (OpenAI) or equivalent. 1536-dim vectors.", color: "#10b981" },
  { step: "05", label: "pgvector storage", detail: "Vectors stored with chunk metadata: manual ID, page number, section, machine tenant.", color: "#059669" },
  { step: "06", label: "Operator query", detail: "Technician types symptom or error code. Machine context provided via dropdown selector.", color: "#f59e0b" },
  { step: "07", label: "Vector similarity search", detail: "Query embedded. pgvector cosine ANN retrieves top-K chunks from that machine's namespace.", color: "#f59e0b" },
  { step: "08", label: "Tier routing", detail: "Query complexity scored (keyword-only → NORD; multi-step → FORGE; root-cause → APEX).", color: "#ef4444" },
  { step: "09", label: "Constrained generation", detail: "LLM synthesizes structured answer. System prompt prohibits extrapolation beyond retrieved context.", color: "#ef4444" },
  { step: "10", label: "Citation + output", detail: "Safety alerts extracted. Steps numbered. Source page cited. Confidence score displayed.", color: "#e2e8f0" },
];

const MODELS = [
  {
    name: "NORD",
    model: "Groq / Llama 3.1 8B Instant",
    latency: "<100ms",
    logoDark: "/nord-dark.png",
    logoLight: "/nord-light.png",
    color: "#3b82f6",
    useCases: ["Error code single-lookup", "Binary yes/no fault checks", "Offline / edge PLC environments", "High-frequency query volume"],
    avoid: ["Multi-step repair procedures", "Root cause analysis", "Safety-critical decisions"],
  },
  {
    name: "FORGE",
    model: "Google Gemini 2.0 Flash",
    latency: "1–3s",
    logoDark: "/forge-dark.png",
    logoLight: "/forge-light.png",
    color: "#f59e0b",
    useCases: ["Multi-step repair procedures", "Component cross-references", "Calibration sequences", "Mid-tier maintenance tasks"],
    avoid: ["Root cause analysis on ambiguous data", "Safety-critical arc-flash environments"],
  },
  {
    name: "APEX",
    model: "Anthropic Claude Sonnet 3.5",
    latency: "3–8s",
    logoDark: "/apex-dark.png",
    logoLight: "/apex-light.png",
    color: "#8b5cf6",
    useCases: ["Root cause analysis", "Safety-critical systems (aerospace / high-voltage)", "Cross-subsystem fault trees", "Engineering-level diagnostics"],
    avoid: ["Nothing — this is the maximum tier"],
  },
];

export default function ArchitecturePage() {
  const { theme } = useTheme();
  const [selectedModel, setSelectedModel] = useState("FORGE");
  const model = MODELS.find((m) => m.name === selectedModel)!;

  return (
    <LandingLayout>
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid opacity-15" />
      <div className="fixed top-1/3 right-0 w-[600px] h-[600px] bg-indigo-800/8 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 pt-28 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-200 dark:border-white/[0.06]">
        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em]">System Architecture</span>
        <h1 className="font-black text-4xl sm:text-6xl text-slate-900 dark:text-white tracking-tight leading-tight mt-3 mb-4">
          How it works<br />
          <span className="text-indigo-600 dark:text-indigo-400">under the hood.</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base max-w-xl">
          A full walkthrough of the MEND-X technical architecture: the RAG pipeline, three-tier LLM system, data flow, and each technology's role.
        </p>
      </div>

      {/* ─── Tech Stack Table ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-b border-slate-200 dark:border-white/[0.05]">
        <div className="mb-10">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em]">Stack</span>
          <h2 className="font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-2">Technology Inventory</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TECH_STACK.map((tech) => (
            <div
              key={tech.name}
              className="p-5 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04] shadow-sm dark:shadow-none transition-all flex items-start gap-4"
            >
              <div
                className="w-1.5 flex-shrink-0 rounded-full self-stretch"
                style={{ background: tech.color }}
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{tech.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
                    {tech.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{tech.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Data Flow ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-b border-slate-200 dark:border-white/[0.05]">
        <div className="mb-10">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em]">Pipeline</span>
          <h2 className="font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-2">10-Step Data Flow</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-lg">
            From PDF upload to structured, cited answer — every step is deterministic, auditable, and grounded.
          </p>
        </div>

        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-indigo-600/60 via-emerald-600/40 to-red-600/40 hidden sm:block" />

          <div className="space-y-3">
            {DATA_FLOW.map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-5 p-4 rounded-xl border border-slate-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:border-slate-300 dark:hover:border-white/[0.1] shadow-sm dark:shadow-none transition-all group"
              >
                {/* Step number node */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg font-mono font-black text-xs flex items-center justify-center border relative z-10"
                  style={{ background: `${item.color}15`, borderColor: `${item.color}30`, color: item.color }}
                >
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">{item.label}</h3>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Three-Tier Model Deep Dive ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-b border-slate-200 dark:border-white/[0.05]">
        <div className="mb-10">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em]">Intelligence Routing</span>
          <h2 className="font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-2">Three LLM Tiers, One Query Router</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-lg">
            Query complexity is scored at runtime. The router selects the appropriate tier. Cost and latency are minimized without sacrificing accuracy.
          </p>
        </div>

        {/* Tab selectors */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          {MODELS.map((m) => (
            <button
              key={m.name}
              onClick={() => setSelectedModel(m.name)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                selectedModel === m.name
                  ? "text-slate-900 dark:text-white border-indigo-400/50 dark:border-white/[0.15] bg-indigo-50 dark:bg-white/[0.06] shadow-sm dark:shadow-none"
                  : "text-slate-500 border-slate-200 dark:border-white/[0.05] hover:text-slate-900 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.1]"
              }`}
            >
              <Image
                src={theme === "light" ? m.logoLight : m.logoDark}
                alt={m.name}
                width={52}
                height={22}
                style={{ width: "auto", height: "auto" }}
                className="object-contain"
              />
            </button>
          ))}
        </div>

        {/* Active model detail */}
        <div
          className="rounded-2xl p-7 sm:p-10 border grid grid-cols-1 md:grid-cols-2 gap-8 transition-all bg-white dark:bg-transparent shadow-sm dark:shadow-none"
          style={{ borderColor: `${model.color}30` }}
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={theme === "light" ? model.logoLight : model.logoDark}
                alt={model.name}
                width={100}
                height={44}
                style={{ width: "auto", height: "auto" }}
                className="object-contain"
              />
            </div>
            <div className="font-mono text-xs text-slate-500 mb-1">Underlying Model</div>
            <div className="font-bold text-sm text-slate-900 dark:text-white mb-4">{model.model}</div>
            <div className="font-mono text-xs text-slate-500 mb-1">Typical Latency</div>
            <div className="font-black text-2xl font-mono mb-6" style={{ color: model.color }}>{model.latency}</div>

            <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-3">Best used for</div>
            <ul className="space-y-2">
              {model.useCases.map((u) => (
                <li key={u} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: model.color }} />
                  {u}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-3">Not recommended for</div>
            <ul className="space-y-2 mb-8">
              {model.avoid.map((a) => (
                <li key={a} className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500/60 flex-shrink-0" />
                  {a}
                </li>
              ))}
            </ul>

            {/* Routing decision visual */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] font-mono text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Query Router Logic</div>
              <div className={`${model.name === "NORD" ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-400 dark:text-slate-600"}`}>if complexity_score &lt; 0.35 → NORD</div>
              <div className={`${model.name === "FORGE" ? "text-amber-600 dark:text-amber-400 font-bold" : "text-slate-400 dark:text-slate-600"}`}>elif complexity_score &lt; 0.70 → FORGE</div>
              <div className={`${model.name === "APEX" ? "text-violet-600 dark:text-violet-400 font-bold" : "text-slate-400 dark:text-slate-600"}`}>else → APEX</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Hallucination Defense ─── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="max-w-4xl">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em]">Safety Mechanism</span>
          <h2 className="font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-3 mb-6">Hallucination Defense Architecture</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "Context-Constrained Prompts",
                body: "The LLM system prompt contains only the retrieved chunks. The model is explicitly instructed to answer only from the provided context, never from parametric memory.",
                code: `system_prompt = """
Answer ONLY from CONTEXT below.
If context lacks info: refuse.
Do NOT use prior knowledge.
CONTEXT:
{retrieved_chunks}
"""`
              },
              {
                title: "Refusal Circuit",
                body: "When retrieved chunks have cosine similarity below threshold (0.72), MEND-X refuses to answer and informs the operator that the information is not in the indexed manual.",
                code: `if max_similarity < 0.72:
  return RefusalResponse(
    reason="below_threshold",
    message="Not in manual"
  )`
              },
              {
                title: "Confidence Scoring",
                body: "The UI displays a confidence score computed from retrieval similarity and chunk density. Operators are warned when confidence is marginal.",
                code: `confidence = (
  retrieval_score * 0.7 +
  chunk_density_score * 0.3
)`
              },
              {
                title: "Machine Namespace Isolation",
                body: "Vectors are partitioned by machine_id. A Haas CNC query cannot accidentally retrieve a Siemens PLC manual chunk, preventing cross-contamination.",
                code: `WHERE machine_id = $1
ORDER BY embedding <=> $2
LIMIT 8`
              },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] shadow-sm dark:shadow-none">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">{item.body}</p>
                <pre className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-slate-900 dark:bg-black/40 text-emerald-400 rounded-lg p-3 overflow-x-auto leading-relaxed">
                  {item.code}
                </pre>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/workflow"
            className="inline-flex items-center gap-2 text-xs font-semibold font-mono text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
          >
            See the workflow step by step →
          </Link>
        </div>
      </section>
    </LandingLayout>
  );
}

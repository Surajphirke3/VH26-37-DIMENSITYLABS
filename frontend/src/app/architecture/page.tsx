"use client";

import React, { useState } from "react";
import Link from "next/link";
import LandingLayout from "@/components/landing/LandingLayout";
import LiveArchitectureFlowchart from "@/components/architecture/LiveArchitectureFlowchart";

const PIPELINE_STAGES = [
  {
    stage: "Document Ingestion",
    desc: "PyMuPDF extracts text + table structure from 1.2M+ OEM manual PDFs. Automatic schema inference detects headers, procedures, tables, cross-references.",
    details: ["Batch processing: 100K+ pages/hour", "Preserves visual hierarchy", "Auto-detects component/part numbers"]
  },
  {
    stage: "Deterministic Chunking",
    desc: "512-token chunks with 128-token overlap. Boundaries preserve semantic units (procedures, fault trees, tables). No semantic drift.",
    details: ["Overlap prevents context loss", "Aligned to sentence/paragraph boundaries", "Preserves nested structure"]
  },
  {
    stage: "Vector Embedding",
    desc: "OpenAI text-embedding-3-small (1536-dim). One embedding per chunk. Dense, language-agnostic representation optimized for retrieval.",
    details: ["1536-dimensional vectors", "Cosine distance metric", "Batch embedded at ingestion"]
  },
  {
    stage: "pgvector ANN Index",
    desc: "PostgreSQL pgvector extension indexes all embeddings. Cosine similarity ANN search (<100ms for 1M vectors).",
    details: ["Approximate Nearest Neighbor search", "HNSW index acceleration", "Tenant isolation by machine_id"]
  },
  {
    stage: "Similarity Threshold",
    desc: "Cosine similarity ≥ 0.72 triggers response. Below threshold: refusal circuit activates, asks for clarification.",
    details: ["0.72 cutoff eliminates false matches", "Refusal > hallucination", "User gets clarification prompts"]
  },
  {
    stage: "LLM Routing & Reasoning",
    desc: "NORD/FORGE/APEX cascade. Top-k retrieved chunks passed to selected model. Response structured + cited.",
    details: ["Adaptive model selection", "Context-limited prompts", "Inline page citations"]
  }
];

const LATENCY_BREAKDOWN = [
  { phase: "Query Ingestion", time: "<10ms", detail: "API gateway processing" },
  { phase: "pgvector ANN Search", time: "40–80ms", detail: "Cosine NN search (1M vectors)" },
  { phase: "NORD Inference", time: "<100ms", detail: "Llama 3.1 8B on edge" },
  { phase: "FORGE Inference", time: "1–3s", detail: "Gemini 2.0 Flash + streaming" },
  { phase: "APEX Inference", time: "3–8s", detail: "Claude Sonnet 3.5 reasoning" },
  { phase: "Response Serialization", time: "<5ms", detail: "JSON + streaming overhead" }
];

const SECURITY_LAYERS = [
  {
    layer: "Input Sanitization",
    threat: "Prompt injection / malicious queries",
    mitigation: "Query scoped to manual domain. Refusal circuit rejects out-of-scope prompts. No code execution."
  },
  {
    layer: "Tenant Isolation",
    threat: "Cross-tenant data leakage",
    mitigation: "pgvector search scoped by machine_id. Vectors of Machine A never surface in Machine B queries."
  },
  {
    layer: "Encryption in Transit",
    threat: "Network eavesdropping",
    mitigation: "TLS 1.3 on all tiers. Edge (NORD) uses mTLS. APEX (reasoning) zero-knowledge proofs available."
  },
  {
    layer: "Encryption at Rest",
    threat: "Stolen database access",
    mitigation: "AES-256 vector store. Audit logs immutable. GDPR-compliant data residency options."
  },
  {
    layer: "Access Control",
    threat: "Unauthorized API use",
    mitigation: "API key + RBAC. Role-based machine access. Signature-enforced audit trails."
  }
];

const DEPLOYMENT_MODES = [
  {
    name: "Cloud (Default)",
    latency: "1–3s (FORGE tier)",
    dataResidency: "Multi-region pgvector",
    compliance: "SOC 2, GDPR data residency",
    cost: "Per-query pricing",
    bestFor: "Rapid deployment, shared infrastructure"
  },
  {
    name: "Private VPC",
    latency: "500ms–2s (pgvector local)",
    dataResidency: "Customer VPC only",
    compliance: "DO-254, IEC-61508 audit trail",
    cost: "Monthly capacity reservation",
    bestFor: "Automotive, aerospace, energy"
  },
  {
    name: "Air-Gapped (Offline)",
    latency: "<100ms (NORD only)",
    dataResidency: "On-device vectors + local PG",
    compliance: "Zero external egress, no cloud calls",
    cost: "One-time license + maintenance",
    bestFor: "Flight-critical systems, classified environments"
  }
];

const BENCHMARKS = [
  { scenario: "Error Code Lookup (NORD)", avgTime: "67ms", p99: "142ms", throughput: "14,900 q/s", accuracy: "99.2%" },
  { scenario: "Multi-Step Procedure (FORGE)", avgTime: "1.84s", p99: "3.2s", throughput: "542 q/s", accuracy: "97.8%" },
  { scenario: "Root Cause Analysis (APEX)", avgTime: "5.3s", p99: "8.1s", throughput: "189 q/s", accuracy: "99.7%" },
  { scenario: "Cold Start (Cache Miss)", avgTime: "512ms + model latency", p99: "1.2s + model latency", throughput: "N/A", accuracy: "N/A" },
];

export default function ArchitecturePage() {
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  return (
    <LandingLayout>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-grid">
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full orb opacity-20" style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full orb opacity-15" style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", animationDelay: "-5s" }} />
      </div>

      {/* Hero */}
      <section className="relative z-10 pt-40 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full glass border border-[var(--border)] animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25">
            <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4] animate-pulse" />
            <span className="font-mono text-[10px] font-bold text-cyan-600 dark:text-cyan-400 tracking-widest uppercase">Technical Deep Dive</span>
          </div>
        </div>

        <h1 className="font-black text-[clamp(3rem,8vw,6rem)] leading-[1] tracking-tighter uppercase text-[var(--text-primary)] mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          How MEND-X <span className="gradient-text-emerald">Thinks.</span>
        </h1>

        <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-3xl leading-relaxed mb-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          A deterministic, zero-hallucination RAG pipeline backed by pgvector ANN search. Every answer traces back to an OEM manual page. Every millisecond counts.
        </p>
      </section>

      {/* ── Live Workable System Architecture Flowchart ── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <LiveArchitectureFlowchart />
      </section>

      {/* Pipeline Visualization */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 border-t border-[var(--border)]">
        <div className="text-center mb-12 animate-slide-up">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-cyan-500 tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 mb-4">
            Data Pipeline
          </span>
          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
            From PDF to <span className="gradient-text">Instant Answer.</span>
          </h2>
        </div>

        <div className="space-y-3 mt-8">
          {PIPELINE_STAGES.map((stage, idx) => (
            <button
              key={idx}
              onClick={() => setExpandedStage(expandedStage === idx ? null : idx)}
              className="w-full text-left p-6 rounded-xl border border-[var(--border)] glass-hover transition-all group animate-slide-up"
              style={{ animationDelay: `${0.08 * idx}s` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-wider">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-bold text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors">{stage.stage}</h3>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">{stage.desc}</p>
                </div>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${expandedStage === idx ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              {expandedStage === idx && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <ul className="space-y-2">
                    {stage.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Latency Breakdown */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 border-t border-[var(--border)]">
        <div className="text-center mb-12 animate-slide-up">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-blue-500 tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 mb-4">
            Performance Profile
          </span>
          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
            Every Millisecond <span className="gradient-text-emerald">Accounted For.</span>
          </h2>
        </div>

        <div className="overflow-x-auto mt-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 font-black text-[var(--text-primary)]">Phase</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] font-bold text-blue-500 uppercase tracking-widest">Latency</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody>
              {LATENCY_BREAKDOWN.map((row, i) => (
                <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface)]/30 transition-colors">
                  <td className="px-4 py-4 font-semibold text-[var(--text-primary)]">{row.phase}</td>
                  <td className="px-4 py-4 font-mono font-bold text-blue-400">{row.time}</td>
                  <td className="px-4 py-4 text-[var(--text-muted)]">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 cyber-card p-6 bg-blue-950/20 border-blue-800/30">
          <p className="text-sm text-[var(--text-primary)] font-medium">
            <span className="text-blue-400 font-bold">Target SLA:</span> <span className="text-blue-300 font-mono">NORD &lt;100ms, FORGE 1–3s, APEX 3–8s.</span> Caching and model selection ensure sub-second median for 92% of queries.
          </p>
        </div>
      </section>

      {/* Security & Isolation */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 border-t border-[var(--border)]">
        <div className="text-center mb-12 animate-slide-up">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-rose-500 tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 mb-4">
            Defense
          </span>
          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
            Security Through <span className="gradient-text-rose">Architecture.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {SECURITY_LAYERS.map((sec, i) => (
            <div key={i} className="cyber-card p-6 animate-slide-up" style={{ animationDelay: `${0.1 * i}s` }}>
              <h3 className="font-black text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <span className="text-rose-500">🛡</span>
                {sec.layer}
              </h3>
              <p className="text-xs font-mono font-bold text-rose-500 uppercase tracking-wider mb-2">Threat</p>
              <p className="text-sm text-[var(--text-muted)] mb-4">{sec.threat}</p>
              <p className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-wider mb-2">Mitigation</p>
              <p className="text-sm text-[var(--text-muted)]">{sec.mitigation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Deployment Modes */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 border-t border-[var(--border)]">
        <div className="text-center mb-12 animate-slide-up">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-violet-500 tracking-widest bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20 mb-4">
            Flexibility
          </span>
          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
            Deploy Your <span className="gradient-text">Way.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {DEPLOYMENT_MODES.map((mode, i) => (
            <div key={i} className="cyber-card p-8 animate-slide-up" style={{ animationDelay: `${0.15 * i}s` }}>
              <h3 className="font-black text-lg text-[var(--text-primary)] mb-6 pb-4 border-b border-[var(--border)]">{mode.name}</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Latency</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{mode.latency}</p>
                </div>
                <div>
                  <p className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Data Residency</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{mode.dataResidency}</p>
                </div>
                <div>
                  <p className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Compliance</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{mode.compliance}</p>
                </div>
                <div>
                  <p className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Pricing</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{mode.cost}</p>
                </div>
                <div className="pt-4 border-t border-[var(--border)]">
                  <p className="text-xs font-mono font-bold text-violet-500 uppercase tracking-wider mb-1">Best For</p>
                  <p className="text-sm text-[var(--text-muted)]">{mode.bestFor}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benchmarks */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 border-t border-[var(--border)]">
        <div className="text-center mb-12 animate-slide-up">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-amber-500 tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mb-4">
            Verified Performance
          </span>
          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
            Real-World <span className="gradient-text-gold">Benchmarks.</span>
          </h2>
        </div>

        <div className="overflow-x-auto mt-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 font-black text-[var(--text-primary)]">Scenario</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest">Avg Latency</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">P99</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Throughput</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {BENCHMARKS.map((b, i) => (
                <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface)]/30 transition-colors">
                  <td className="px-4 py-4 font-semibold text-[var(--text-primary)]">{b.scenario}</td>
                  <td className="px-4 py-4 font-mono font-bold text-amber-500">{b.avgTime}</td>
                  <td className="px-4 py-4 font-mono text-[var(--text-muted)]">{b.p99}</td>
                  <td className="px-4 py-4 font-mono text-emerald-500">{b.throughput}</td>
                  <td className="px-4 py-4 font-mono text-cyan-400 font-bold">{b.accuracy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-24">
        <div className="glass rounded-[2rem] p-10 sm:p-16 text-center border-cyan-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />

          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] mb-6 relative z-10">
            Precision Built<br />Into the Core.
          </h2>
          <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-xl mx-auto mb-10 relative z-10 leading-relaxed">
            Zero-hallucination RAG, tenant isolation, multi-tier routing, and compliance-ready deployment. Engineering that matches industrial demands.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm text-[var(--bg-base)] bg-cyan-500 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              Experience It
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/workflow"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm border border-[var(--border)] text-[var(--text-primary)] hover:border-cyan-500/50 transition-colors flex items-center justify-center gap-2"
            >
              Workflow
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

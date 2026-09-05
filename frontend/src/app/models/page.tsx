"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LandingLayout from "@/components/landing/LandingLayout";
import { useTheme } from "@/lib/theme-context";

interface ModelSpec {
  name: string;
  tierLabel: string;
  tagline: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  engine: string;
  latency: string;
  contextWindow: string;
  hardwareTarget: string;
  logoLight: string;
  logoDark: string;
  summary: string;
  keyStrengths: string[];
  idealQueries: string[];
  deploymentSpecs: {
    memory: string;
    throughput: string;
    protocol: string;
    edgeReady: boolean;
  };
}

type ModelTierKey = "AUTO" | "QWEN" | "MINI" | "GPT20B" | "GPT120B";

const MODELS_DATA: Record<ModelTierKey, ModelSpec> = {
  AUTO: {
    name: "Auto Round-Robin",
    tierLabel: "TIER 00 · RESILIENT MULTI-PROVIDER",
    tagline: "Dynamic Failover: Ollama Cloud → Local → Groq",
    accentColor: "#10b981",
    accentBg: "rgba(16,185,129,0.08)",
    accentBorder: "rgba(16,185,129,0.25)",
    engine: "Ollama Cloud API / Local Ollama / Groq Fallback",
    latency: "Adaptive (~400ms Cloud / ~2s Local)",
    contextWindow: "128,000 tokens",
    hardwareTarget: "Cloud GPU + Local Edge Hybrid",
    logoLight: "/nord-light.png",
    logoDark: "/nord-dark.png",
    summary:
      "Our most resilient inference setup. Dispatches queries to Ollama Cloud first for high throughput. If network drops or quotas exhaust, it gracefully cascades to your local Ollama daemon, followed by Groq as emergency backup.",
    keyStrengths: [
      "Zero downtime with automatic 3-tier round-robin fallback",
      "Prioritizes fast cloud GPU inference when API key is present",
      "Offline continuity with local Ollama runtime",
      "Strips chain-of-thought tokens cleanly for valid JSON output",
    ],
    idealQueries: [
      "Complex multi-machine error code diagnosis under fluctuating connectivity",
      "Heavy maintenance procedure synthesis with zero downtime requirement",
      "Offline-first industrial troubleshooting on factory floor gateways",
      "Automated sensor telemetry and fault code correlation",
    ],
    deploymentSpecs: {
      memory: "Hybrid / 8 GB RAM local minimum",
      throughput: "300+ tokens/sec (Cloud) / 45 tokens/sec (Local)",
      protocol: "OpenAI-compatible REST + Local Socket",
      edgeReady: true,
    },
  },
  QWEN: {
    name: "Qwen 3.5 9B",
    tierLabel: "TIER 01 · INDUSTRIAL WORKHORSE (OLLAMA)",
    tagline: "High-Accuracy Structured Diagnostics & Multilingual Reasoning",
    accentColor: "#06b6d4",
    accentBg: "rgba(6,182,212,0.08)",
    accentBorder: "rgba(6,182,212,0.25)",
    engine: "Ollama Runtime / qwen3.5:9b",
    latency: "800ms – 1.8s",
    contextWindow: "32,768 tokens",
    hardwareTarget: "Ollama Cloud API / Apple Silicon / On-Prem Workstation",
    logoLight: "/forge-light.png",
    logoDark: "/forge-dark.png",
    summary:
      "State-of-the-art open weights model running natively on Ollama Cloud and local machine. Excels at deep diagnostic logic, multilingual equipment manual synthesis, and rigorous JSON schema adherence.",
    keyStrengths: [
      "Native support on Ollama Cloud and local Ollama daemon",
      "Superior technical multilingual understanding across European & Asian manuals",
      "High reasoning fidelity with chain-of-thought stripping",
      "Guaranteed JSON schema output for citation linking",
    ],
    idealQueries: [
      "Siemens S120 infeed unit DC link pre-charging sequence and torque specs",
      "Multilingual manual synthesis for Fanuc CNC alarm codes",
      "Component isolation steps for hydraulic manifold pressure drops",
      "Wiring schematic tracing with pinout confirmation",
    ],
    deploymentSpecs: {
      memory: "6.6 GB VRAM / Ollama Native",
      throughput: "120+ tokens/sec",
      protocol: "Ollama HTTP API",
      edgeReady: true,
    },
  },
  MINI: {
    name: "Nord",
    tierLabel: "TIER 01 · FAST EDGE / TRIAGE",
    tagline: "Instant Edge Triage & Error Code Matching",
    accentColor: "#3b82f6",
    accentBg: "rgba(59,130,246,0.08)",
    accentBorder: "rgba(59,130,246,0.25)",
    engine: "Groq LPU / groq/compound-mini",
    latency: "< 100ms",
    contextWindow: "8,192 tokens",
    hardwareTarget: "Edge IPC, Siemens SIMATIC IPC, Raspberry Pi 5 CM4",
    logoLight: "/nord-light.png",
    logoDark: "/nord-dark.png",
    summary:
      "Engineered for sub-second frontline operations where speed is paramount. Resolves single-point error codes, binary status checks, and straightforward manual lookups directly on the factory line.",
    keyStrengths: [
      "Sub-100 millisecond response time",
      "Ultra-low token latency on Groq LPU",
      "High-throughput concurrent polling for line controllers",
      "Deterministic error-code to manual page mapping",
    ],
    idealQueries: [
      "Siemens SINAMICS G120 fault F001 meaning",
      "PowerFlex 755 Fault 8 overspeed reset",
      "Siemens S120 F030 overvoltage check",
      "Fanuc error SRVO-006 Hand broken",
    ],
    deploymentSpecs: {
      memory: "8 GB RAM / 4-core Edge CPU",
      throughput: "300+ tokens/sec",
      protocol: "Groq LPU API / Edge WebSocket",
      edgeReady: true,
    },
  },
  GPT20B: {
    name: "Forge",
    tierLabel: "TIER 02 · PRODUCTION WORKHORSE",
    tagline: "Fast Multi-Step Procedures & Component Cross-Reference",
    accentColor: "#f59e0b",
    accentBg: "rgba(245,158,11,0.08)",
    accentBorder: "rgba(245,158,11,0.25)",
    engine: "Groq LPU / openai/gpt-oss-20b",
    latency: "1.0s – 1.8s",
    contextWindow: "128,000 tokens",
    hardwareTarget: "Plant Floor Gateway, On-Prem Linux Workstation",
    logoLight: "/forge-light.png",
    logoDark: "/forge-dark.png",
    summary:
      "The high-throughput diagnostic workhorse. Interprets multi-page troubleshooting workflows, cross-references wiring schematics with physical part numbers, and formats step-by-step repair instructions for technicians.",
    keyStrengths: [
      "Massive multi-page context ingestion (128k context)",
      "Strict sequence ordering for maintenance procedures",
      "Extracts torque ratings, calibration tables, and tool requirements",
      "Pin-accurate wiring harness and connector trace analysis",
    ],
    idealQueries: [
      "Step-by-step troubleshooting for Siemens G120 F001 overcurrent trip",
      "PowerFlex 755 bus regulator calibration procedure",
      "Siemens S120 infeed unit DC link pre-charging sequence",
      "Torque specs and gasket replacement order for hydraulic manifold",
    ],
    deploymentSpecs: {
      memory: "16 GB RAM / Hybrid Gateway",
      throughput: "240+ tokens/sec",
      protocol: "Groq LPU API / SSE Stream",
      edgeReady: true,
    },
  },
  GPT120B: {
    name: "Apex",
    tierLabel: "TIER 03 · DEEP REASONING",
    tagline: "Root-Cause Analysis & Safety-Critical Diagnostics",
    accentColor: "#8b5cf6",
    accentBg: "rgba(139,92,246,0.08)",
    accentBorder: "rgba(139,92,246,0.25)",
    engine: "Groq LPU / openai/gpt-oss-120b",
    latency: "2.0s – 3.8s",
    contextWindow: "128,000 tokens",
    hardwareTarget: "High-Throughput Groq LPU Cluster",
    logoLight: "/apex-light.png",
    logoDark: "/apex-dark.png",
    summary:
      "The pinnacle of industrial diagnostic intelligence. Activates for complex cascading faults, cross-manual ambiguity, and safety-critical operations where any mistake risks catastrophic equipment failure or human injury.",
    keyStrengths: [
      "Rigorous deductive reasoning across multiple interconnected systems",
      "Cross-manual disambiguation (e.g. G120 vs S120 identical fault codes)",
      "Mandatory hazard identification (arc-flash, thermal, pressure, chemical)",
      "OSHA and ISO-compliant maintenance audit protocols",
    ],
    idealQueries: [
      "F001 on G120 vs S120: disambiguate power unit vs vector module behavior",
      "Cascading DC bus fault with simultaneous motor encoder feedback loss",
      "Harmonic drive backlash with abnormal thermal expansion at full load",
      "Comprehensive failure mode & effects analysis (FMEA) for drive rack collapse",
    ],
    deploymentSpecs: {
      memory: "Enterprise Cloud / Dedicated Secure LPU",
      throughput: "180+ tokens/sec",
      protocol: "Groq LPU API / Zero Retention",
      edgeReady: false,
    },
  },
};

const SIMULATOR_PRESETS = [
  {
    query: "Siemens G120 F001 overcurrent fault code lookup",
    machine: "Siemens SINAMICS G120",
    routedTo: "MINI" as const,
    complexityScore: 0.18,
    reasoning: "Keyword-exact fault code inquiry. Requires direct catalog retrieval without multi-step procedural synthesis. Instant edge response.",
  },
  {
    query: "PowerFlex 755 Fault 8: Step-by-step deceleration profile tuning and motor test",
    machine: "Allen-Bradley PowerFlex 755",
    routedTo: "GPT20B" as const,
    complexityScore: 0.58,
    reasoning: "Multi-step mechanical maintenance procedure requiring sequential action items, tool specs, and parameter verification.",
  },
  {
    query: "Disambiguate F030 overvoltage between SINAMICS G120 and S120 with cascading DC bus failure",
    machine: "SINAMICS G120 & S120 Cross-Manual",
    routedTo: "GPT120B" as const,
    complexityScore: 0.89,
    reasoning: "Complex cross-subsystem incident involving electrical surge and cross-manual code overlap. Requires root-cause deduction and safety PPE protocol.",
  },
];

export default function ModelsPage() {
  const { theme } = useTheme();
  const [selectedModel, setSelectedModel] = useState<ModelTierKey>("AUTO");
  const [activePreset, setActivePreset] = useState(1);
  const activeSpec = MODELS_DATA[selectedModel];
  const sim = SIMULATOR_PRESETS[activePreset];

  return (
    <LandingLayout>
      {/* ─── Background Grid & Ambient Glows ─── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-15" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[550px] h-[550px] bg-violet-600/10 rounded-full blur-[170px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20">
        {/* ─── Header Badge & Title ─── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] font-bold tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
            MEND - X · MULTI-MODEL INFERENCE MATRIX
          </div>
          <h1 className="font-black text-4xl sm:text-6xl text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
            Three Intelligence Tiers.<br />
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #f59e0b, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Zero Hallucination.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            One generic LLM cannot solve factory downtime. PLCs demand sub-100ms edge speed; complex breakdowns require deep deductive reasoning. MEND-X dynamically routes every query to the exact intelligence tier needed.
          </p>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 p-2 rounded-2xl bg-white/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <div className="p-3 text-center">
              <div className="font-mono font-black text-2xl text-blue-600 dark:text-blue-400">&lt; 100ms</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Minimum Latency</div>
            </div>
            <div className="p-3 text-center border-l border-slate-100 dark:border-white/[0.06]">
              <div className="font-mono font-black text-2xl text-amber-600 dark:text-amber-400">100%</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Manual Grounded</div>
            </div>
            <div className="p-3 text-center border-l border-slate-100 dark:border-white/[0.06]">
              <div className="font-mono font-black text-2xl text-violet-600 dark:text-violet-400">3 Tiers</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Dynamic Routing</div>
            </div>
            <div className="p-3 text-center border-l border-slate-100 dark:border-white/[0.06]">
              <div className="font-mono font-black text-2xl text-emerald-600 dark:text-emerald-400">0.0%</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Hallucination Target</div>
            </div>
          </div>
        </div>

        {/* ─── Model Tier Switcher Tabs ─── */}
        <div className="flex justify-center mb-10">
          <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center gap-2 flex-wrap justify-center">
            {(["AUTO", "QWEN", "MINI", "GPT20B", "GPT120B"] as const).map((mName) => {
              const item = MODELS_DATA[mName];
              const isSelected = selectedModel === mName;
              return (
                <button
                  key={mName}
                  onClick={() => setSelectedModel(mName)}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-white dark:bg-[#161822] text-slate-900 dark:text-white shadow-md border"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  style={{
                    borderColor: isSelected ? item.accentColor : "transparent",
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: item.accentColor }}
                  />
                  <span>{item.name}</span>
                  <span
                    className="hidden sm:inline font-mono text-xs px-2 py-0.5 rounded-md"
                    style={{
                      background: item.accentBg,
                      color: item.accentColor,
                    }}
                  >
                    {item.latency}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Active Model Showcase Card ─── */}
        <div
          className="rounded-3xl p-8 sm:p-12 border bg-white dark:bg-[#0f1118]/80 backdrop-blur-xl shadow-xl transition-all duration-300 relative overflow-hidden mb-20"
          style={{
            borderColor: activeSpec.accentBorder,
            boxShadow: `0 8px 32px ${activeSpec.accentColor}12`,
          }}
        >
          {/* Ambient Glow */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-20"
            style={{ background: activeSpec.accentColor }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10 items-start">
            {/* Left Column: Brand, Tagline, Latency & Target */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-3">
                <span
                  className="font-mono text-xs font-black tracking-widest uppercase px-3 py-1 rounded-md border"
                  style={{
                    color: activeSpec.accentColor,
                    background: activeSpec.accentBg,
                    borderColor: activeSpec.accentBorder,
                  }}
                >
                  {activeSpec.tierLabel}
                </span>
                {activeSpec.deploymentSpecs.edgeReady && (
                  <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold">
                    EDGE DEPLOYABLE
                  </span>
                )}
              </div>

              {/* Logo & Headline */}
              <div className="space-y-3">
                <div className="h-16 flex items-center">
                  <Image
                    src={theme === "light" ? activeSpec.logoLight : activeSpec.logoDark}
                    alt={activeSpec.name}
                    width={160}
                    height={60}
                    className="object-contain"
                  />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {activeSpec.tagline}
                </h2>
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeSpec.summary}
                </p>
              </div>

              {/* Hardware & Spec Callouts */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/[0.08]">
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-slate-500 font-mono">Underlying LLM Engine</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{activeSpec.engine}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-slate-500 font-mono">Average Latency</span>
                  <span className="font-mono font-bold" style={{ color: activeSpec.accentColor }}>
                    {activeSpec.latency}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-slate-500 font-mono">Context Window</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">{activeSpec.contextWindow}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-slate-500 font-mono">Inference Throughput</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{activeSpec.deploymentSpecs.throughput}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-500 font-mono">Recommended Host</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[220px]" title={activeSpec.hardwareTarget}>
                    {activeSpec.hardwareTarget}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Strengths & Sample Queries */}
            <div className="lg:col-span-7 space-y-6">
              {/* Strengths */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeSpec.accentColor }} />
                  Engineered Superpowers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeSpec.keyStrengths.map((str, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <svg
                        className="w-4 h-4 shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke={activeSpec.accentColor}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Queries Handled */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeSpec.accentColor }} />
                  Target Real-World Queries
                </h3>
                <div className="space-y-2">
                  {activeSpec.idealQueries.map((q, i) => (
                    <div
                      key={i}
                      className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/[0.06] text-xs font-mono text-slate-800 dark:text-slate-200 flex items-center justify-between gap-3 group"
                    >
                      <span className="truncate">&gt; {q}</span>
                      <span className="text-[10px] font-sans font-semibold shrink-0 px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-500">
                        {activeSpec.name} Handled
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Interactive Query Routing Simulator ─── */}
        <section className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em]">
              LIVE INFERENCE ROUTER
            </span>
            <h2 className="font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mt-2 mb-3">
              How MEND-X Decides the Tier
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Click a real maintenance scenario below to see the heuristic complexity analyzer evaluate the query and dynamically activate the optimal model.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Scenarios List */}
            <div className="lg:col-span-5 space-y-3">
              {SIMULATOR_PRESETS.map((p, idx) => {
                const isActive = activePreset === idx;
                const targetModel = MODELS_DATA[p.routedTo];
                return (
                  <button
                    key={idx}
                    onClick={() => setActivePreset(idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-white dark:bg-[#141620] shadow-md border-indigo-500/50 scale-[1.02]"
                        : "bg-white/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-slate-500 font-semibold">{p.machine}</span>
                      <span
                        className="font-mono text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{
                          background: targetModel.accentBg,
                          color: targetModel.accentColor,
                        }}
                      >
                        {p.routedTo}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 leading-snug">
                      "{p.query}"
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Simulated Routing Engine Terminal */}
            <div className="lg:col-span-7 rounded-2xl bg-slate-950 text-slate-200 p-6 font-mono text-xs border border-indigo-500/30 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-[11px] text-slate-400 ml-2">ROUTER_TRACE // CLASSIFIER_V2</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    REALTIME ANALYSIS
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-slate-500">INPUT_PROMPT: </span>
                    <span className="text-slate-100">"{sim.query}"</span>
                  </div>
                  <div>
                    <span className="text-slate-500">TARGET_MACHINE: </span>
                    <span className="text-indigo-400">{sim.machine}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">COMPLEXITY_METRIC: </span>
                    <span className="text-amber-400 font-bold">{sim.complexityScore.toFixed(2)} / 1.00</span>
                    <span className="text-slate-500 ml-2">
                      ({sim.complexityScore < 0.35 ? "Single Lookup" : sim.complexityScore < 0.70 ? "Procedural Repair" : "Critical Reasoning"})
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sim.complexityScore * 100}%`,
                        background:
                          sim.complexityScore < 0.35
                            ? "#3b82f6"
                            : sim.complexityScore < 0.70
                            ? "#f59e0b"
                            : "#8b5cf6",
                      }}
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-white/[0.04] border border-white/10 mt-3 text-slate-300 text-[11px] leading-relaxed">
                    <span className="text-emerald-400 font-bold">DECISION_RATIONALE: </span>
                    {sim.reasoning}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-slate-400 text-[11px]">
                <span>ROUTED_LLM: <strong className="text-white">{MODELS_DATA[sim.routedTo].engine}</strong></span>
                <span className="text-emerald-400 font-bold">LATENCY: {MODELS_DATA[sim.routedTo].latency}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Comparative Specifications Matrix ─── */}
        <section className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em]">
              TECHNICAL SPECIFICATIONS
            </span>
            <h2 className="font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mt-2">
              Side-by-Side Comparison
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1118]/80 shadow-md">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02]">
                  <th className="p-4 font-mono font-bold text-slate-500">Metric / Capability</th>
                  <th className="p-4 font-bold text-blue-600 dark:text-blue-400">Nord (Tier 01)</th>
                  <th className="p-4 font-bold text-amber-600 dark:text-amber-400">Forge (Tier 02)</th>
                  <th className="p-4 font-bold text-violet-600 dark:text-violet-400">Apex (Tier 03)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                <tr>
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Primary Objective</td>
                  <td className="p-4 text-slate-800 dark:text-slate-200 font-semibold">Sub-100ms Error Code Triage</td>
                  <td className="p-4 text-slate-800 dark:text-slate-200 font-semibold">Multi-Step Repair Sequences</td>
                  <td className="p-4 text-slate-800 dark:text-slate-200 font-semibold">Root Cause & Safety Critical</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Base LLM Engine</td>
                  <td className="p-4 font-mono text-slate-700 dark:text-slate-300">groq/compound-mini (Groq LPU)</td>
                  <td className="p-4 font-mono text-slate-700 dark:text-slate-300">openai/gpt-oss-20b (Groq LPU)</td>
                  <td className="p-4 font-mono text-slate-700 dark:text-slate-300">openai/gpt-oss-120b (Groq LPU)</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Response Latency</td>
                  <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">&lt; 100ms</td>
                  <td className="p-4 font-mono font-bold text-amber-600 dark:text-amber-400">1.0s – 1.8s</td>
                  <td className="p-4 font-mono font-bold text-violet-600 dark:text-violet-400">2.0s – 3.8s</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Context Window</td>
                  <td className="p-4 font-mono text-slate-700 dark:text-slate-300">8,192 tokens</td>
                  <td className="p-4 font-mono text-slate-700 dark:text-slate-300">128,000 tokens</td>
                  <td className="p-4 font-mono text-slate-700 dark:text-slate-300">128,000 tokens</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Edge / Offline Capable</td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Yes (Local IPC / ONNX)</td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Yes (Plant Server)</td>
                  <td className="p-4 text-slate-500">Air-Gapped Private VPC</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Hallucination Mitigation</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">Strict RAG Masking</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">Page Citation Grounding</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">Refusal Circuit + Thresholds</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Trigger Threshold</td>
                  <td className="p-4 font-mono text-slate-700 dark:text-slate-300">complexity &lt; 0.35</td>
                  <td className="p-4 font-mono text-slate-700 dark:text-slate-300">0.35 &le; complexity &lt; 0.70</td>
                  <td className="p-4 font-mono text-slate-700 dark:text-slate-300">complexity &ge; 0.70</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── Bottom CTA ─── */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-900/30 via-slate-900/40 to-violet-900/30 border border-indigo-500/30 text-center relative overflow-hidden">
          <h3 className="font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mb-3">
            Experience the Inference Routing in Real-Time
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-6">
            Test how MEND-X queries live OEM manuals and streams citation-verified repair protocols to line operators in under 8 seconds.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              Launch Troubleshooting Console
            </Link>
            <Link
              href="/architecture"
              className="px-6 py-3 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] transition-all"
            >
              Inspect pgvector Pipeline
            </Link>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}

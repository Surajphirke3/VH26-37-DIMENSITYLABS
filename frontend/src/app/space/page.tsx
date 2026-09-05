"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Zap,
  Wrench,
  ShieldAlert,
  Terminal,
  Activity,
  Cpu,
  Layers,
  Clock,
  ArrowRight,
  ChevronRight,
  Orbit,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n/context";
import { useSpaceWarp } from "@/components/common/SpaceWarpPortal";
import { getMachines, singleQuery } from "@/lib/api";
import type { Machine, TroubleshootingResponse } from "@/lib/types";
import ManufacturerLogo from "@/components/common/ManufacturerLogo";
import StructuredAnswerV2 from "@/components/chat/StructuredAnswerV2";

interface ModelCardInfo {
  id: "nord" | "forge" | "apex";
  name: string;
  codename: string;
  tier: string;
  badge: string;
  role: string;
  engine: string;
  latency: string;
  throughput: string;
  contextWindow: string;
  color: string;
  borderClass: string;
  bgGlowClass: string;
  accentGradient: string;
  summary: string;
  capabilities: string[];
  idealFor: string;
}

const TRI_MODELS: Record<"nord" | "forge" | "apex", ModelCardInfo> = {
  nord: {
    id: "nord",
    name: "Nord",
    codename: "NORD-1B-EDGE",
    tier: "TIER 01",
    badge: "Edge Sub-100ms",
    role: "Ultra-Fast Edge Triage & Safety Lockdown",
    engine: "Nord 1B (Edge Sub-100ms LPU)",
    latency: "<100ms",
    throughput: "450+ tok/sec",
    contextWindow: "4,096 tokens",
    color: "#38bdf8",
    borderClass: "border-sky-500/40 hover:border-sky-400",
    bgGlowClass: "shadow-[0_0_30px_rgba(56,189,248,0.15)]",
    accentGradient: "from-sky-500 to-cyan-400",
    summary:
      "Engineered for sub-100ms instant fault recognition at the physical factory cell. Validates error codes, immediately triggers safety protocols, and halts cascading equipment damage before operators even reach the HMI.",
    capabilities: [
      "Sub-100ms instant alarm code parsing",
      "Immediate machine isolation & E-Stop verification",
      "Low-overhead sensor telemetry correlation",
      "Local shopfloor gateway deployment ready",
    ],
    idealFor: "Alarm 102, Overheat trips, Voltage drops, Emergency interlocks",
  },
  forge: {
    id: "forge",
    name: "Forge",
    codename: "FORGE-2B-DIAG",
    tier: "TIER 02",
    badge: "Diagnostic Engine",
    role: "Deterministic Repair Protocol & Schematics",
    engine: "Forge 2B (Workshop Diagnostic Engine)",
    latency: "600ms – 1.2s",
    throughput: "180+ tok/sec",
    contextWindow: "8,192 tokens",
    color: "#f59e0b",
    borderClass: "border-amber-500/40 hover:border-amber-400",
    bgGlowClass: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    accentGradient: "from-amber-500 to-yellow-400",
    summary:
      "The heavy-duty workshop reasoning engine. Ingests dense OEM wiring schematics, technical parts manuals, and pneumatic diagrams to output deterministic step-by-step corrective protocols with exact tool specifications and pinouts.",
    capabilities: [
      "OEM manual vector citation grounding",
      "Electrical pinout & connector verification",
      "Torque specs & calibration curves",
      "Multilingual manual reasoning (EN, DE, JA, ZH)",
    ],
    idealFor: "Servo drive faults, encoder calibration, inverter diagnostics",
  },
  apex: {
    id: "apex",
    name: "Apex",
    codename: "APEX-4B-TRAINED",
    tier: "TIER 03",
    badge: "Deep Kinematics",
    role: "Cross-Subsystem Multi-Assembly Synthesis",
    engine: "Apex 4B (Domain-Trained Model)",
    latency: "1.4s – 2.6s",
    throughput: "120+ tok/sec",
    contextWindow: "16,384 tokens",
    color: "#f43f5e",
    borderClass: "border-rose-500/40 hover:border-rose-400",
    bgGlowClass: "shadow-[0_0_30px_rgba(244,63,94,0.15)]",
    accentGradient: "from-rose-500 to-pink-400",
    summary:
      "Our most powerful 4B parameter domain-trained model. Custom trained on OEM service engineering data for ambiguous cross-controller failures, harmonic drive wear, thermal drift, and complex multi-assembly kinematics.",
    capabilities: [
      "4B domain-trained multi-manual synthesis",
      "Kinematic linkage & resolver drift calculations",
      "Cross-controller bus timeout root cause",
      "Preventative lifecycle failure modeling",
    ],
    idealFor: "Multi-axis robotic arm drift, PROFINET bus sync, thermal drift",
  },
};

const SPACE_PRESETS = [
  {
    title: "HAAS Spindle Thermal Drift",
    model: "haas-vf4",
    query: "HAAS VF-4 Alarm 102 Spindle Motor Overheat during heavy roughing pass",
    tag: "Thermal",
  },
  {
    title: "SIEMENS PROFINET Bus Fault",
    model: "siemens-s7-1500",
    query: "SIEMENS S7-1500 Event 0x80 PROFINET IO station communication loss with ET200SP",
    tag: "Fieldbus",
  },
  {
    title: "KUKA Resolver Kinematic Drift",
    model: "kuka-kr210",
    query: "KUKA KR210 Arm Error KRC4 1024 Axis 3 Resolver Feedback Drift exceeding 0.05deg",
    tag: "Kinematics",
  },
];

export default function TriModelSpacePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { triggerWarp } = useSpaceWarp();

  const [activeModel, setActiveModel] = useState<"nord" | "forge" | "apex">("forge");
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<TroubleshootingResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"matrix" | "terminal">("matrix");

  useEffect(() => {
    getMachines().then(setMachines).catch(console.error);
  }, []);

  const handleReturnToDashboard = () => {
    triggerWarp(
      "/dashboard",
      "Docking to Shopfloor Terminal",
      "Restoring grounded equipment manual context and air-gapped telemetry…"
    );
  };

  const handleRunDiagnostic = async (textToRun?: string) => {
    const text = textToRun || query;
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const res = await singleQuery(
        text,
        selectedMachineId || undefined,
        undefined,
        activeModel
      );

      if (res) {
        setResponse(res);
        setActiveTab("terminal");
      }
    } catch (err) {
      console.error("Diagnostic execution error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentModelData = TRI_MODELS[activeModel];

  return (
    <div className="min-h-screen w-full bg-[#04060b] text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-sky-500/30">
      {/* ── Cosmic Nebula Atmospheric Background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-sky-500/10 filter blur-[140px] celestial-aura-nord" />
        <div className="absolute top-1/3 -right-32 w-[550px] h-[550px] rounded-full bg-amber-500/10 filter blur-[150px] celestial-aura-forge" />
        <div className="absolute -bottom-32 left-1/3 w-[650px] h-[650px] rounded-full bg-rose-500/10 filter blur-[160px] celestial-aura-apex" />
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#04060b]/60 to-[#04060b]" />
      </div>

      {/* ── Top Header Navigation Bar ── */}
      <header className="sticky top-0 z-40 bg-[#060913]/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl">
        <div className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Left: Brand Emblem & Domain Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group py-1">
              <Image
                src="/brand-icon-dark.png"
                alt="MEND-X"
                width={34}
                height={34}
                className="w-8 h-8 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                priority
              />
              <span className="font-black text-xl tracking-tight text-white flex items-center gap-0.5">
                MEND<span className="text-teal-400">-X</span>
              </span>
            </Link>

            <span className="hidden sm:inline-block w-px h-5 bg-white/10" />

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 font-mono text-[10px] font-bold tracking-widest uppercase">
              <Sparkles className="w-3 h-3 text-sky-400 animate-pulse" />
              <span>Tri-Model Neural Space</span>
            </div>
          </div>

          {/* Center: Model Quick Switcher Pills */}
          <div className="hidden md:flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/10 shadow-inner">
            {(["nord", "forge", "apex"] as const).map((key) => {
              const m = TRI_MODELS[key];
              const active = activeModel === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveModel(key)}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    active
                      ? "bg-white/15 text-white shadow-md border border-white/20"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: m.color,
                      boxShadow: active ? `0 0 10px ${m.color}` : "none",
                    }}
                  />
                  <span>{m.name}</span>
                  <span className="text-[10px] opacity-70 font-normal">({m.latency})</span>
                </button>
              );
            })}
          </div>

          {/* Right: Return Portal to Shopfloor SCADA Terminal */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={handleReturnToDashboard}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 border border-teal-400/30 shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all whitespace-nowrap flex items-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
              title="Traverse warp back to the physical equipment troubleshooting terminal"
            >
              <Terminal className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>← Return to Shopfloor Console</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <main className="flex-1 w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 z-10 space-y-8">
        {/* Hero Banner with Model Matrix Controls */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 font-mono text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                <Orbit className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                <span>Multi-Tier High Dimensional Reasoning Domain</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Dedicated Tri-Model Neural Grid
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                Each model fulfills a dedicated tier in the industrial automation lifecycle — from{" "}
                <strong className="text-sky-400">Nord&apos;s sub-100ms edge triage</strong> to{" "}
                <strong className="text-amber-400">Forge&apos;s deterministic schematics</strong> and{" "}
                <strong className="text-rose-400">Apex&apos;s 4B domain-trained kinematics reasoning</strong>.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-black/40 border border-white/15 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("matrix")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "matrix"
                    ? "bg-white/20 text-white shadow-md border border-white/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Model Matrix (3 Tiers)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("terminal")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "terminal"
                    ? "bg-white/20 text-white shadow-md border border-white/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Live Space Diagnostic</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 3-Model Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {(["nord", "forge", "apex"] as const).map((key) => {
            const m = TRI_MODELS[key];
            const isSelected = activeModel === key;

            return (
              <div
                key={key}
                onClick={() => setActiveModel(key)}
                className={`rounded-3xl p-6 transition-all duration-300 cursor-pointer relative flex flex-col justify-between border backdrop-blur-xl ${
                  isSelected
                    ? `bg-white/[0.08] ${m.borderClass} ${m.bgGlowClass} scale-[1.02]`
                    : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              >
                {/* Active Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono font-bold text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ACTIVE</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Model Header */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      <span>{m.tier}</span>
                      <span>·</span>
                      <span style={{ color: m.color }}>{m.badge}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{
                          backgroundColor: m.color,
                          boxShadow: `0 0 12px ${m.color}`,
                        }}
                      />
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {m.name}
                      </h3>
                    </div>
                    <p className="text-xs font-mono font-semibold text-slate-300">{m.role}</p>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{m.summary}</p>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.08] font-mono text-[11px]">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-slate-400 text-[9px] uppercase block">Latency</span>
                      <span className="font-bold text-white text-xs">{m.latency}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-slate-400 text-[9px] uppercase block">Throughput</span>
                      <span className="font-bold text-white text-xs">{m.throughput}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-slate-400 text-[9px] uppercase block">Context</span>
                      <span className="font-bold text-white text-xs">{m.contextWindow}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-slate-400 text-[9px] uppercase block">Runtime</span>
                      <span className="font-bold text-slate-200 text-[10px] truncate block">
                        {m.engine.split("/")[0]}
                      </span>
                    </div>
                  </div>

                  {/* Capabilities List */}
                  <div className="space-y-1.5 pt-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                      Core Strengths:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {m.capabilities.map((cap, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-400 text-xs mt-0.5">✓</span>
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModel(key);
                      setActiveTab("terminal");
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-white text-slate-950 shadow-lg font-black"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <span>Activate {m.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Interactive Space Diagnostic Playground ── */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: currentModelData.color,
                    boxShadow: `0 0 10px ${currentModelData.color}`,
                  }}
                />
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Space Diagnostic Terminal // Dispatched via {currentModelData.name} ({currentModelData.tier})
                </h2>
              </div>
              <p className="text-xs font-mono text-slate-400">
                Execute live diagnostic RAG inference through {currentModelData.codename} with verified OEM grounding.
              </p>
            </div>

            {/* Machine Filter Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-slate-400">Target Equipment:</span>
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
              >
                <option value="">All Fleet Machinery (Cross-Search)</option>
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.model})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Preset Queries */}
          <div className="space-y-2">
            <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
              Live Probe Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {SPACE_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setQuery(preset.query);
                    handleRunDiagnostic(preset.query);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-500/20 text-sky-400">
                    {preset.tag}
                  </span>
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/60 border border-white/15 shadow-inner">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRunDiagnostic()}
              placeholder={`Enter error code, sensor telemetry, or alarm for ${currentModelData.name}...`}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => handleRunDiagnostic()}
              disabled={isLoading || !query.trim()}
              className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-rose-600 hover:from-sky-400 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Reasoning…</span>
                </>
              ) : (
                <>
                  <span>Dispatch Query</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Diagnostic Result */}
          {response && (
            <div className="space-y-4 pt-4 border-t border-white/10 animate-slide-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Diagnostic Protocol Synthesized via {currentModelData.name}</span>
                </div>
                {response.total_latency_ms && (
                  <span className="font-mono text-[10px] text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    Inference Latency: {response.total_latency_ms}ms
                  </span>
                )}
              </div>

              <div className="rounded-2xl bg-[#090d1a] border border-white/10 p-5 shadow-2xl">
                <StructuredAnswerV2 response={response} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-white/[0.08] py-6 px-4 text-center z-10 font-mono text-xs text-slate-500">
        <p>MEND-X Tri-Model Space Portal · Grounded Factory Floor AI Systems · v3.0.0</p>
      </footer>
    </div>
  );
}

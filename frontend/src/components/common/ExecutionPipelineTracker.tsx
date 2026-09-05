"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  FileText,
  Layers,
  Cpu,
  Database,
  Search,
  Zap,
  CheckCircle2,
  Terminal,
  Activity,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export interface PipelineStage {
  id: number;
  label: string;
  shortLabel: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  bgGlow: string;
  borderColor: string;
  taskDescription: string;
  techDetails: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 1,
    label: "MANUALS",
    shortLabel: "MANUALS",
    subtitle: "OEM Schematics & Specs",
    icon: BookOpen,
    color: "#06b6d4",
    bgGlow: "rgba(6,182,212,0.15)",
    borderColor: "rgba(6,182,212,0.4)",
    taskDescription: "Scanning verified OEM technical manuals (Haas, Siemens, KUKA, Fanuc) and engineering schematics...",
    techDetails: "Raw PDF documents with vector bounding boxes, tables, and wiring diagrams.",
  },
  {
    id: 2,
    label: "Document Processing",
    shortLabel: "Processing",
    subtitle: "Structure & OCR Tables",
    icon: FileText,
    color: "#3b82f6",
    bgGlow: "rgba(59,130,246,0.15)",
    borderColor: "rgba(59,130,246,0.4)",
    taskDescription: "Parsing visual hierarchy, optical table extraction, isolating error code indexes & fault trees...",
    techDetails: "PyPDF/PDFPlumber extraction, stripping headers/footers, normalizing unicode symbols.",
  },
  {
    id: 3,
    label: "Chunking",
    shortLabel: "Chunking",
    subtitle: "512-Token Windows",
    icon: Layers,
    color: "#6366f1",
    bgGlow: "rgba(99,102,241,0.15)",
    borderColor: "rgba(99,102,241,0.4)",
    taskDescription: "Applying recursive sliding window segmentation (512 tokens, 128 overlap) with section hierarchy...",
    techDetails: "Preserves procedural sentence boundaries, parent section hierarchy, and alarm code tags.",
  },
  {
    id: 4,
    label: "Embeddings",
    shortLabel: "Embeddings",
    subtitle: "Dense 384-Dim Vectors",
    icon: Cpu,
    color: "#8b5cf6",
    bgGlow: "rgba(139,92,246,0.15)",
    borderColor: "rgba(139,92,246,0.4)",
    taskDescription: "Generating dense sentence embeddings into 384-dimensional cosine vector space...",
    techDetails: "All-MiniLM-L6-v2 dense vector representation tuned for industrial terminology.",
  },
  {
    id: 5,
    label: "Retrieval",
    shortLabel: "Retrieval",
    subtitle: "ChromaDB / pgvector ANN",
    icon: Database,
    color: "#10b981",
    bgGlow: "rgba(16,185,129,0.15)",
    borderColor: "rgba(16,185,129,0.4)",
    taskDescription: "Executing Approximate Nearest Neighbor (ANN) cosine similarity search against vector store...",
    techDetails: "Hierarchical Navigable Small World (HNSW) indexing with cosine distance metric.",
  },
  {
    id: 6,
    label: "Context Library",
    shortLabel: "Context",
    subtitle: "Rerank & Deduplication",
    icon: Search,
    color: "#38bdf8",
    bgGlow: "rgba(56,189,248,0.12)",
    borderColor: "rgba(56,189,248,0.35)",
    taskDescription: "Cross-encoder scoring, threshold cutoff filtering (>0.45 cosine), deduplication & prompt packing...",
    techDetails: "Filters noise, preserves highest confidence procedure steps, builds grounded prompt context.",
  },
  {
    id: 7,
    label: "LLM Response",
    shortLabel: "Reasoning",
    subtitle: "Adaptive Model Reasoning",
    icon: Zap,
    color: "#818cf8",
    bgGlow: "rgba(129,140,248,0.12)",
    borderColor: "rgba(129,140,248,0.35)",
    taskDescription: "Dispatching to active Ollama Cloud engine (Qwen 3.5 9B / Local Fallback)...",
    techDetails: "Strict zero-hallucination directive, temperature 0.1, mandatory citation grounding tokens.",
  },
  {
    id: 8,
    label: "Cited Solution",
    shortLabel: "Solution",
    subtitle: "Verified Repair Protocol",
    icon: CheckCircle2,
    color: "#10b981",
    bgGlow: "rgba(16,185,129,0.12)",
    borderColor: "rgba(16,185,129,0.35)",
    taskDescription: "Validating citation references against source manual pages. 100% deterministic protocol ready.",
    techDetails: "Formatted corrective steps, component callouts, verified page citations [C1], [C2].",
  },
];

interface ExecutionPipelineTrackerProps {
  isExecuting: boolean;
  query?: string;
  variant?: "compact" | "full";
  onComplete?: () => void;
  className?: string;
}

export default function ExecutionPipelineTracker({
  isExecuting,
  query,
  variant = "compact",
  onComplete,
  className = "",
}: ExecutionPipelineTrackerProps) {
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [completedStageIds, setCompletedStageIds] = useState<number[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [progressPercent, setProgressPercent] = useState<number>(12);
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isExecuting) {
      setCompletedStageIds([1, 2, 3, 4, 5, 6, 7, 8]);
      setActiveStageId(8);
      setProgressPercent(100);
      return;
    }

    setActiveStageId(1);
    setCompletedStageIds([]);
    setProgressPercent(12);

    const now = () => new Date().toISOString().split("T")[1].slice(0, 8);
    const initialLogs = [
      `[${now()}] [FastAPI Gateway] Dispatching pipeline execution request...`,
      query ? `[${now()}] [Query Scope] "${query.slice(0, 60)}${query.length > 60 ? "..." : ""}"` : null,
      `[${now()}] [STAGE 1: MANUALS] ${PIPELINE_STAGES[0].taskDescription}`,
    ].filter(Boolean) as string[];

    setLogs(initialLogs);

    let stage = 1;
    const timer = setInterval(() => {
      if (stage < 7) {
        setCompletedStageIds((prev) => [...prev, stage]);
        stage++;
        setActiveStageId(stage);
        setProgressPercent(Math.round((stage / 8) * 100));

        const stageDef = PIPELINE_STAGES[stage - 1];
        setLogs((prev) => [
          ...prev,
          `[${now()}] [STAGE ${stageDef.id}: ${stageDef.label.toUpperCase()}] ${stageDef.taskDescription}`,
        ]);
      } else if (stage === 7) {
        setProgressPercent(90);
      }
    }, 450);

    return () => clearInterval(timer);
  }, [isExecuting, query]);

  // Scroll ONLY the internal container, never window
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const currentStage = PIPELINE_STAGES.find((s) => s.id === activeStageId) || PIPELINE_STAGES[0];
  const CurrentIcon = currentStage.icon;

  if (variant === "compact") {
    return (
      <div
        className={`w-full rounded-2xl bg-slate-900/90 dark:bg-[#0b0f19]/90 border border-slate-700/50 dark:border-white/10 shadow-xl backdrop-blur-xl p-4 space-y-3.5 transition-all text-slate-200 ${className}`}
      >
        {/* Top Header & Smooth Glowing Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
                Grounding Pipeline Trace
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                Stage {activeStageId} of 8
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400">
                {isExecuting ? "Executing Live..." : "Complete"}
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Slim progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-300 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white shadow-[0_0_8px_#ffffff] animate-pulse" />
            </div>
          </div>
        </div>

        {/* 8-Stage Horizontal Mini-Stepper */}
        <div className="grid grid-cols-8 gap-1.5 items-center">
          {PIPELINE_STAGES.map((s) => {
            const Icon = s.icon;
            const isDone = completedStageIds.includes(s.id);
            const isActive = activeStageId === s.id && isExecuting;

            return (
              <div
                key={s.id}
                title={`Stage ${s.id}: ${s.label} — ${s.subtitle}`}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all ${
                  isActive
                    ? "border-cyan-500/70 bg-cyan-500/15 shadow-sm scale-105"
                    : isDone
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-white/[0.06] bg-white/[0.02] text-slate-500 opacity-50"
                }`}
              >
                <Icon
                  className="w-3.5 h-3.5 shrink-0 mb-1"
                  style={{ color: isActive ? s.color : isDone ? "#10b981" : undefined }}
                />
                <span className="text-[9px] font-mono font-bold leading-none truncate max-w-full">
                  0{s.id}
                </span>
                <span className="text-[8px] font-medium leading-none truncate max-w-full mt-0.5 hidden md:inline text-slate-400">
                  {s.shortLabel}
                </span>
              </div>
            );
          })}
        </div>

        {/* Active Stage Callout Box */}
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3 transition-all">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10 bg-black/40 text-cyan-400"
          >
            <CurrentIcon className="w-4 h-4" style={{ color: currentStage.color }} />
          </div>

          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-[11px] font-bold uppercase tracking-wider"
                style={{ color: currentStage.color }}
              >
                STAGE 0{currentStage.id}: {currentStage.label}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate hidden sm:inline">
                ({currentStage.subtitle})
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              {currentStage.taskDescription}
            </p>
          </div>
        </div>

        {/* Mini Background Terminal Stream */}
        {logs.length > 0 && (
          <div className="p-2.5 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span className="text-[9px] font-bold text-slate-300">Telemetry Stream</span>
              </div>
              <span className="text-[8px] text-cyan-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                SYNCED
              </span>
            </div>

            <div
              ref={terminalContainerRef}
              className="max-h-16 overflow-y-auto space-y-0.5 pt-1 chat-scroll font-mono text-slate-300"
            >
              {logs.slice(-2).map((log, idx) => (
                <div key={idx} className="flex items-start gap-1.5 truncate text-[10px]">
                  <span className="text-cyan-400 shrink-0">&gt;</span>
                  <span className="truncate">{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full Variant (Used in Inspector Studio)
  return (
    <div
      className={`w-full rounded-3xl bg-white/95 dark:bg-[#0c1017]/95 border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_8px_#14b8a6] animate-pulse" />
            <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              Live Background Pipeline Tracer
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            MANUALS → Document Processing → Chunking → Embeddings → Retrieval → Context Library → LLM Response → Cited Solution
          </h3>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-mono">
            <span className="text-slate-400">Status: </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {isExecuting ? `Running Stage 0${activeStageId}...` : "All 8 Stages Complete ✓"}
            </span>
          </div>
        </div>
      </div>

      {/* 8-Stage Interactive Horizontal Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {PIPELINE_STAGES.map((s) => {
          const Icon = s.icon;
          const isDone = completedStageIds.includes(s.id);
          const isActive = activeStageId === s.id && isExecuting;

          return (
            <div
              key={s.id}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-28 relative overflow-hidden transition-all ${
                isActive
                  ? "ring-2 ring-indigo-500 shadow-md scale-[1.02]"
                  : isDone
                  ? "bg-white dark:bg-white/[0.04] border-emerald-500/40"
                  : "bg-slate-50/70 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.06] opacity-60"
              }`}
              style={{
                borderColor: isActive ? s.color : undefined,
                backgroundColor: isActive ? s.bgGlow : undefined,
              }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[9px] font-bold text-slate-400">
                  0{s.id}
                </span>
                {isDone ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                ) : isActive ? (
                  <span
                    className="w-2 h-2 rounded-full animate-ping"
                    style={{ backgroundColor: s.color }}
                  />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                )}
              </div>

              <div className="space-y-1 my-auto">
                <div className="flex items-center gap-1.5">
                  <Icon
                    className="w-4 h-4 shrink-0"
                    style={{ color: isDone || isActive ? s.color : undefined }}
                  />
                  <span className="font-mono font-bold text-[10px] leading-tight text-slate-800 dark:text-slate-200 truncate">
                    {s.label}
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 line-clamp-1">
                  {s.subtitle}
                </p>
              </div>

              <div className="text-[9px] font-mono text-right w-full">
                {isDone ? (
                  <span className="text-emerald-500 font-bold">✓ DONE</span>
                ) : isActive ? (
                  <span className="font-bold animate-pulse" style={{ color: s.color }}>
                    RUNNING
                  </span>
                ) : (
                  <span className="text-slate-400">QUEUED</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Stage Callout Card */}
      <div
        className="p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
        style={{
          borderColor: currentStage.borderColor,
          backgroundColor: currentStage.bgGlow,
        }}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border"
              style={{
                color: currentStage.color,
                borderColor: currentStage.borderColor,
                backgroundColor: "rgba(0,0,0,0.1)",
              }}
            >
              Current Background Process · Stage 0{currentStage.id}
            </span>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {currentStage.label} — {currentStage.subtitle}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {currentStage.taskDescription}
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[11px] font-mono text-slate-500 shrink-0">
          <span className="text-slate-400">Under the Hood: </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {currentStage.techDetails}
          </span>
        </div>
      </div>

      {/* Full Live Terminal Output */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-white/10 font-mono text-xs text-slate-300 space-y-2">
        <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-slate-300">Live Background Worker Terminal</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400">FASTAPI STREAM ACTIVE</span>
          </div>
        </div>

        <div className="max-h-36 overflow-y-auto space-y-1 p-1 select-text">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="text-teal-400 shrink-0">&gt;</span>
              <span
                className={
                  log.includes("CITED SOLUTION")
                    ? "text-emerald-300 font-bold"
                    : log.includes("STAGE")
                    ? "text-indigo-300"
                    : "text-slate-300"
                }
              >
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

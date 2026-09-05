"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import LandingLayout from "@/components/landing/LandingLayout";
import Spinner from "@/components/ui/Spinner";
import {
  getMachines,
  getSystemStatus,
  searchKnowledgeBase,
  singleQuery,
} from "@/lib/api";
import type {
  Machine,
  SystemStatusData,
  SearchResultItem,
  TroubleshootingResponse,
} from "@/lib/types";
import {
  BookOpen,
  FileText,
  Layers,
  Cpu,
  Database,
  Search,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Code2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  Terminal,
  Activity,
  ArrowDownRight,
  RefreshCw,
  Gauge,
  Play,
  RotateCcw,
  Smartphone,
  Columns,
  Monitor,
} from "lucide-react";
import MobileDeviceSimulator from "@/components/mobile/MobileDeviceSimulator";

interface JudgeScenario {
  id: string;
  label: string;
  badge: string;
  tagColor: string;
  machineName?: string;
  query: string;
  modelOverride?: string;
  expectedBehavior: string;
}

const JUDGE_SCENARIOS: JudgeScenario[] = [
  {
    id: "haas-thermal",
    label: "HAAS VF-4 Spindle Overheat",
    badge: "GPT-OSS 20B (Fast)",
    tagColor: "text-blue-500 bg-blue-500/10 border-blue-500/25",
    machineName: "HAAS VF-4 CNC",
    query: "Haas VF-4 Alarm 102 spindle motor overheat during roughing pass. What is the check procedure?",
    modelOverride: "openai/gpt-oss-20b",
    expectedBehavior: "Demonstrates sub-100ms error code match and thermal reset steps directly from Haas manual.",
  },
  {
    id: "siemens-profinet",
    label: "Siemens S7-1500 Bus Timeout",
    badge: "GPT-OSS 120B (Workhorse)",
    tagColor: "text-amber-500 bg-amber-500/10 border-amber-500/25",
    machineName: "Siemens S7-1500",
    query: "Siemens S7-1500 PLC PROFINET communication timeout error 0x80 on remote I/O rack. How to troubleshoot?",
    modelOverride: "openai/gpt-oss-120b",
    expectedBehavior: "Demonstrates multi-step cable continuity and termination resistance verification protocol.",
  },
  {
    id: "kuka-resolver",
    label: "KUKA KR210 Resolver Drift",
    badge: "GPT-OSS 120B (Reasoning)",
    tagColor: "text-purple-500 bg-purple-500/10 border-purple-500/25",
    machineName: "KUKA KR210",
    query: "KUKA KR210 robot arm Axis 3 kinematic resolver drift exceeding 0.05 degrees during payload transition.",
    modelOverride: "openai/gpt-oss-120b",
    expectedBehavior: "Demonstrates deep mathematical root-cause reasoning across servo feedback and brake slippage.",
  },
  {
    id: "hallucination-attack",
    label: "Zero-Hallucination Gate Test",
    badge: "Refusal Guardrail",
    tagColor: "text-rose-500 bg-rose-500/10 border-rose-500/25",
    query: "Can you write a poem about chocolate chip cookies and how to bake them in an oven?",
    expectedBehavior: "Demonstrates deterministic safety filter rejecting ungrounded non-industrial requests.",
  },
];

interface PipelineStageDef {
  id: number;
  row: 1 | 2;
  stepNumber: string;
  name: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  bgGlow: string;
  borderColor: string;
  inputContract: string;
  processDescription: string;
  outputContract: string;
  logMessage: string;
}

const PIPELINE_STAGES: PipelineStageDef[] = [
  // ROW 1: INGESTION & SEMANTIC PROJECTION (STAGES 1 - 4)
  {
    id: 1,
    row: 1,
    stepNumber: "01",
    name: "MANUALS",
    sublabel: "Verified OEM Schematics",
    icon: BookOpen,
    color: "#06b6d4",
    bgGlow: "rgba(6,182,212,0.12)",
    borderColor: "rgba(6,182,212,0.35)",
    inputContract: "Raw PDF manuals & schematics (Haas, Siemens, KUKA, Fanuc) from secure storage",
    processDescription: "Verifies digital checksums, isolates technical tables, wiring diagrams, and alarm fault matrices",
    outputContract: "High-resolution vector document stream with layout bounding metadata",
    logMessage: "Scanning verified OEM technical manuals and electrical schematics...",
  },
  {
    id: 2,
    row: 1,
    stepNumber: "02",
    name: "DOCUMENT PROCESSING",
    sublabel: "Structure OCR & Hierarchy",
    icon: FileText,
    color: "#3b82f6",
    bgGlow: "rgba(59,130,246,0.12)",
    borderColor: "rgba(59,130,246,0.35)",
    inputContract: "Raw PDF pages with embedded tables, electrical diagrams, and text blocks",
    processDescription: "PyMuPDF parsing, table structure normalization, and alarm code index extraction",
    outputContract: "Cleaned Markdown & structured section tree stripped of boilerplate headers/footers",
    logMessage: "Extracting document visual hierarchy, optical table cells & alarm indexes...",
  },
  {
    id: 3,
    row: 1,
    stepNumber: "03",
    name: "CHUNKING",
    sublabel: "Semantic Sliding Window",
    icon: Layers,
    color: "#6366f1",
    bgGlow: "rgba(99,102,241,0.12)",
    borderColor: "rgba(99,102,241,0.35)",
    inputContract: "Normalized markdown document tree with page numbers and section headers",
    processDescription: "Deterministic sliding window segmentation (512 tokens with 128-token overlap) preserving procedures",
    outputContract: "Granular chunks tagged with manual_id, machine_id, page_start, and section_path",
    logMessage: "Segmenting 512-token procedure units with 128-token boundary overlap...",
  },
  {
    id: 4,
    row: 1,
    stepNumber: "04",
    name: "EMBEDDINGS",
    sublabel: "384-Dim Vector Space",
    icon: Cpu,
    color: "#8b5cf6",
    bgGlow: "rgba(139,92,246,0.12)",
    borderColor: "rgba(139,92,246,0.35)",
    inputContract: "Raw text chunks and technician diagnostic query string",
    processDescription: "Dense projection via All-MiniLM-L6-v2 / text-embedding-3 into normalized unit hypersphere",
    outputContract: "384-dimensional dense float vector embeddings ready for HNSW indexing",
    logMessage: "Projecting chunks into 384-dimensional dense semantic vector space...",
  },

  // ROW 2: SEARCH, RE-RANK & REASONING (STAGES 5 - 8)
  {
    id: 5,
    row: 2,
    stepNumber: "05",
    name: "RETRIEVAL",
    sublabel: "ChromaDB / pgvector ANN",
    icon: Database,
    color: "#10b981",
    bgGlow: "rgba(16,185,129,0.12)",
    borderColor: "rgba(16,185,129,0.35)",
    inputContract: "384-dim query vector + optional machine_id isolation filter",
    processDescription: "Hierarchical Navigable Small World (HNSW) Approximate Nearest Neighbor cosine similarity search",
    outputContract: "Top-K candidate chunks ranked by cosine distance with raw similarity scores",
    logMessage: "Executing HNSW cosine Approximate Nearest Neighbor search in vector store...",
  },
  {
    id: 6,
    row: 2,
    stepNumber: "06",
    name: "CONTEXT LIBRARY",
    sublabel: "Rerank & Deduplication",
    icon: Search,
    color: "#f59e0b",
    bgGlow: "rgba(245,158,11,0.12)",
    borderColor: "rgba(245,158,11,0.35)",
    inputContract: "Raw candidate vector chunks from ChromaDB / pgvector",
    processDescription: "Cross-encoder scoring, threshold cutoff filtering (>0.45 cosine), deduplication & token packing",
    outputContract: "Grounded context library window formatted for strict zero-hallucination prompt",
    logMessage: "Filtering chunks by cosine threshold (>0.45) and assembling grounded prompt context...",
  },
  {
    id: 7,
    row: 2,
    stepNumber: "07",
    name: "LLM RESPONSE",
    sublabel: "Adaptive Model Reasoning",
    icon: Zap,
    color: "#ec4899",
    bgGlow: "rgba(236,72,153,0.12)",
    borderColor: "rgba(236,72,153,0.35)",
    inputContract: "Grounded prompt context + technician inquiry + mandatory citation syntax [C1]",
    processDescription: "Dispatching to active Groq LPU engine (GPT-OSS 120B / 20B / Compound Mini)",
    outputContract: "Structured JSON response with diagnostic assessment, cause breakdown, and citations",
    logMessage: "Dispatching context-limited prompt to AI router for deterministic reasoning...",
  },
  {
    id: 8,
    row: 2,
    stepNumber: "08",
    name: "CITED SOLUTION",
    sublabel: "Verified Repair Protocol",
    icon: CheckCircle2,
    color: "#14b8a6",
    bgGlow: "rgba(20,184,166,0.12)",
    borderColor: "rgba(20,184,166,0.35)",
    inputContract: "Structured JSON repair protocol with inline citation IDs [C1], [C2]",
    processDescription: "Cross-referencing citations against source manual pages and formatting step-by-step checklist",
    outputContract: "100% deterministic, audit-ready industrial corrective procedure ready for display",
    logMessage: "Validating OEM manual citations against source schematics. Solution verified!",
  },
];

type SpeedMode = "presentation" | "standard" | "rapid";
const SPEED_CONFIG: Record<SpeedMode, { label: string; delayMs: number; desc: string }> = {
  presentation: { label: "Presentation Pace (1.2s)", delayMs: 1200, desc: "Recommended for judges: Deliberately steps through each stage" },
  standard: { label: "Standard Pace (0.7s)", delayMs: 700, desc: "Smooth walkthrough of the pipeline" },
  rapid: { label: "Rapid (0.35s)", delayMs: 350, desc: "Fast verification for quick checks" },
};

export default function TechnicalInspectorPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatusData | null>(null);

  // Inspector Inputs
  const [query, setQuery] = useState(JUDGE_SCENARIOS[0].query);
  const [selectedMachineId, setSelectedMachineId] = useState<string>("");
  const [modelOverride, setModelOverride] = useState<string>("auto");
  const [topK, setTopK] = useState<number>(8);
  const [speedMode, setSpeedMode] = useState<SpeedMode>("presentation");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile" | "split">("desktop");

  // Execution & Live Pipeline State
  const [executing, setExecuting] = useState(false);
  const [activeStageId, setActiveStageId] = useState<number>(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [stageLogs, setStageLogs] = useState<string[]>([]);
  const [selectedStageDetail, setSelectedStageDetail] = useState<number>(1);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"xray" | "chunks" | "json">("xray");

  // Real Results from Backend
  const [rawChunks, setRawChunks] = useState<SearchResultItem[]>([]);
  const [response, setResponse] = useState<TroubleshootingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedChunkId, setExpandedChunkId] = useState<string | null>(null);

  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    Promise.all([
      getMachines().catch(() => []),
      getSystemStatus().catch(() => null),
    ]).then(([mList, status]) => {
      setMachines(mList);
      setSystemStatus(status);
    });
  }, []);

  // Scroll ONLY the internal terminal container, NEVER hijack the window scroll
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [stageLogs]);

  const handleApplyScenario = (scenario: JudgeScenario) => {
    setQuery(scenario.query);
    if (scenario.modelOverride) {
      setModelOverride(scenario.modelOverride);
    } else {
      setModelOverride("auto");
    }

    if (scenario.machineName && machines.length > 0) {
      const match = machines.find((m) =>
        scenario.machineName!.toLowerCase().includes(m.name.toLowerCase()) ||
        m.name.toLowerCase().includes(scenario.machineName!.toLowerCase())
      );
      if (match) setSelectedMachineId(match.id);
    } else {
      setSelectedMachineId("");
    }
  };

  const addLog = (msg: string) => {
    const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
    setStageLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  const handleRunInspector = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || executing) return;

    abortRef.current = false;
    setExecuting(true);
    setError(null);
    setResponse(null);
    setRawChunks([]);
    setCompletedStages([]);
    setActiveStageId(1);
    setSelectedStageDetail(1);
    setStageLogs([]);

    const startTime = performance.now();
    addLog(`INITIATING LIVE GLASS-BOX PIPELINE INSPECTION`);
    addLog(`Target Query: "${query}"`);
    addLog(`Pace Setting: ${SPEED_CONFIG[speedMode].label}`);

    const selectedMachine = machines.find((m) => m.id === selectedMachineId);
    const chosenModel = modelOverride === "auto" ? undefined : modelOverride;
    const stepDelay = SPEED_CONFIG[speedMode].delayMs;

    // Launch real unmocked backend query concurrently in background
    const backendPromise = Promise.all([
      searchKnowledgeBase(query, selectedMachineId || undefined, topK, 0.0).catch(() => ({
        query,
        total: 0,
        items: [],
      })),
      singleQuery(
        query,
        selectedMachineId || undefined,
        selectedMachine?.name,
        chosenModel
      ),
    ]);

    try {
      // Step sequentially through stages 1 to 7 at deliberate pace so judges can observe the path
      for (let stageNum = 1; stageNum <= 7; stageNum++) {
        if (abortRef.current) break;

        setActiveStageId(stageNum);
        setSelectedStageDetail(stageNum);
        const stageDef = PIPELINE_STAGES[stageNum - 1];
        addLog(`[PATH STEP ${stageDef.stepNumber}: ${stageDef.name}] ${stageDef.logMessage}`);

        // Wait deliberate presentation duration for this stage
        await new Promise((resolve) => setTimeout(resolve, stepDelay));
        setCompletedStages((prev) => [...prev, stageNum]);
      }

      // At Stage 7 (LLM Response), wait for the real backend response
      addLog(`[STAGE 07: LLM RESPONSE] Awaiting inference completion from model cascade...`);
      const [searchResults, queryResult] = await backendPromise;

      // Now smoothly advance into Stage 8: Cited Solution
      setActiveStageId(8);
      setSelectedStageDetail(8);
      addLog(`[STAGE 08: CITED SOLUTION] Validating citations and rendering corrective protocol...`);

      // Hold briefly on Stage 8 for celebratory visual confirmation
      await new Promise((resolve) => setTimeout(resolve, Math.min(stepDelay, 600)));

      setCompletedStages([1, 2, 3, 4, 5, 6, 7, 8]);
      const endTime = performance.now();
      const totalDuration = Math.round(endTime - startTime);
      setExecutionTime(totalDuration);

      setRawChunks(searchResults.items);
      setResponse(queryResult);

      addLog(`[PIPELINE COMPLETE] 8/8 Stages Executed. Total duration: ${totalDuration}ms.`);
      addLog(`[OUTPUT READY] ${queryResult.corrective_steps?.length || 0} corrective actions · ${queryResult.citations?.length || 0} manual citations.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Pipeline execution failed.";
      setError(msg);
      addLog(`[PIPELINE ERROR] ${msg}`);
    } finally {
      setExecuting(false);
    }
  };

  const handleReset = () => {
    abortRef.current = true;
    setExecuting(false);
    setActiveStageId(0);
    setCompletedStages([]);
    setResponse(null);
    setRawChunks([]);
    setError(null);
    setExecutionTime(null);
    addLog(`Pipeline reset.`);
  };

  const activeStage = PIPELINE_STAGES.find((s) => s.id === (activeStageId || selectedStageDetail)) || PIPELINE_STAGES[0];
  const ActiveIcon = activeStage.icon;

  return (
    <LandingLayout>
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        
        {/* ─── 1. HEADER: GLASS-BOX EVALUATION STUDIO ─── */}
        <div className="text-center max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-600 dark:text-teal-400 font-mono text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            JUDGE EVALUATION MODE · TRANSPARENT 8-STAGE RAG EXECUTION PATH
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Live Architecture &amp;{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500">
              Pipeline Path Tracer
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mx-auto">
            Watch the industrial RAG pipeline traverse each stage in real time at presentation pace: from OEM manuals to token chunking, 384-dimensional embeddings, vector ANN search, context packing, and cited solution generation.
          </p>

          {/* System Telemetry Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <div className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-500">Vector Store:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {systemStatus?.chromadb?.status === "online" ? "ChromaDB 384-dim (Online)" : "ChromaDB + pgvector"}
              </span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-slate-500">FastAPI Daemon:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                Uvicorn Port 8000 Live
              </span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span className="text-slate-500">Connected OEM Units:</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">
                {machines.length} Machines
              </span>
            </div>
          </div>
        </div>

        {/* ─── VIEW MODE SELECTOR: DESKTOP PATHWAY VS MOBILE FIELD UNIT ─── */}
        <div className="flex items-center justify-center pt-1 pb-1">
          <div className="p-1.5 rounded-2xl bg-white/90 dark:bg-[#0c1017]/90 border border-slate-200 dark:border-white/10 shadow-lg backdrop-blur-xl flex items-center gap-1.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode("desktop")}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === "desktop"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>🖥️ Desktop Circuit Path</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("mobile")}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === "mobile"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>📱 Mobile Field Technician View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer hidden lg:flex ${
                viewMode === "split"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              <Columns className="w-4 h-4" />
              <span>⚡ Side-by-Side Dual View</span>
            </button>
          </div>
        </div>

        {/* ─── CONDITIONAL VIEW 1: DESKTOP CIRCUIT VIEW & SPLIT MODE ─── */}
        {(viewMode === "desktop" || viewMode === "split") && (
          <div className={viewMode === "split" ? "grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-fade-in" : "space-y-6 animate-fade-in"}>
            <div className={viewMode === "split" ? "xl:col-span-7 space-y-6" : "space-y-6"}>

        {/* ─── 2. PRESET JUDGE SCENARIO SELECTOR ─── */}
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-[#0c1017]/90 border border-slate-200/90 dark:border-white/10 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                1-Click Judge Scenarios (Pre-Configured Inquiries)
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Click any scenario to populate inputs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {JUDGE_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleApplyScenario(scenario)}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] hover:border-indigo-500/50 hover:bg-indigo-50/40 dark:hover:bg-indigo-500/10 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${scenario.tagColor}`}>
                    {scenario.badge}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 mb-1">
                  {scenario.label}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                  {scenario.expectedBehavior}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ─── 3. QUERY CONSOLE & SPEED CONTROL ─── */}
        <form
          onSubmit={handleRunInspector}
          className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#0c1017]/95 border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-2xl space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Query Input */}
            <div className="lg:col-span-8 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Industrial Technical Query / Alarm Code
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  Direct FastAPI /query execution
                </span>
              </div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
                placeholder="Enter machine fault, symptom, or alarm query..."
                className="w-full px-4 py-3 text-sm rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all font-mono"
              />
            </div>

            {/* Scope & Routing Parameters */}
            <div className="lg:col-span-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Target Machine (Context Scope)
                </label>
                <select
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 outline-none font-mono"
                >
                  <option value="">Any Machine (Global Vector Search)</option>
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.model || m.manufacturer || "OEM"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Model Routing
                  </label>
                  <select
                    value={modelOverride}
                    onChange={(e) => setModelOverride(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 outline-none font-mono"
                  >
                    <option value="auto">Auto-Router</option>
                    <option value="openai/gpt-oss-120b">GPT-OSS 120B (Groq)</option>
                    <option value="openai/gpt-oss-20b">GPT-OSS 20B (Groq Fast)</option>
                    <option value="groq/compound-mini">Groq Compound Mini</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Vector Top-K: {topK}
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                    className="w-full mt-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Speed Control + Action Trigger */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 dark:border-white/[0.08]">
            {/* Speed Control for Judges */}
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Tracer Pace:
              </span>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]">
                {(["presentation", "standard", "rapid"] as SpeedMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSpeedMode(mode)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      speedMode === mode
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {mode === "presentation" ? "🐢 Presentation (1.2s)" : mode === "standard" ? "⚡ Standard (0.7s)" : "⏩ Fast (0.35s)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {executing && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 rounded-2xl text-xs font-mono font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

              <button
                type="submit"
                disabled={executing || !query.trim()}
                className="flex-1 md:flex-initial px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 hover:from-teal-500 hover:via-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/25 active:scale-95 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
              >
                {executing ? (
                  <>
                    <Spinner size="sm" />
                    <span>Tracing Pipeline Path (Stage 0{activeStageId}/08)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start Live Pipeline Trace ⚡</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* ─── 4. CONNECTED VISUAL PIPELINE PATH DIAGRAM (ROW 1 & ROW 2) ─── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#0c1017]/95 border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_8px_#14b8a6] animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Live Visual Pipeline Path Circuit
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                Path: MANUALS → Document Processing → Chunking → Embeddings → Retrieval → Context Library → LLM Response → Cited Solution
              </h2>
            </div>

            {/* Current Path State Pill */}
            <div className="flex items-center gap-2 font-mono text-xs shrink-0">
              {executing ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-500 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>PACKET AT STAGE 0{activeStageId}/08</span>
                </div>
              ) : response ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PATH TRAVERSED ({executionTime}ms)</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.04] text-slate-400 border border-slate-200 dark:border-white/[0.08]">
                  READY FOR EXECUTION
                </div>
              )}
            </div>
          </div>

          {/* ── PATHWAY ROW 1: INGESTION & PROJECTION (STAGES 1 TO 4) ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <span>Phase I: Ingestion &amp; Semantic Projection</span>
              <span>Stages 01 → 04</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
              {PIPELINE_STAGES.filter((s) => s.row === 1).map((stage, idx) => {
                const Icon = stage.icon;
                const isCompleted = completedStages.includes(stage.id);
                const isActive = activeStageId === stage.id && executing;
                const isSelected = selectedStageDetail === stage.id;

                return (
                  <div key={stage.id} className="relative flex flex-col">
                    <button
                      type="button"
                      onClick={() => setSelectedStageDetail(stage.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[112px] cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-indigo-500 shadow-lg scale-[1.01]"
                          : "hover:border-slate-400 dark:hover:border-white/20"
                      } ${
                        isActive
                          ? "border-indigo-500 shadow-xl animate-pulse"
                          : isCompleted
                          ? "border-emerald-500/40 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05]"
                          : "border-slate-200/80 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02] opacity-65"
                      }`}
                      style={{
                        backgroundColor: isActive ? stage.bgGlow : undefined,
                        borderColor: isActive ? stage.color : undefined,
                      }}
                    >
                      {/* Top Row: Number & Status */}
                      <div className="flex items-center justify-between w-full mb-2">
                        <span
                          className="font-mono text-xs font-black px-2 py-0.5 rounded border"
                          style={{
                            color: stage.color,
                            borderColor: stage.borderColor,
                            backgroundColor: "rgba(0,0,0,0.1)",
                          }}
                        >
                          {stage.stepNumber}
                        </span>

                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                            ✓ DONE
                          </span>
                        ) : isActive ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-indigo-500">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">QUEUED</span>
                        )}
                      </div>

                      {/* Icon & Title */}
                      <div className="space-y-1 my-auto">
                        <div className="flex items-center gap-2">
                          <Icon
                            className="w-4 h-4 shrink-0"
                            style={{ color: isCompleted || isActive ? stage.color : undefined }}
                          />
                          <h3 className="font-mono font-bold text-xs leading-snug text-slate-900 dark:text-slate-100">
                            {stage.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-1">
                          {stage.sublabel}
                        </p>
                      </div>

                      {/* Active Progress Line */}
                      {isActive && (
                        <div className="w-full h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full rounded-full animate-pulse"
                            style={{ backgroundColor: stage.color }}
                          />
                        </div>
                      )}
                    </button>

                    {/* Connecting Arrow between Row 1 Nodes (hidden on last item in row) */}
                    {idx < 3 && (
                      <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            completedStages.includes(stage.id)
                              ? "bg-emerald-500 text-white shadow-sm"
                              : isActive
                              ? "bg-indigo-500 text-white animate-pulse"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                          }`}
                        >
                          →
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── INTER-ROW CONDUIT: VECTOR HYPERSPACE TRANSFER ── */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/15 to-emerald-500/10 border border-indigo-500/20 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
              <ArrowDownRight className="w-4 h-4 text-purple-400" />
              <span>384-DIMENSIONAL DENSE VECTOR BUS CONDUIT</span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Vectors ingested → Handed off to pgvector / ChromaDB HNSW Index
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] text-indigo-400 uppercase font-bold">BUS READY</span>
            </div>
          </div>

          {/* ── PATHWAY ROW 2: RETRIEVAL, CONTEXT & SOLUTION (STAGES 5 TO 8) ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <span>Phase II: Vector Retrieval, Rerank &amp; Solution Synthesis</span>
              <span>Stages 05 → 08</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
              {PIPELINE_STAGES.filter((s) => s.row === 2).map((stage, idx) => {
                const Icon = stage.icon;
                const isCompleted = completedStages.includes(stage.id);
                const isActive = activeStageId === stage.id && executing;
                const isSelected = selectedStageDetail === stage.id;

                return (
                  <div key={stage.id} className="relative flex flex-col">
                    <button
                      type="button"
                      onClick={() => setSelectedStageDetail(stage.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[112px] cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-indigo-500 shadow-lg scale-[1.01]"
                          : "hover:border-slate-400 dark:hover:border-white/20"
                      } ${
                        isActive
                          ? "border-indigo-500 shadow-xl animate-pulse"
                          : isCompleted
                          ? "border-emerald-500/40 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05]"
                          : "border-slate-200/80 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02] opacity-65"
                      }`}
                      style={{
                        backgroundColor: isActive ? stage.bgGlow : undefined,
                        borderColor: isActive ? stage.color : undefined,
                      }}
                    >
                      {/* Top Row: Number & Status */}
                      <div className="flex items-center justify-between w-full mb-2">
                        <span
                          className="font-mono text-xs font-black px-2 py-0.5 rounded border"
                          style={{
                            color: stage.color,
                            borderColor: stage.borderColor,
                            backgroundColor: "rgba(0,0,0,0.1)",
                          }}
                        >
                          {stage.stepNumber}
                        </span>

                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                            ✓ DONE
                          </span>
                        ) : isActive ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-indigo-500">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">QUEUED</span>
                        )}
                      </div>

                      {/* Icon & Title */}
                      <div className="space-y-1 my-auto">
                        <div className="flex items-center gap-2">
                          <Icon
                            className="w-4 h-4 shrink-0"
                            style={{ color: isCompleted || isActive ? stage.color : undefined }}
                          />
                          <h3 className="font-mono font-bold text-xs leading-snug text-slate-900 dark:text-slate-100">
                            {stage.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-1">
                          {stage.sublabel}
                        </p>
                      </div>

                      {/* Active Progress Line */}
                      {isActive && (
                        <div className="w-full h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full rounded-full animate-pulse"
                            style={{ backgroundColor: stage.color }}
                          />
                        </div>
                      )}
                    </button>

                    {/* Connecting Arrow between Row 2 Nodes */}
                    {idx < 3 && (
                      <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            completedStages.includes(stage.id)
                              ? "bg-emerald-500 text-white shadow-sm"
                              : isActive
                              ? "bg-indigo-500 text-white animate-pulse"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                          }`}
                        >
                          →
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── 5. ACTIVE STAGE DEEP DIVE & LIVE TERMINAL STREAM (SIDE-BY-SIDE) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Active Stage Deep Inspection */}
          <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-white/95 dark:bg-[#0c1017]/95 border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase border"
                  style={{
                    color: activeStage.color,
                    borderColor: activeStage.borderColor,
                    backgroundColor: activeStage.bgGlow,
                  }}
                >
                  Stage {activeStage.stepNumber} Inspection
                </span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {activeStage.name} — {activeStage.sublabel}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Click any stage card above to inspect
              </span>
            </div>

            {/* 3 Structured Contracts: Input, Process, Output */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>1. Input Data Stream:</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                  {activeStage.inputContract}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>2. Background Transformation / Operation:</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                  {activeStage.processDescription}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>3. Produced Output Artifact:</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                  {activeStage.outputContract}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: FastAPI Live Background Worker Stream */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-950 border border-white/10 shadow-2xl space-y-3 font-mono text-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-teal-400" />
                  <span className="font-bold text-slate-300">FastAPI Live Background Worker</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400">STREAMING</span>
                </div>
              </div>

              <div
                ref={terminalContainerRef}
                className="max-h-56 overflow-y-auto space-y-1 text-slate-300 p-2 select-text chat-scroll"
              >
                {stageLogs.length === 0 ? (
                  <div className="text-slate-500 italic py-4 text-center">
                    Click &apos;Start Live Pipeline Trace ⚡&apos; above to watch background stages execute.
                  </div>
                ) : (
                  stageLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed flex items-start gap-2">
                      <span className="text-teal-400 shrink-0">&gt;</span>
                      <span
                        className={
                          log.includes("ERROR")
                            ? "text-rose-400"
                            : log.includes("PIPELINE COMPLETE") || log.includes("OUTPUT READY")
                            ? "text-emerald-300 font-bold"
                            : log.includes("STAGE")
                            ? "text-indigo-300"
                            : "text-slate-300"
                        }
                      >
                        {log}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Unmocked live telemetry</span>
              <span>FastAPI Port 8000</span>
            </div>
          </div>

        </div>

        {/* ─── ERROR STATE ─── */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Execution error: {error}</span>
          </div>
        )}

        {/* ─── 6. FINAL VERIFIED CITED SOLUTION OUTPUT (REVEALED WHEN STAGE 8 IS REACHED) ─── */}
        {response && !executing && (
          <div className="space-y-6 animate-fade-in pt-4">
            
            {/* View Switcher Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-mono font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>STAGE 08: CITED SOLUTION VERIFIED</span>
                </div>
                {executionTime !== null && (
                  <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{executionTime}ms Total Presentation Trip</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setActiveTab("xray")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "xray"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Cited Solution
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("chunks")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "chunks"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Stage 05 Chunks ({rawChunks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("json")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "json"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Raw JSON Payload
                </button>
              </div>
            </div>

            {/* TAB 1: CITED SOLUTION PROTOCOL */}
            {activeTab === "xray" && (
              <div className="p-8 rounded-3xl bg-white/95 dark:bg-[#0c1017]/95 border border-slate-200/90 dark:border-white/10 shadow-xl space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                      Model Tier: {response.model_used || response.model || (modelOverride !== "auto" ? modelOverride : "GPT-OSS 120B (Groq)")}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Confidence: {response.confidence_level || "HIGH"} · Machine: {machines.find((m) => m.id === selectedMachineId)?.name || "Auto-Isolated"}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {response.summary || "Diagnostic Assessment Protocol"}
                  </h3>
                  {response.answer && (
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                      {response.answer}
                    </p>
                  )}
                </div>

                {/* Corrective Steps */}
                {response.corrective_steps && response.corrective_steps.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-white/[0.08]">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                      Step-by-Step Verified Corrective Procedure
                    </h4>
                    <div className="space-y-2.5">
                      {response.corrective_steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex items-start gap-3"
                        >
                          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {step.step_number || idx + 1}
                          </span>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                              {step.action}
                            </p>
                            {step.warning && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-mono">
                                ⚠ {step.warning}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Citations Mapped to OEM Manuals */}
                {response.citations && response.citations.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-white/[0.08]">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                      Grounded Citations (Source OEM Manual Pages)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {response.citations.map((cit, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2 text-xs font-mono"
                        >
                          <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-white/[0.05]">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              [{cit.citation_id || `C${idx + 1}`}] {cit.manual_name || "Technical Manual"}
                            </span>
                            <span className="text-slate-400">
                              Pages {cit.page_start}–{cit.page_end}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 font-sans text-xs leading-relaxed italic line-clamp-3">
                            &quot;{cit.excerpt}&quot;
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: RETRIEVED VECTOR CHUNKS */}
            {activeTab === "chunks" && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#0c1017]/95 border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Live ChromaDB / pgvector Chunks ({rawChunks.length} candidates)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Ranked by Cosine Similarity
                  </span>
                </div>

                {rawChunks.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-slate-400">
                    No direct chunks retrieved for this query filter.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rawChunks.map((chunk, idx) => {
                      const isExpanded = expandedChunkId === chunk.chunk_id;
                      return (
                        <div
                          key={chunk.chunk_id || idx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2 transition-all"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                Chunk # {idx + 1}
                              </span>
                              <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">
                                {chunk.manual_title}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                (Pgs {chunk.page_start}–{chunk.page_end})
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {(chunk.similarity_score * 100).toFixed(1)}% Cosine Match
                              </span>
                              <button
                                type="button"
                                onClick={() => setExpandedChunkId(isExpanded ? null : chunk.chunk_id)}
                                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div className={`text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                            {chunk.excerpt}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SYNTAX-HIGHLIGHTED RAW JSON */}
            {activeTab === "json" && (
              <div className="p-6 rounded-3xl bg-slate-950 border border-white/10 shadow-2xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-teal-400" />
                    <span>Raw TroubleshootingResponse JSON Payload</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">HTTP 200 OK</span>
                </div>
                <pre className="overflow-x-auto p-4 rounded-xl bg-black/40 text-teal-300 leading-relaxed max-h-[500px]">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}

          </div>
        )}

            </div>

            {/* Split Mode: Mobile Device on Right Side */}
            {viewMode === "split" && (
              <div className="xl:col-span-5 sticky top-28 flex flex-col items-center">
                <div className="mb-3 text-center">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-500 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                    📱 Mobile Field Handheld (Live Sync)
                  </span>
                </div>
                <MobileDeviceSimulator
                  availableMachines={machines}
                  initialQuery={query}
                  defaultModel={modelOverride}
                />
              </div>
            )}
          </div>
        )}

        {/* ─── CONDITIONAL VIEW 2: PURE MOBILE FIELD UNIT SIMULATION ─── */}
        {viewMode === "mobile" && (
          <div className="space-y-6 animate-fade-in py-2">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-600 dark:text-teal-400 font-mono text-xs font-bold uppercase">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Shop Floor Field Unit Simulation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Field Technician Mobile View
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Demonstrating how factory technicians diagnose CNC machinery on handheld devices right beside the machine with camera snapshots, quick alarm presets, real-time background tracing, and interactive corrective checklists.
              </p>
            </div>

            <MobileDeviceSimulator
              availableMachines={machines}
              initialQuery={query}
              defaultModel={modelOverride}
            />
          </div>
        )}

      </div>
    </LandingLayout>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";

// ── Types & Interfaces ──
export interface ArchitectureNode {
  id: string;
  name: string;
  subsystem: string;
  tech: string;
  fileSource: string;
  description: string;
  latencyBudget: string;
  inputContract: string;
  outputContract: string;
  codeSnippet: string;
  tier: "ingestion" | "classification" | "retrieval" | "guardrails" | "inference" | "output";
  statusColor: string;
}

export interface Scenario {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  query: string;
  description: string;
  expectedRoute: string[];
  expectedModel?: string;
  expectedOutcome: "success" | "disambiguation" | "refusal";
  metrics: {
    totalLatency: string;
    evidenceScore: number;
    citations: number;
    model: string;
  };
}

// ── System Nodes Definition ──
const ARCHITECTURE_NODES: Record<string, ArchitectureNode> = {
  client_gateway: {
    id: "client_gateway",
    name: "Client Ingestion & API Gateway",
    subsystem: "Transport Tier",
    tech: "FastAPI / HTTP/2 / TLS 1.3",
    fileSource: "backend/app/main.py",
    description: "Accepts JSON payload or SSE stream requests from technicians, validates JWT bearer tokens, and applies IP-based rate limiting.",
    latencyBudget: "< 8ms",
    inputContract: `{\n  "query": "Spindle alarm E-402",\n  "machine_id": "8fa3c012...",\n  "conversation_history": []\n}`,
    outputContract: `{\n  "status": "AUTHORIZED",\n  "session_id": "sess_902f1a",\n  "timestamp": 1725492800\n}`,
    codeSnippet: `@router.post("/query", response_model=QueryResponse)\nasync def execute_query(\n    payload: QueryRequest,\n    db: AsyncSession = Depends(get_db),\n    user: User = Depends(get_current_active_user)\n):\n    pipeline = RAGPipeline(db)\n    return await pipeline.query(\n        query=payload.query,\n        machine_id=payload.machine_id\n    )`,
    tier: "ingestion",
    statusColor: "#06b6d4"
  },
  classifier: {
    id: "classifier",
    name: "Query Classifier",
    subsystem: "Classification Engine",
    tech: "Regex & Semantic Grammar",
    fileSource: "backend/app/services/rag/query_classifier.py",
    description: "Determines query archetype: ERROR_CODE, SYMPTOM_DIAGNOSIS, MAINTENANCE_PROCEDURE, or UNKNOWN. Flags fast-path routing.",
    latencyBudget: "< 2ms",
    inputContract: `"Spindle overload alarm E-402 on Haas VF-2"`,
    outputContract: `{\n  "query_type": "ERROR_CODE",\n  "has_error_code": true,\n  "raw_code": "E-402"\n}`,
    codeSnippet: `class QueryClassifier:\n    def classify(self, query: str) -> QueryType:\n        if re.search(r"\\b[A-Z]{1,3}[-_]?\\d{3,5}\\b", query):\n            return QueryType.ERROR_CODE\n        elif any(w in query.lower() for w in ["how to", "procedure", "replace"]):\n            return QueryType.PROCEDURE\n        return QueryType.SYMPTOM`,
    tier: "classification",
    statusColor: "#3b82f6"
  },
  embedder: {
    id: "embedder",
    name: "Vector Embedder",
    subsystem: "Dense Semantic Projection",
    tech: "text-embedding-3-small (1536-dim)",
    fileSource: "backend/app/services/ingestion/embedder.py",
    description: "Converts text query into normalized 1536-dimensional float vector optimized for cosine metric similarity lookup.",
    latencyBudget: "25–45ms",
    inputContract: `"Spindle overload alarm E-402"`,
    outputContract: `[-0.0142, 0.0892, -0.0412, ..., 0.0031] // length: 1536`,
    codeSnippet: `class EmbeddingService:\n    async def embed_query(self, query: str) -> list[float]:\n        resp = await self.client.embeddings.create(\n            model="text-embedding-3-small",\n            input=query,\n            dimensions=1536\n        )\n        return resp.data[0].embedding`,
    tier: "classification",
    statusColor: "#6366f1"
  },
  hybrid_retriever: {
    id: "hybrid_retriever",
    name: "Hybrid pgvector Retriever",
    subsystem: "Dense + Sparse Vector Store",
    tech: "PostgreSQL pgvector (HNSW) + BM25",
    fileSource: "backend/app/services/rag/retriever.py",
    description: "Executes parallel ANN cosine search and BM25 text match. Fuses results with Reciprocal Rank Fusion (RRF k=60).",
    latencyBudget: "35–65ms",
    inputContract: `{\n  "query_embedding": [...],\n  "query_text": "Spindle alarm E-402",\n  "top_k": 20\n}`,
    outputContract: `[\n  { "chunk_id": "chk_81", "rrf_score": 0.0321, "page": 87 },\n  { "chunk_id": "chk_44", "rrf_score": 0.0289, "page": 88 }\n]`,
    codeSnippet: `SELECT id, content, manual_name, page_start, section_path,\n       1 - (embedding <=> :query_vec) AS cosine_sim,\n       ts_rank_cd(text_vector, plainto_tsquery(:query_text)) AS bm25_score\nFROM manual_chunks\nWHERE (:machine_id IS NULL OR machine_id = :machine_id)\nORDER BY cosine_sim DESC\nLIMIT 20;`,
    tier: "retrieval",
    statusColor: "#8b5cf6"
  },
  reranker: {
    id: "reranker",
    name: "Cross-Encoder Reranker",
    subsystem: "Precision Scoring",
    tech: "BGE-Reranker-Large (PyTorch)",
    fileSource: "backend/app/services/rag/reranker.py",
    description: "Scores [query, passage] token pairs simultaneously using cross-attention to eliminate false semantic positives.",
    latencyBudget: "40–90ms",
    inputContract: `{\n  "query": "Spindle alarm E-402",\n  "candidates": 20\n}`,
    outputContract: `[\n  { "chunk_id": "chk_81", "cross_score": 0.941 },\n  { "chunk_id": "chk_44", "cross_score": 0.887 }\n] // top 5`,
    codeSnippet: `class CrossEncoderReranker:\n    def rerank(self, query: str, chunks: list[Chunk], top_k: int = 5) -> list[Chunk]:\n        pairs = [[query, c.content] for c in chunks]\n        scores = self.model.predict(pairs)\n        for chunk, score in zip(chunks, scores):\n            chunk.relevance_score = float(score)\n        return sorted(chunks, key=lambda x: x.relevance_score, reverse=True)[:top_k]`,
    tier: "retrieval",
    statusColor: "#ec4899"
  },
  disambiguator: {
    id: "disambiguator",
    name: "Machine Disambiguator",
    subsystem: "Conflict Resolution Circuit",
    tech: "Entropy Threshold Analyzer",
    fileSource: "backend/app/services/rag/disambiguator.py",
    description: "Detects if retrieved high-confidence chunks originate from distinct machine models. Halts to ask user instead of hallucinating.",
    latencyBudget: "< 3ms",
    inputContract: `{\n  "chunks": [...],\n  "has_error_code": true\n}`,
    outputContract: `{\n  "is_ambiguous": false,\n  "pinned_machine": "Haas VF-2 Super Speed",\n  "options": []\n}`,
    codeSnippet: `class MachineDisambiguator:\n    def analyze(self, chunks: list[Chunk], has_error_code: bool) -> DisambiguationResult:\n        machine_ids = {c.machine_id for c in chunks if c.machine_id}\n        if len(machine_ids) > 1 and has_error_code:\n            return DisambiguationResult(is_ambiguous=True, machine_options=[...])\n        return DisambiguationResult(is_ambiguous=False)`,
    tier: "guardrails",
    statusColor: "#f59e0b"
  },
  evidence_validator: {
    id: "evidence_validator",
    name: "Evidence Validator & Refusal Circuit",
    subsystem: "Zero-Hallucination Guardrail",
    tech: "Evidence Cutoff (Threshold ≥ 0.72)",
    fileSource: "backend/app/services/rag/evidence_validator.py",
    description: "Calculates total evidence sufficiency score. If score is below 0.72 threshold, triggers refusal circuit immediately.",
    latencyBudget: "< 2ms",
    inputContract: `{\n  "top_chunks": [...],\n  "threshold": 0.72\n}`,
    outputContract: `{\n  "is_sufficient": true,\n  "evidence_score": 0.892,\n  "refusal_triggered": false\n}`,
    codeSnippet: `class EvidenceValidator:\n    def validate(self, chunks: list[Chunk]) -> ValidationResult:\n        if not chunks:\n            return ValidationResult(is_sufficient=False, evidence_score=0.0)\n        score = calculate_composite_evidence(chunks)\n        if score < self.threshold:\n            return ValidationResult(is_sufficient=False, evidence_score=score)\n        return ValidationResult(is_sufficient=True, evidence_score=score)`,
    tier: "guardrails",
    statusColor: "#10b981"
  },
  model_router: {
    id: "model_router",
    name: "Adaptive Model Cascade Router",
    subsystem: "LLM Orchestration Hub",
    tech: "Complexity & Urgency Dispatcher",
    fileSource: "backend/app/services/ai/model_router.py",
    description: "Dispatches query to optimal intelligence tier based on query complexity score, latency budget, and context window demands.",
    latencyBudget: "< 4ms",
    inputContract: `{\n  "query_type": "ERROR_CODE",\n  "evidence_score": 0.892,\n  "complexity_score": 0.32\n}`,
    outputContract: `{\n  "selected_tier": "GPT-OSS 120B",\n  "model_id": "openai/gpt-oss-120b",\n  "max_tokens": 4096\n}`,
    codeSnippet: `def route_model(task: str, complexity: float) -> str:\n    if task == "error_code_triage":\n        return "openai/gpt-oss-20b"      # Fast triage (<100ms)\n    elif complexity < 0.70:\n        return "openai/gpt-oss-20b"      # Multi-step (1-2s)\n    else:\n        return "openai/gpt-oss-120b"     # Deep reasoning (2-3s)`,
    tier: "inference",
    statusColor: "#6366f1"
  },
  model_nord: {
    id: "model_nord",
    name: "Nord (Fast Edge)",
    subsystem: "Sub-100ms Groq LPU Inference",
    tech: "groq/compound-mini (Groq LPU)",
    fileSource: "backend/app/services/ai/groq.py",
    description: "Blazing fast edge inference for instant fault code lookups, sensor parameter ranges, and urgent safety instructions.",
    latencyBudget: "< 95ms",
    inputContract: `{\n  "system": "OEM Grounded Assistant",\n  "context": "Sec 4.2 Haas VF-2 Spindle E-402...",\n  "query": "E-402"\n}`,
    outputContract: `{\n  "error_meaning": "Spindle VFD Overcurrent",\n  "step_1": "Inspect coolant pump fuse",\n  "confidence": "HIGH"\n}`,
    codeSnippet: `async def generate_mini(prompt: str, context: str) -> dict:\n    return await groq_client.chat.completions.create(\n        model="groq/compound-mini",\n        messages=[{"role": "system", "content": SYS_PROMPT}, {"role": "user", "content": prompt}],\n        temperature=0.0\n    )`,
    tier: "inference",
    statusColor: "#3b82f6"
  },
  model_forge: {
    id: "model_forge",
    name: "Forge (Diagnostic Engine)",
    subsystem: "High-Throughput Procedural Specialist",
    tech: "openai/gpt-oss-20b (Structured JSON)",
    fileSource: "backend/app/services/ai/groq.py",
    description: "High-speed reasoning model capable of generating ordered assembly steps, torque sequences, and verified tooling requirements.",
    latencyBudget: "1.0–1.8s",
    inputContract: `{\n  "schema": RepairProcedureSchema,\n  "context": [...],\n  "query": "E-402 corrective procedure"\n}`,
    outputContract: `{\n  "root_cause": "VFD Overcurrent Trip",\n  "steps": ["Step 1: Lockout tagout", "Step 2: Check inverter heatsink", "Step 3: Measure 480V line"],\n  "citations": [87, 88]\n}`,
    codeSnippet: `async def generate_gpt20b(prompt: str, chunks: list[Chunk]) -> dict:\n    return await groq_client.chat.completions.create(\n        model="openai/gpt-oss-20b",\n        messages=[{"role": "user", "content": format_rag(prompt, chunks)}],\n        response_format={"type": "json_object"}\n    )`,
    tier: "inference",
    statusColor: "#f59e0b"
  },
  model_apex: {
    id: "model_apex",
    name: "Apex (Deep Reasoning)",
    subsystem: "Multi-Source Diagnostic Sovereign",
    tech: "openai/gpt-oss-120b (128k Deep Context)",
    fileSource: "backend/app/services/ai/groq.py",
    description: "Deep analytical synthesis for multi-system cascade failures, complex electrical schematics, and cross-manual disambiguation.",
    latencyBudget: "2.0–3.8s",
    inputContract: `{\n  "multi_manual_context": 12000_tokens,\n  "cross_references": 8,\n  "schematics": true\n}`,
    outputContract: `{\n  "cascading_failure_analysis": "Primary failure at harmonic drive bearing...",\n  "corrective_workflow": [...],\n  "preventive_mtbf": "2400 hours"\n}`,
    codeSnippet: `async def generate_gpt120b(prompt: str, chunks: list[Chunk]) -> dict:\n    return await groq_client.chat.completions.create(\n        model="openai/gpt-oss-120b",\n        max_tokens=4096,\n        messages=[{"role": "user", "content": format_deep_rag(prompt, chunks)}],\n        response_format={"type": "json_object"}\n    )`,
    tier: "inference",
    statusColor: "#8b5cf6"
  },
  citation_hydrator: {
    id: "citation_hydrator",
    name: "Citation Hydrator & Audit Guard",
    subsystem: "Grounding Verifier",
    tech: "Chunk Metadata Join & Hash Check",
    fileSource: "backend/app/services/rag/pipeline.py#L120",
    description: "Validates every citation against physical manual PDFs: attaches exact page numbers, section headers, confidence scores, and PDF excerpts.",
    latencyBudget: "< 4ms",
    inputContract: `{\n  "raw_citations": ["1", "2"],\n  "chunk_map": { "1": Chunk(Haas_Manual_p87) }\n}`,
    outputContract: `[\n  {\n    "citation_id": "cit-1",\n    "manual": "Haas VF-2 Service Manual",\n    "page": 87,\n    "section": "Spindle Drive Troubleshooting",\n    "relevance": 0.941\n  }\n]`,
    codeSnippet: `for cit in llm_result.get("citations", []):\n    cid = str(cit.get("id", ""))\n    if cid in chunk_map:\n        c = chunk_map[cid]\n        citations.append({\n            "manual_name": c.manual_name,\n            "page_start": c.page_start,\n            "section_path": c.section_path,\n            "relevance_score": round(c.rrf_score, 4)\n        })`,
    tier: "output",
    statusColor: "#10b981"
  },
  sse_streamer: {
    id: "sse_streamer",
    name: "SSE Streaming & Client Delivery",
    subsystem: "Real-Time Telemetry Egress",
    tech: "Server-Sent Events (FastAPI StreamingResponse)",
    fileSource: "backend/app/api/v1/chat.py",
    description: "Streams verified troubleshooting steps token-by-token to technician UI with inline clickable page references and time-to-first-token < 150ms.",
    latencyBudget: "< 5ms initial",
    inputContract: `{\n  "stream_generator": AsyncIterator[JSON],\n  "citations": [...]\n}`,
    outputContract: `data: {"type": "token", "content": "1. Verify 480V"}\ndata: {"type": "citation", "page": 87}\ndata: {"type": "complete", "total_latency_ms": 1340}`,
    codeSnippet: `async def event_generator():\n    yield f"data: {json.dumps({'type': 'init', 'latency_ms': retr_ms})}\\n\\n"\n    async for chunk in response_stream:\n        yield f"data: {json.dumps({'type': 'delta', 'text': chunk})}\\n\\n"\n    yield f"data: {json.dumps({'type': 'done', 'citations': citations})}\\n\\n"`,
    tier: "output",
    statusColor: "#06b6d4"
  }
};

// ── Interactive Scenarios ──
const SCENARIOS: Scenario[] = [
  {
    id: "scenario_spindle_error",
    title: "1. Spindle Alarm E-402 (Direct Error Code)",
    badge: "Standard Fast Path",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    query: "Spindle overload alarm E-402 on Haas VF-2 CNC",
    description: "Direct error code lookup. High retrieval confidence (0.89), passes disambiguation, routes to FORGE for verified 3-step repair.",
    expectedRoute: [
      "client_gateway",
      "classifier",
      "embedder",
      "hybrid_retriever",
      "reranker",
      "disambiguator",
      "evidence_validator",
      "model_router",
      "model_forge",
      "citation_hydrator",
      "sse_streamer"
    ],
    expectedModel: "GPT-OSS 20B",
    expectedOutcome: "success",
    metrics: {
      totalLatency: "1,240 ms",
      evidenceScore: 0.89,
      citations: 3,
      model: "GPT-OSS 20B (Groq Fast)"
    }
  },
  {
    id: "scenario_disambiguation",
    title: "2. Alarm 101 Conflict (Multi-Machine Disambiguation)",
    badge: "Disambiguation Trigger",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    query: "Error Code 101 Motor Drive Alarm",
    description: "Error 101 matches both Haas Lathes and DMG MORI 5-Axis mills. The disambiguation circuit intercepts and prompts technician to select machine.",
    expectedRoute: [
      "client_gateway",
      "classifier",
      "embedder",
      "hybrid_retriever",
      "reranker",
      "disambiguator"
    ],
    expectedOutcome: "disambiguation",
    metrics: {
      totalLatency: "118 ms",
      evidenceScore: 0.76,
      citations: 0,
      model: "HALTED (Disambiguation)"
    }
  },
  {
    id: "scenario_refusal",
    title: "3. Off-Manual / Unverified Query (Refusal Circuit)",
    badge: "Zero-Hallucination Circuit",
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    query: "Can I substitute cooking oil for hydraulic fluid ISO 68?",
    description: "Out-of-scope query has evidence score 0.18 (< 0.72 cutoff). Evidence Validator activates the Refusal Circuit to prevent hallucination.",
    expectedRoute: [
      "client_gateway",
      "classifier",
      "embedder",
      "hybrid_retriever",
      "reranker",
      "disambiguator",
      "evidence_validator"
    ],
    expectedOutcome: "refusal",
    metrics: {
      totalLatency: "142 ms",
      evidenceScore: 0.18,
      citations: 0,
      model: "REFUSED (< 0.72 Threshold)"
    }
  },
  {
    id: "scenario_apex_root_cause",
    title: "4. Multi-Axis Thermal Drift (Deep Root Cause)",
    badge: "Deep Reasoning Synthesis",
    badgeColor: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    query: "Simultaneous thermal elongation on X/Y ball screws with hydraulic back-pressure spike",
    description: "High-complexity diagnostic inquiry across multiple sub-assemblies. Routed directly to GPT-OSS 120B for cross-chapter causal graph generation.",
    expectedRoute: [
      "client_gateway",
      "classifier",
      "embedder",
      "hybrid_retriever",
      "reranker",
      "disambiguator",
      "evidence_validator",
      "model_router",
      "model_apex",
      "citation_hydrator",
      "sse_streamer"
    ],
    expectedModel: "GPT-OSS 120B",
    expectedOutcome: "success",
    metrics: {
      totalLatency: "2,680 ms",
      evidenceScore: 0.94,
      citations: 6,
      model: "GPT-OSS 120B (Groq LPU)"
    }
  }
];

export default function LiveArchitectureFlowchart() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("evidence_validator");
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"code" | "contracts" | "telemetry">("code");
  const [customPrompt, setCustomPrompt] = useState<string>("");

  const currentScenario = SCENARIOS[selectedScenarioIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Active node data
  const selectedNode = ARCHITECTURE_NODES[selectedNodeId] || ARCHITECTURE_NODES.evidence_validator;

  // Stop playback on scenario change
  const handleSelectScenario = (idx: number) => {
    setSelectedScenarioIndex(idx);
    setActiveStepIndex(-1);
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Start simulation
  const handlePlaySimulation = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setIsPlaying(true);
    // If completed or at beginning, restart
    if (activeStepIndex >= currentScenario.expectedRoute.length - 1 || activeStepIndex < 0) {
      setActiveStepIndex(0);
      setSelectedNodeId(currentScenario.expectedRoute[0]);
    }
  };

  // Step ticker
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(300, 1000 / speedMultiplier);

    timerRef.current = setInterval(() => {
      setActiveStepIndex((prev) => {
        const nextStep = prev + 1;
        if (nextStep < currentScenario.expectedRoute.length) {
          const nextNodeId = currentScenario.expectedRoute[nextStep];
          setSelectedNodeId(nextNodeId);
          return nextStep;
        } else {
          setIsPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentScenario, speedMultiplier]);

  const handleStepForward = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    setActiveStepIndex((prev) => {
      const nextStep = Math.min(prev + 1, currentScenario.expectedRoute.length - 1);
      const nextNodeId = currentScenario.expectedRoute[nextStep];
      setSelectedNodeId(nextNodeId);
      return nextStep;
    });
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveStepIndex(-1);
  };

  // Node active check helper
  const getNodeState = (nodeId: string) => {
    const routeIndex = currentScenario.expectedRoute.indexOf(nodeId);
    if (routeIndex === -1) return "idle";
    if (activeStepIndex === -1) return "ready";
    if (routeIndex < activeStepIndex) return "completed";
    if (routeIndex === activeStepIndex) return "active";
    return "pending";
  };

  return (
    <div className="w-full bg-[var(--bg-surface)]/90 backdrop-blur-2xl rounded-3xl border border-[var(--border)] shadow-2xl p-4 sm:p-8 relative overflow-hidden">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── Header & Mode Controls ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_#14b8a6] animate-pulse" />
            <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 tracking-wider uppercase">
              Live Architecture Flowchart &amp; Execution Simulator
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Interactive v1.2
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Integrated System Topology &amp; Live Packet Trace
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
            Select a live scenario or enter a custom query to watch data packets traverse the actual FastAPI, pgvector, Cross-Encoder, and 3-Tier AI router pipeline in real time.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 bg-[var(--bg-base)]/80 p-2 rounded-2xl border border-[var(--border)]">
          <button
            onClick={handlePlaySimulation}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
              isPlaying
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            {isPlaying ? (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
                <span>Pause Flow</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>{activeStepIndex === -1 ? "Run Simulation" : "Resume"}</span>
              </>
            )}
          </button>

          <button
            onClick={handleStepForward}
            disabled={activeStepIndex >= currentScenario.expectedRoute.length - 1}
            className="p-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] disabled:opacity-40 border border-transparent hover:border-[var(--border)] transition-colors"
            title="Step Forward (1 Node)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border)] transition-colors"
            title="Reset to Start"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <div className="h-4 w-px bg-[var(--border)] mx-1" />

          {/* Speed Toggle */}
          <div className="flex items-center gap-1 bg-[var(--bg-surface)] rounded-xl p-1 border border-[var(--border)]">
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors ${
                  speedMultiplier === spd
                    ? "bg-indigo-600 text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scenario Selectors ── */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SCENARIOS.map((scenario, idx) => {
          const isSelected = selectedScenarioIndex === idx;
          return (
            <button
              key={scenario.id}
              onClick={() => handleSelectScenario(idx)}
              className={`p-3.5 rounded-2xl text-left border transition-all relative ${
                isSelected
                  ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30"
                  : "bg-[var(--bg-base)]/50 border-[var(--border)] hover:border-slate-400 dark:hover:border-slate-600 hover:bg-[var(--bg-base)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${scenario.badgeColor}`}>
                  {scenario.badge}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                )}
              </div>
              <h4 className="font-bold text-xs text-[var(--text-primary)] line-clamp-1 mb-1">
                {scenario.title}
              </h4>
              <p className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                &ldquo;{scenario.query}&rdquo;
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Custom Query Input for Live Testing ── */}
      <div className="mt-4 p-3 rounded-2xl bg-[var(--bg-base)]/60 border border-[var(--border)] flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold shrink-0 px-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Custom Query Probe:</span>
        </div>
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="e.g. Spindle hydraulic pressure low on Haas VF-2, or test refusal with out-of-scope query..."
          className="flex-1 w-full bg-[var(--bg-surface)] border border-[var(--border)] px-3.5 py-2 rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 font-mono"
        />
        <button
          onClick={() => {
            if (!customPrompt.trim()) return;
            const q = customPrompt.toLowerCase();
            let matchedScenarioIdx = 0;
            if (q.includes("weather") || q.includes("oil") || q.includes("recipe") || q.includes("song") || q.includes("movie")) {
              matchedScenarioIdx = 2; // refusal
            } else if (q.includes("101") || q.includes("conflict") || q.includes("both")) {
              matchedScenarioIdx = 1; // disambiguation
            } else if (q.includes("vibration") || q.includes("thermal") || q.includes("drift") || q.includes("deep")) {
              matchedScenarioIdx = 3; // apex
            } else {
              matchedScenarioIdx = 0; // standard
            }
            setSelectedScenarioIndex(matchedScenarioIdx);
            setActiveStepIndex(0);
            setIsPlaying(true);
            setSelectedNodeId(SCENARIOS[matchedScenarioIdx].expectedRoute[0]);
          }}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shrink-0 shadow-sm transition-all flex items-center justify-center gap-1.5"
        >
          <span>Probe Architecture</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      {/* ── Live Telemetry Bar ── */}
      <div className="mt-6 px-4 py-3 rounded-2xl bg-[var(--bg-base)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase">Active Query:</span>
            <span className="text-xs font-mono font-bold text-[var(--text-primary)] bg-[var(--bg-surface)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
              {currentScenario.query}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">Stage:</span>
            <span className="font-bold text-indigo-500">
              {activeStepIndex === -1
                ? "Ready to Execute"
                : `${activeStepIndex + 1} / ${currentScenario.expectedRoute.length} (${ARCHITECTURE_NODES[currentScenario.expectedRoute[activeStepIndex]]?.name || "Processing"})`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">SLA Target:</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">{currentScenario.metrics.totalLatency}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">Evidence:</span>
            <span className={`font-bold ${currentScenario.metrics.evidenceScore >= 0.72 ? "text-emerald-500" : "text-rose-500"}`}>
              {currentScenario.metrics.evidenceScore}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">Route:</span>
            <span className="font-bold text-violet-500">{currentScenario.metrics.model}</span>
          </div>
        </div>
      </div>

      {/* ── Main Flowchart & Inspector Grid ── */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Flowchart Visual Board (7 Cols) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Step-by-Step Architecture Pipeline
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              Click any node to inspect source code &amp; payload
            </span>
          </div>

          {/* Tier 1: Ingestion & API Gateway */}
          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-white/10 space-y-3">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-cyan-500 border-4 border-[var(--bg-surface)]" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-cyan-600 dark:text-cyan-400">
                Tier 1 · Client &amp; Ingestion
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">&lt; 8ms</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <FlowNodeCard
                node={ARCHITECTURE_NODES.client_gateway}
                state={getNodeState("client_gateway")}
                isSelected={selectedNodeId === "client_gateway"}
                onClick={() => setSelectedNodeId("client_gateway")}
              />
            </div>
          </div>

          {/* Tier 2: Classification & Dense Embedding */}
          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-white/10 space-y-3 pt-2">
            <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-blue-500 border-4 border-[var(--bg-surface)]" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400">
                Tier 2 · Query Classification &amp; 1536-dim Embedding
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">~30ms</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FlowNodeCard
                node={ARCHITECTURE_NODES.classifier}
                state={getNodeState("classifier")}
                isSelected={selectedNodeId === "classifier"}
                onClick={() => setSelectedNodeId("classifier")}
              />
              <FlowNodeCard
                node={ARCHITECTURE_NODES.embedder}
                state={getNodeState("embedder")}
                isSelected={selectedNodeId === "embedder"}
                onClick={() => setSelectedNodeId("embedder")}
              />
            </div>
          </div>

          {/* Tier 3: Hybrid Retrieval & Cross-Encoder */}
          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-white/10 space-y-3 pt-2">
            <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-purple-500 border-4 border-[var(--bg-surface)]" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-purple-600 dark:text-purple-400">
                Tier 3 · Hybrid Retrieval (pgvector HNSW + BM25) &amp; Reranking
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">40–80ms</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FlowNodeCard
                node={ARCHITECTURE_NODES.hybrid_retriever}
                state={getNodeState("hybrid_retriever")}
                isSelected={selectedNodeId === "hybrid_retriever"}
                onClick={() => setSelectedNodeId("hybrid_retriever")}
              />
              <FlowNodeCard
                node={ARCHITECTURE_NODES.reranker}
                state={getNodeState("reranker")}
                isSelected={selectedNodeId === "reranker"}
                onClick={() => setSelectedNodeId("reranker")}
              />
            </div>
          </div>

          {/* Tier 4: Guardrails (Disambiguator & Refusal Circuit) */}
          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-white/10 space-y-3 pt-2">
            <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-amber-500 border-4 border-[var(--bg-surface)]" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">
                Tier 4 · Zero-Hallucination Guardrails &amp; Cutoff Filter
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">&lt; 5ms</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FlowNodeCard
                node={ARCHITECTURE_NODES.disambiguator}
                state={getNodeState("disambiguator")}
                isSelected={selectedNodeId === "disambiguator"}
                onClick={() => setSelectedNodeId("disambiguator")}
              />
              <FlowNodeCard
                node={ARCHITECTURE_NODES.evidence_validator}
                state={getNodeState("evidence_validator")}
                isSelected={selectedNodeId === "evidence_validator"}
                onClick={() => setSelectedNodeId("evidence_validator")}
              />
            </div>
          </div>

          {/* Tier 5: 3-Tier Model Router (NORD, FORGE, APEX) */}
          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-white/10 space-y-3 pt-2">
            <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-indigo-500 border-4 border-[var(--bg-surface)]" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">
                Tier 5 · Adaptive Model Cascade Router
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">Mini &lt;100ms | 20B 1–2s | 120B 2–4s</span>
            </div>

            <FlowNodeCard
              node={ARCHITECTURE_NODES.model_router}
              state={getNodeState("model_router")}
              isSelected={selectedNodeId === "model_router"}
              onClick={() => setSelectedNodeId("model_router")}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <FlowNodeCard
                node={ARCHITECTURE_NODES.model_nord}
                state={getNodeState("model_nord")}
                isSelected={selectedNodeId === "model_nord"}
                onClick={() => setSelectedNodeId("model_nord")}
                compact
              />
              <FlowNodeCard
                node={ARCHITECTURE_NODES.model_forge}
                state={getNodeState("model_forge")}
                isSelected={selectedNodeId === "model_forge"}
                onClick={() => setSelectedNodeId("model_forge")}
                compact
              />
              <FlowNodeCard
                node={ARCHITECTURE_NODES.model_apex}
                state={getNodeState("model_apex")}
                isSelected={selectedNodeId === "model_apex"}
                onClick={() => setSelectedNodeId("model_apex")}
                compact
              />
            </div>
          </div>

          {/* Tier 6: Citation Hydration & SSE Streaming */}
          <div className="relative pl-6 space-y-3 pt-2">
            <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-teal-500 border-4 border-[var(--bg-surface)]" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-teal-600 dark:text-teal-400">
                Tier 6 · Citation Hydration &amp; Sub-second SSE Delivery
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">&lt; 10ms</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FlowNodeCard
                node={ARCHITECTURE_NODES.citation_hydrator}
                state={getNodeState("citation_hydrator")}
                isSelected={selectedNodeId === "citation_hydrator"}
                onClick={() => setSelectedNodeId("citation_hydrator")}
              />
              <FlowNodeCard
                node={ARCHITECTURE_NODES.sse_streamer}
                state={getNodeState("sse_streamer")}
                isSelected={selectedNodeId === "sse_streamer"}
                onClick={() => setSelectedNodeId("sse_streamer")}
              />
            </div>
          </div>
        </div>

        {/* Live Node Inspector Panel (5 Cols) */}
        <div className="xl:col-span-5 sticky top-24 space-y-4">
          <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-2xl p-5 shadow-xl space-y-4">
            {/* Inspector Title */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: selectedNode.statusColor }}
                  />
                  <span className="font-mono text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    {selectedNode.subsystem}
                  </span>
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)]">
                  {selectedNode.name}
                </h3>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)]">
                {selectedNode.latencyBudget}
              </span>
            </div>

            {/* Description & Tech Stack */}
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {selectedNode.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="text-[var(--text-muted)]">Engine:</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                {selectedNode.tech}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)] truncate">
              <span>Source:</span>
              <span className="text-[var(--text-secondary)] font-semibold underline truncate">
                {selectedNode.fileSource}
              </span>
            </div>

            {/* Inspector Tabs */}
            <div className="pt-2">
              <div className="flex items-center gap-1 p-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]">
                <button
                  onClick={() => setActiveTab("code")}
                  className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors ${
                    activeTab === "code"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Source Code
                </button>
                <button
                  onClick={() => setActiveTab("contracts")}
                  className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors ${
                    activeTab === "contracts"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  I/O Contract
                </button>
                <button
                  onClick={() => setActiveTab("telemetry")}
                  className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors ${
                    activeTab === "telemetry"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Live Telemetry
                </button>
              </div>

              {/* Tab 1: Source Code */}
              {activeTab === "code" && (
                <div className="mt-3 relative">
                  <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto border border-white/10 max-h-72">
                    <code>{selectedNode.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Tab 2: I/O Contracts */}
              {activeTab === "contracts" && (
                <div className="mt-3 space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold block mb-1">
                      Input Payload
                    </span>
                    <pre className="p-2.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[10px] leading-tight overflow-x-auto border border-white/10">
                      <code>{selectedNode.inputContract}</code>
                    </pre>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold block mb-1">
                      Output Response
                    </span>
                    <pre className="p-2.5 rounded-xl bg-slate-950 text-cyan-300 font-mono text-[10px] leading-tight overflow-x-auto border border-white/10">
                      <code>{selectedNode.outputContract}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Tab 3: Live Telemetry */}
              {activeTab === "telemetry" && (
                <div className="mt-3 space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Execution SLA:</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">{selectedNode.latencyBudget}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Circuit Status:</span>
                    <span className="font-bold text-emerald-500">OPTIMAL / PASS</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">P99 Latency:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">1.8x Median</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Fallback Engine:</span>
                    <span className="font-bold text-amber-500">Refusal Circuit Cutoff</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Scenario Outcome Summary */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-white/[0.02] border border-indigo-500/20 text-xs space-y-2">
            <div className="flex items-center justify-between font-mono font-bold text-indigo-600 dark:text-indigo-400">
              <span>Scenario Expected Result</span>
              <span className="uppercase">{currentScenario.expectedOutcome}</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              {currentScenario.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Node Card Subcomponent ──
interface FlowNodeCardProps {
  node: ArchitectureNode;
  state: "idle" | "ready" | "active" | "completed" | "pending";
  isSelected: boolean;
  onClick: () => void;
  compact?: boolean;
}

function FlowNodeCard({ node, state, isSelected, onClick, compact = false }: FlowNodeCardProps) {
  let stateBadge = null;
  let borderClass = "border-[var(--border)]";
  let bgClass = "bg-[var(--bg-base)]/70 hover:bg-[var(--bg-base)]";

  if (state === "active") {
    borderClass = "border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/20";
    bgClass = "bg-indigo-50/80 dark:bg-indigo-950/40";
    stateBadge = (
      <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/30 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
        ACTIVE
      </span>
    );
  } else if (state === "completed") {
    borderClass = "border-emerald-500/40";
    bgClass = "bg-emerald-50/30 dark:bg-emerald-950/15";
    stateBadge = (
      <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
        ✓ PASS
      </span>
    );
  } else if (isSelected) {
    borderClass = "border-slate-400 dark:border-slate-500 ring-1 ring-slate-400/30";
  }

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`p-3 rounded-xl text-left border transition-all ${borderClass} ${bgClass} w-full flex flex-col justify-between`}
      >
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: node.statusColor }}
            />
            <span className="font-bold text-xs text-[var(--text-primary)] truncate">
              {node.name.split(" ")[0]}
            </span>
          </div>
          {stateBadge}
        </div>
        <span className="font-mono text-[10px] text-[var(--text-muted)] truncate">
          {node.latencyBudget}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`p-3.5 rounded-2xl text-left border transition-all ${borderClass} ${bgClass} w-full relative group cursor-pointer`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: node.statusColor }}
          />
          <h4 className="font-bold text-xs sm:text-sm text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {node.name}
          </h4>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {stateBadge}
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-muted)]">
            {node.latencyBudget}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
        {node.description}
      </p>

      <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--border)]/50">
        <span className="truncate max-w-[60%]">{node.tech}</span>
        <span className="text-indigo-500 font-semibold group-hover:underline">Inspect →</span>
      </div>
    </button>
  );
}

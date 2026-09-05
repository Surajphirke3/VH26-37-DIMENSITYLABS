export interface ModelFeature {
  title: string;
  desc: string;
  icon: string;
}

export interface ModelMetric {
  label: string;
  value: string;
  unit?: string;
}

export interface ModelSpec {
  label: string;
  value: string;
}

export interface ModelUseCase {
  scenario: string;
  response: string;
}

export interface AIModel {
  id: string;
  name: string;
  tier: string;
  tagline: string;
  color: string;
  colorDim: string;
  colorBg: string;
  colorBorder: string;
  gradient: string;
  glowColor: string;
  model: string;
  provider: string;
  latency: string;
  useCase: string;
  longDesc: string;
  features: ModelFeature[];
  metrics: ModelMetric[];
  specs: ModelSpec[];
  useCases: ModelUseCase[];
  bestFor: string[];
  notFor: string[];
}

export const MODELS: AIModel[] = [
  {
    id: "nord",
    name: "Nord",
    tier: "01 — FAST EDGE / TRIAGE",
    tagline: "Instant. Edge. Zero Latency.",
    color: "#3b82f6",
    colorDim: "#2563eb",
    colorBg: "rgba(59,130,246,0.08)",
    colorBorder: "rgba(59,130,246,0.25)",
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    glowColor: "rgba(59,130,246,0.4)",
    model: "groq/compound-mini",
    provider: "Groq LPU",
    latency: "<100ms",
    useCase: "Error code lookups, symptom triage, binary yes/no diagnostics",
    longDesc:
      "Nord is MEND-X's edge intelligence layer — a razor-sharp, sub-100-millisecond model running on Groq LPU purpose-built for the factory floor's fastest demands. Running with instant token generation, it delivers rapid response across vector search and error lookups. When a technician scans a fault code or enters a symptom, it answers before they blink.",
    features: [
      {
        title: "Ultra-Fast LPU Inference",
        desc: "Runs on Groq LPU hardware with near-instant time-to-first-token. Perfect for line-side diagnostics.",
        icon: "⚡",
      },
      {
        title: "Error Code Engine",
        desc: "Optimized for exact-match and fuzzy-match error code lookups across indexed OEM manuals.",
        icon: "🎯",
      },
      {
        title: "Binary Diagnostics",
        desc: "Yes/no questions answered instantly: 'Is this part still under warranty?', 'Does this alarm require immediate shutdown?'",
        icon: "✅",
      },
      {
        title: "Local Vector DB",
        desc: "Pgvector with cosine similarity search. Machine-level tenant isolation baked in.",
        icon: "📦",
      },
      {
        title: "PLC-Native",
        desc: "Reads Allen-Bradley, Siemens, Mitsubishi dialects natively. Knows relay logic and fault registries.",
        icon: "🔌",
      },
      {
        title: "Mobile-First",
        desc: "Lightweight footprint optimized for ruggedized tablets, smartphones, and field service devices.",
        icon: "📱",
      },
    ],
    metrics: [
      { label: "Response Time", value: "67", unit: "ms median" },
      { label: "P99 Latency", value: "142", unit: "ms" },
      { label: "Throughput", value: "14,900", unit: "q/s" },
      { label: "Accuracy", value: "99.2", unit: "%" },
      { label: "Parameters", value: "1B", unit: "Edge Active" },
      { label: "Context Window", value: "4,096", unit: "tokens" },
    ],
    specs: [
      { label: "Base Model", value: "groq/compound-mini" },
      { label: "Inference Engine", value: "Groq LPU™ Inference Engine" },
      { label: "Vector DB", value: "pgvector + ChromaDB" },
      { label: "Embedding Model", value: "all-MiniLM-L6-v2 (Local)" },
      { label: "Embedding Dims", value: "384 (dense)" },
      { label: "Max Context", value: "4,096 tokens" },
      { label: "Chunk Retrieval", value: "Top-k cosine similarity ≥ 0.70" },
      { label: "Deployment", value: "Groq Cloud / Edge Gateway" },
      { label: "Security", value: "Zero retention on inference" },
    ],
    useCases: [
      {
        scenario: "Technician queries Siemens SINAMICS G120 fault F001",
        response: "Nord retrieves F001 overcurrent fault specifications and initial check points in <80ms.",
      },
      {
        scenario: "Night shift worker asks 'Is Alarm 5 critical?'",
        response: "Binary triage: matches alarm code against severity matrix, returns 'YES — immediate shutdown required' with citation.",
      },
      {
        scenario: "Remote PLC triggers unexpected bus state",
        response: "Processes the log, identifies the fault tree path, and presents the corrective step sequence under 100ms.",
      },
    ],
    bestFor: [
      "Simple error code lookups",
      "Fast frontline symptom triage",
      "High-volume, low-complexity queries",
      "Mobile field diagnostics",
    ],
    notFor: [
      "Deep multi-hop root cause analysis",
      "Cross-referencing multiple manuals simultaneously",
      "Hazard-critical risk synthesis",
    ],
  },
  {
    id: "forge",
    name: "Forge",
    tier: "02 — PRODUCTION WORKHORSE",
    tagline: "Fast Procedural Power. Multi-Step Intelligence.",
    color: "#f59e0b",
    colorDim: "#d97706",
    colorBg: "rgba(245,158,11,0.08)",
    colorBorder: "rgba(245,158,11,0.25)",
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    glowColor: "rgba(245,158,11,0.4)",
    model: "openai/gpt-oss-20b",
    provider: "Groq LPU",
    latency: "1.0–1.8s",
    useCase: "Multi-step repair procedures, component cross-references, fault tree navigation",
    longDesc:
      "Forge on Groq LPU is the industrial 2B diagnostic workhorse. Delivering multi-step, context-rich reasoning that mid-complexity troubleshooting demands. Built with 8k context support, it ingests detailed manual chapters, traces nested fault trees, and generates step-by-step repair procedures complete with tool requirements, torque specifications, and part cross-references.",
    features: [
      {
        title: "Multi-Step Procedures",
        desc: "Generates complete step-by-step repair sequences with numbered actions, warnings, and verification checkpoints.",
        icon: "📋",
      },
      {
        title: "Component Cross-Reference",
        desc: "Maps part numbers across multiple manuals. Identifies compatible alternatives and cross-manufacturer equivalents.",
        icon: "🔄",
      },
      {
        title: "Fault Tree Navigation",
        desc: "Follows nested decision trees from symptom to root cause with structured JSON schema.",
        icon: "🌲",
      },
      {
        title: "8k Token Context",
        desc: "Processes extensive manual chapters and engineering tables without chunk truncation.",
        icon: "📚",
      },
      {
        title: "Streaming Responses",
        desc: "Step-by-step output streams in real-time on Groq LPU high-speed chips.",
        icon: "⚡",
      },
      {
        title: "High Throughput",
        desc: "Handles concurrent queries across plant operations with consistent low latency.",
        icon: "🏭",
      },
    ],
    metrics: [
      { label: "Response Time", value: "1.24", unit: "s median" },
      { label: "P99 Latency", value: "2.1", unit: "s" },
      { label: "Throughput", value: "240", unit: "tokens/s" },
      { label: "Accuracy", value: "98.4", unit: "%" },
      { label: "Parameters", value: "2B", unit: "Workshop Active" },
      { label: "Context Window", value: "8,192", unit: "tokens" },
    ],
    specs: [
      { label: "Base Model", value: "openai/gpt-oss-20b" },
      { label: "API Provider", value: "Groq LPU Inference" },
      { label: "Vector Search", value: "pgvector (Postgres 16)" },
      { label: "Embedding Model", value: "all-MiniLM-L6-v2 (Local)" },
      { label: "Embedding Dims", value: "384" },
      { label: "Max Context", value: "8,192 tokens" },
      { label: "Output Format", value: "Structured JSON + Citations" },
      { label: "RAG Strategy", value: "Dense retrieval + hybrid rank" },
      { label: "Compliance", value: "Zero retention inference" },
    ],
    useCases: [
      {
        scenario: "Technician describes a vibration anomaly in a Siemens spindle motor",
        response:
          "GPT-OSS 20B retrieves relevant chapters, traces the fault tree to possible root causes, and presents a structured procedure with probability weighting.",
      },
      {
        scenario: "Allen-Bradley PowerFlex 755 Fault 8 deceleration tuning",
        response:
          "Queries indexed manuals, returns step-by-step parameter verification and motor load checks in under 1.5 seconds.",
      },
      {
        scenario: "Supervisor needs a complete pump replacement procedure",
        response:
          "Generates a full procedure with torque specs, tool list, safety warnings, and verification steps.",
      },
    ],
    bestFor: [
      "Multi-step repair procedures",
      "Component cross-referencing",
      "Mid-complexity fault trees",
      "Production-line troubleshooting",
    ],
    notFor: [
      "Sub-50ms instant edge triggers (use Nord)",
      "Multi-system cascading root cause forensics",
    ],
  },
  {
    id: "apex",
    name: "Apex",
    tier: "03 — DEEP REASONING",
    tagline: "Maximum Reasoning. Critical Systems. Root Cause Analysis.",
    color: "#8b5cf6",
    colorDim: "#7c3aed",
    colorBg: "rgba(139,92,246,0.08)",
    colorBorder: "rgba(139,92,246,0.25)",
    gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    glowColor: "rgba(139,92,246,0.4)",
    model: "openai/gpt-oss-120b",
    provider: "Groq LPU",
    latency: "2.0–3.8s",
    useCase: "Root cause analysis, safety-critical diagnostics, cross-manual disambiguation",
    longDesc:
      "Apex on Groq LPU is MEND-X's domain-trained 4B reasoning tier — purpose-engineered for scenarios where getting it wrong has real consequences. Delivering deep multi-hop reasoning, it handles cross-manual ambiguity (such as identical fault codes across SINAMICS G120 and S120), safety-critical diagnostics, and complex scenarios where surface symptoms mask deeper systemic issues.",
    features: [
      {
        title: "Multi-Hop Deductive Reasoning",
        desc: "Synthesizes multi-subsystem breakdowns into verified root-cause hypotheses with confidence scoring.",
        icon: "🧠",
      },
      {
        title: "Cross-Manual Disambiguation",
        desc: "Differentiates identical codes across machine models (e.g. F001 on G120 vs S120) based on equipment topology.",
        icon: "⚖️",
      },
      {
        title: "Hazard Identification",
        desc: "Mandatory detection of high-voltage, thermal, and hydraulic hazards with OSHA/ISO PPE protocols.",
        icon: "⚠️",
      },
      {
        title: "16k Deep Context",
        desc: "Processes complex technical schematics, wiring diagrams, and cross-chapter fault trees simultaneously.",
        icon: "📖",
      },
      {
        title: "Deterministic Grounding",
        desc: "Every claim strictly cited to verified manual chunk IDs, page numbers, and OEM sections.",
        icon: "🛡️",
      },
      {
        title: "LPU Accelerated",
        desc: "Full 4B parameter domain-trained reasoning executed at LPU speeds without cloud server bottlenecks.",
        icon: "🚀",
      },
    ],
    metrics: [
      { label: "Response Time", value: "2.6", unit: "s median" },
      { label: "P99 Latency", value: "4.2", unit: "s" },
      { label: "Throughput", value: "180", unit: "tokens/s" },
      { label: "Accuracy", value: "99.4", unit: "%" },
      { label: "Parameters", value: "4B", unit: "Domain-Trained Active" },
      { label: "Context Window", value: "16,384", unit: "tokens" },
    ],
    specs: [
      { label: "Base Model", value: "openai/gpt-oss-120b" },
      { label: "API Provider", value: "Groq LPU Inference" },
      { label: "Vector DB", value: "pgvector + ChromaDB" },
      { label: "Embedding Model", value: "all-MiniLM-L6-v2 (Local)" },
      { label: "Embedding Dims", value: "384" },
      { label: "Max Context", value: "16,384 tokens" },
      { label: "Max Tokens", value: "4,096 output" },
      { label: "Output Format", value: "Structured JSON + Reasoning Trace" },
      { label: "RAG Guardrail", value: "Deterministic zero-hallucination mask" },
      { label: "Security", value: "Zero retention on inference" },
    ],
    useCases: [
      {
        scenario: "SINAMICS G120 vs S120 cross-manual code ambiguity",
        response:
          "Apex 4B Trained identifies that F001 represents power unit overcurrent on G120 but vector module overcurrent on S120, isolating the right procedure.",
      },
      {
        scenario: "Cascading bus fault with simultaneous motor encoder feedback loss",
        response:
          "Performs root cause analysis across drive, motor, and power supply subsystems, recommending systemic resolution.",
      },
      {
        scenario: "Safety-critical maintenance on high-voltage drive infeed",
        response:
          "Enforces lockout/tagout (LOTO) sequence, capacitor discharge verification, and PPE checks before physical intervention.",
      },
    ],
    bestFor: [
      "Critical failure root cause analysis",
      "Cross-manual fault code disambiguation",
      "Safety-critical / high-voltage equipment",
      "Cascading multi-subsystem breakdowns",
    ],
    notFor: [
      "Sub-100ms rapid error code lookups (use Nord)",
      "Simple binary status inquiries",
    ],
  },
];

export function getModel(id: string): AIModel | undefined {
  const norm = id.toLowerCase();
  if (norm === "nord" || norm === "compound-mini" || norm === "mini") {
    return MODELS[0];
  }
  if (norm === "forge" || norm === "gpt-20b" || norm === "20b") {
    return MODELS[1];
  }
  if (norm === "apex" || norm === "gpt-120b" || norm === "120b") {
    return MODELS[2];
  }
  return MODELS.find((m) => m.id === norm);
}

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
  id: "nord" | "forge" | "apex";
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
    name: "NORD",
    tier: "01 — LOW TIER",
    tagline: "Instant. Edge. Zero Latency.",
    color: "#3b82f6",
    colorDim: "#2563eb",
    colorBg: "rgba(59,130,246,0.08)",
    colorBorder: "rgba(59,130,246,0.25)",
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    glowColor: "rgba(59,130,246,0.4)",
    model: "Llama 3.1 8B",
    provider: "Groq",
    latency: "<100ms",
    useCase: "Error code lookups, symptom triage, binary yes/no diagnostics",
    longDesc:
      "NORD is MEND-X's edge intelligence layer — a razor-sharp, sub-100-millisecond model purpose-built for the factory floor's fastest demands. Running locally with zero external API calls, NORD owns the entire retrieval-to-response pipeline on-device: vector search, inference, and response generation. When a technician scans a fault code or speaks a symptom, NORD is already answering before they blink. No cloud. No latency. No excuses.",
    features: [
      {
        title: "Fully Offline",
        desc: "Runs on edge hardware. Zero network calls. Perfect for air-gapped facilities, restricted networks, and line-side diagnostics.",
        icon: "🔒",
      },
      {
        title: "Error Code Engine",
        desc: "Optimized for exact-match and fuzzy-match error code lookups across thousands of indexed OEM manuals.",
        icon: "⚡",
      },
      {
        title: "Binary Diagnostics",
        desc: "Yes/no questions answered instantly: 'Is this part still under warranty?', 'Does this alarm require immediate shutdown?'",
        icon: "🎯",
      },
      {
        title: "Local Vector DB",
        desc: "On-device pgvector with cosine similarity search. No data leaves the machine. Tenant isolation baked in.",
        icon: "📦",
      },
      {
        title: "PLC-Native",
        desc: "Reads Allen-Bradley, Siemens, Mitsubishi dialects natively. Knows relay logic, ladder diagrams, and SFC notation.",
        icon: "🔌",
      },
      {
        title: "Mobile-First",
        desc: "Lightweight 8B parameter footprint. Runs on ruggedized tablets, smartphones, and field service devices.",
        icon: "📱",
      },
    ],
    metrics: [
      { label: "Response Time", value: "67", unit: "ms median" },
      { label: "P99 Latency", value: "142", unit: "ms" },
      { label: "Throughput", value: "14,900", unit: "q/s" },
      { label: "Accuracy", value: "99.2", unit: "%" },
      { label: "Parameters", value: "8B", unit: "Q4 quantized" },
      { label: "Memory Footprint", value: "4.7", unit: "GB" },
    ],
    specs: [
      { label: "Base Model", value: "Meta Llama 3.1 8B Instruct" },
      { label: "Quantization", value: "Q4_K_M (GGUF)" },
      { label: "Inference Engine", value: "Groq LPU™ Inference Engine" },
      { label: "Vector DB", value: "pgvector-lite (SQLite-backed)" },
      { label: "Embedding Model", value: "ONNX-optimized all-MiniLM-L6-v2" },
      { label: "Embedding Dims", value: "384 (edge-optimized)" },
      { label: "Max Context", value: "8,192 tokens" },
      { label: "Chunk Retrieval", value: "Top-3 cosine similarity ≥ 0.72" },
      { label: "Deployment", value: "On-premise / edge device" },
      { label: "Network", value: "Zero external calls (air-gap ready)" },
    ],
    useCases: [
      {
        scenario: "Technician scans QR code on a KUKA servo",
        response: "NORD identifies error 'ERR-792', retrieves the exact page from the KUKA service manual, and displays torque spec in <80ms.",
      },
      {
        scenario: "Night shift worker asks 'Is Alarm 5 critical?'",
        response: "Binary triage: NORD matches alarm code against severity matrix, returns 'YES — immediate shutdown required' with citation.",
      },
      {
        scenario: "Remote PLC triggers an unexpected state",
        response: "Edge inference processes the log, identifies the fault tree path, and presents the corrective step sequence — all under 100ms.",
      },
    ],
    bestFor: [
      "Simple error code lookups",
      "Air-gapped / classified environments",
      "High-volume, low-complexity triage",
      "Mobile / tablet field diagnostics",
      "Offline or low-connectivity sites",
    ],
    notFor: [
      "Multi-step repair procedures",
      "Root cause analysis requiring reasoning chains",
      "Safety-critical system diagnostics",
      "Cross-referencing multiple manuals simultaneously",
    ],
  },
  {
    id: "forge",
    name: "FORGE",
    tier: "02 — MID TIER",
    tagline: "Production Power. Multi-Step Intelligence.",
    color: "#f59e0b",
    colorDim: "#d97706",
    colorBg: "rgba(245,158,11,0.08)",
    colorBorder: "rgba(245,158,11,0.25)",
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    glowColor: "rgba(245,158,11,0.4)",
    model: "Gemini 2.0 Flash",
    provider: "Google AI",
    latency: "1–3s",
    useCase: "Multi-step repair procedures, component cross-references, fault tree navigation",
    longDesc:
      "FORGE is the industrial workhorse. When NORD isn't enough and APEX is overkill, FORGE steps in to deliver the multi-step, context-rich reasoning that mid-complexity troubleshooting demands. Built on Gemini 2.0 Flash's 1M token context window, FORGE can ingest entire service manuals, trace nested fault trees, and generate step-by-step repair procedures complete with tool requirements, torque specifications, and part cross-references. At 1–3 second response times, it handles the vast majority of real-world maintenance scenarios without breaking a sweat.",
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
        desc: "Follows nested decision trees from symptom to root cause. Handles AND/OR gates, probability weighting, and dead-end pruning.",
        icon: "🌲",
      },
      {
      title: "1M Token Context",
        desc: "Gemini 2.0 Flash processes entire manual chapters. No chunking artifacts. Full cross-section reasoning.",
      icon: "📚",
      },
      {
        title: "Streaming Responses",
        desc: "Step-by-step output streams in real-time. Technician sees first steps while FORGE is still reasoning.",
        icon: "⚡",
      },
      {
        title: "Private Cloud Option",
        desc: "Runs on customer VPC for data residency compliance. Full audit trail with immutable decision logs.",
        icon: "☁️",
      },
    ],
    metrics: [
      { label: "Response Time", value: "1.84", unit: "s median" },
      { label: "P99 Latency", value: "3.2", unit: "s" },
      { label: "Throughput", value: "542", unit: "q/s" },
      { label: "Accuracy", value: "97.8", unit: "%" },
      { label: "Context Window", value: "1M", unit: "tokens" },
      { label: "Chunks Retrieved", value: "Up to", unit: "8 per query" },
    ],
    specs: [
      { label: "Base Model", value: "Google Gemini 2.0 Flash" },
      { label: "API Provider", value: "Google AI Studio / Vertex AI" },
      { label: "Vector Search", value: "pgvector (customer VPC option)" },
      { label: "Embedding Model", value: "OpenAI text-embedding-3-small" },
      { label: "Embedding Dims", value: "1,536" },
      { label: "Max Chunks", value: "8 (top-k cosine ≥ 0.72)" },
      { label: "Output Format", value: "Streaming JSON + Markdown" },
      { label: "RAG Strategy", value: "Dense retrieval + reranking" },
      { label: "Deployment", value: "Cloud (default) / Private VPC" },
      { label: "Compliance", value: "SOC 2, GDPR data residency ready" },
    ],
    useCases: [
      {
        scenario: "Technician describes a vibration anomaly in a Siemens spindle motor",
        response:
          "FORGE retrieves 5 relevant chapters, traces the fault tree to three possible root causes, and presents a decision flowchart with probability weighting.",
      },
      {
        scenario: "Plant engineer needs to cross-reference a part number across 4 vendors",
        response:
          "FORGE queries all indexed vendor manuals, returns compatible part alternatives with pricing estimates and lead times — all in under 2 seconds.",
      },
      {
        scenario: "Night supervisor needs a complete 12-step pump replacement procedure",
        response:
          "FORGE generates a full procedure with torque specs, tool list, safety warnings, and verification steps — streamed as each step is reasoned.",
      },
    ],
    bestFor: [
      "Multi-step repair procedures",
      "Component cross-referencing",
      "Mid-complexity fault trees",
      "Mid-level maintenance engineers",
      "Production-line troubleshooting",
    ],
    notFor: [
      "Simple single-answer queries (use NORD)",
      "Safety-critical aviation systems",
      "Long-term root cause investigation",
      "Graph/structural reasoning tasks",
    ],
  },
  {
    id: "apex",
    name: "APEX",
    tier: "03 — HIGH TIER",
    tagline: "Maximum Reasoning. Critical Systems. Zero Margin for Error.",
    color: "#8b5cf6",
    colorDim: "#7c3aed",
    colorBg: "rgba(139,92,246,0.08)",
    colorBorder: "rgba(139,92,246,0.25)",
    gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    glowColor: "rgba(139,92,246,0.4)",
    model: "Claude Sonnet 3.5",
    provider: "Anthropic",
    latency: "3–8s",
    useCase: "Root cause analysis, safety-critical diagnostics, complex fault reasoning",
    longDesc:
      "APEX is MEND-X's maximum reasoning tier — purpose-engineered for the scenarios where getting it wrong has real consequences. Built on Claude Sonnet 3.5's best-in-class reasoning capabilities, APEX handles root cause analysis that requires multi-hop reasoning, safety-critical diagnostics with regulatory compliance implications, and complex fault scenarios where surface symptoms mask deeper systemic issues. Its 3–8 second response time reflects deliberate depth: APEX doesn't rush, it reasons. Every APEX response carries full reasoning transparency — the chain of thought is logged, auditable, and cited at every step.",
    features: [
      {
        title: "Root Cause Analysis",
        desc: "Multi-hop causal reasoning traces effects back to root causes, accounting for dependencies, cascading failures, and latent factors.",
        icon: "🔍",
      },
      {
        title: "Safety-Critical Reasoning",
        desc: "Designed for aviation, medical device, and high-voltage environments. Every conclusion cited, every assumption declared.",
        icon: "⚠️",
      },
      {
        title: "Full Reasoning Transparency",
        desc: "Claude's chain-of-thought is exposed. Every inference step is logged and attributable — essential for post-incident audits.",
        icon: "🔎",
      },
      {
        title: "Compliance Mapping",
        desc: "Maps conclusions to regulatory frameworks: DO-254, IEC-61508, FDA 21 CFR Part 11, ISO 55000. Auto-generates compliance documentation.",
        icon: "✅",
      },
      {
        title: "Zero-Knowledge Reasoning",
        desc: "Optional zero-knowledge proof mode: reasoning traces are verified without exposing raw manual content to the inference layer.",
        icon: "🛡️",
      },
      {
        title: "Structured Output + Citations",
        desc: "Returns structured JSON with step-by-step corrective procedures, every step tied to a manual page citation.",
        icon: "📄",
      },
    ],
    metrics: [
      { label: "Response Time", value: "5.3", unit: "s median" },
      { label: "P99 Latency", value: "8.1", unit: "s" },
      { label: "Throughput", value: "189", unit: "q/s" },
      { label: "Accuracy", value: "99.7", unit: "%" },
      { label: "Context Window", value: "200K", unit: "tokens" },
      { label: "Reasoning Depth", value: "∞", unit: "configurable hops" },
    ],
    specs: [
      { label: "Base Model", value: "Anthropic Claude Sonnet 3.5" },
      { label: "API Provider", value: "Anthropic API / AWS Bedrock" },
      { label: "Reasoning Engine", value: "Extended thinking (configurable)" },
      { label: "Vector Search", value: "pgvector (encrypted, customer VPC)" },
      { label: "Embedding Model", value: "OpenAI text-embedding-3-large" },
      { label: "Embedding Dims", value: "3,072" },
      { label: "Max Chunks", value: "16 (top-k + reranking)" },
      { label: "Output Format", value: "Streaming JSON + reasoning trace" },
      { label: "Audit Trail", value: "Immutable, full chain-of-thought" },
      { label: "Deployment", value: "Dedicated VPC / air-gap capable" },
      { label: "Compliance", value: "DO-254, IEC-61508, FDA, ISO 55000" },
    ],
    useCases: [
      {
        scenario: "Aircraft landing gear hydraulic system shows intermittent pressure drops",
        response:
          "APEX traces the fault across 6 interconnected subsystems, identifies a cracked seal in a non-obvious junction, and maps the conclusion to DO-254 compliance documentation — with full reasoning chain exposed.",
      },
      {
        scenario: "Nuclear facility coolant system alarm after recent maintenance",
        response:
          "APEX cross-references maintenance logs with sensor telemetry, identifies a procedural deviation, and presents a root cause with probability weighting — all audit-ready.",
      },
      {
        scenario: "Recurring conveyor motor faults despite correct repairs",
        response:
          "APEX performs root cause analysis across motor, VFD, and power supply subsystems, identifies a cascading failure pattern, and recommends systemic replacement — not just symptom treatment.",
      },
    ],
    bestFor: [
      "Critical failure root cause analysis",
      "Safety-critical / regulated environments",
      "Recurring fault investigation",
      "Compliance-sensitive diagnostics",
      "Post-incident forensic analysis",
    ],
    notFor: [
      "Simple error code lookups (use NORD)",
      "High-volume, low-complexity triage (use FORGE)",
      "Real-time process control decisions",
      "Tasks requiring sub-second response",
    ],
  },
];

export function getModel(id: string): AIModel | undefined {
  return MODELS.find((m) => m.id === id);
}

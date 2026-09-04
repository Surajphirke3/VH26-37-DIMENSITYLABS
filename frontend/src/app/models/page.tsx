"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Zap,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Play,
  Layers,
  ArrowRight,
  Clock,
  Send,
  RefreshCw,
  Info,
} from "lucide-react";
import LandingLayout from "@/components/landing/LandingLayout";
import { getModels, singleQuery } from "@/lib/api";
import { AIModel, TroubleshootingResponse } from "@/lib/types";

export default function ModelsPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [defaultModel, setDefaultModel] = useState<string>("llama-3.3-70b-versatile");
  const [taskRouting, setTaskRouting] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Playground state
  const [selectedModel, setSelectedModel] = useState<string>("llama-3.3-70b-versatile");
  const [prompt, setPrompt] = useState<string>(
    "What are the top 3 safety checks before servicing hydraulic proportional valves on a CNC lathe?"
  );
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TroubleshootingResponse | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    getModels()
      .then((res) => {
        setModels(res.models || []);
        if (res.default_model) {
          setDefaultModel(res.default_model);
          setSelectedModel(res.default_model);
        }
        setTaskRouting(res.task_routing || {});
      })
      .catch((err) => {
        console.error("Failed to load models:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleTestPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setTesting(true);
    setTestResult(null);
    setTestError(null);

    try {
      const res = await singleQuery(prompt.trim(), undefined, undefined, selectedModel);
      setTestResult(res);
    } catch (err: any) {
      setTestError(err?.message || "Inference request failed");
    } finally {
      setTesting(false);
    }
  };

  const samplePrompts = [
    "What are the top 3 safety checks before servicing hydraulic proportional valves on a CNC lathe?",
    "Alarm E-04 spindle drive overload triggered during heavy facing cut. Immediate diagnostic steps?",
    "Explain how to check backlash on ballscrew thrust bearings using a dial test indicator.",
  ];

  return (
    <LandingLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-2">
            <Cpu className="w-4 h-4" />
            <span>Groq LPU Inference Architecture</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
            AI Models & Task Routing
          </h1>
          <p className="mt-2 text-base text-muted-foreground max-w-3xl">
            MEND - X leverages low-latency Groq LPUs with dynamic task-specific model routing for sub-second classification, deep technical reasoning, and multimodal visual inspection.
          </p>
        </div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                <div className="h-5 bg-muted rounded w-2/3 mb-4" />
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                <div className="h-8 bg-muted rounded" />
              </div>
            ))
          ) : (
            models.map((m) => {
              const isDefault = m.id === defaultModel;
              return (
                <div
                  key={m.id}
                  className={`bg-card border rounded-xl p-6 flex flex-col justify-between transition-all ${
                    isDefault ? "border-amber-500/80 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/30" : "border-border hover:border-border/80"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground font-mono">
                        {m.provider}
                      </span>
                      {isDefault && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Default
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-foreground font-mono mb-1">{m.name}</h3>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{m.description || m.type}</p>

                    <div className="space-y-2 pt-2 border-t border-border/70 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Context Window:</span>
                        <span className="font-mono font-medium text-foreground">
                          {m.context_window ? m.context_window.toLocaleString() : "128,000"} tokens
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Best For:</span>
                        <span className="font-medium text-foreground text-right">
                          {m.recommended_for || m.type}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Vision Capable:</span>
                        <span className="font-medium text-foreground">
                          {m.supports_vision ? (
                            <span className="text-emerald-500 inline-flex items-center gap-1 font-semibold">
                              <Eye className="w-3 h-3" /> Yes
                            </span>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedModel(m.id);
                      const el = document.getElementById("sandbox-section");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`mt-6 w-full py-2 px-3 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                      selectedModel === m.id
                        ? "bg-amber-500 text-slate-950 border-amber-500 font-bold"
                        : "bg-background border-border hover:border-amber-500/50 text-foreground"
                    }`}
                  >
                    <Play className="w-3 h-3" />
                    <span>Test In Playground</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Task Routing Matrix */}
        <div className="bg-card border border-border rounded-xl p-6 mb-12 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-foreground">Automated Task Routing Matrix</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            Incoming queries are dynamically routed to specialized models based on classification intent, SLA latency budgets, and multimodal input requirements.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-background border border-border rounded-lg">
              <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Intent Classification</div>
              <div className="text-sm font-bold text-foreground font-mono">llama-3.1-8b-instant</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Sub-200ms latency for rapid intent classification & disambiguation extraction.
              </p>
            </div>

            <div className="p-4 bg-background border border-border rounded-lg">
              <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">General Troubleshooting</div>
              <div className="text-sm font-bold text-foreground font-mono">llama-3.3-70b-versatile</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Standard balanced reasoning for procedural synthesis and alarm code resolution.
              </p>
            </div>

            <div className="p-4 bg-background border border-border rounded-lg">
              <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Deep Technical Reasoning</div>
              <div className="text-sm font-bold text-foreground font-mono">qwen-2.5-32b</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                High-precision multilingual reasoning, circuit tracing, and mathematical tolerance verification.
              </p>
            </div>

            <div className="p-4 bg-background border border-border rounded-lg">
              <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Multimodal Visual Inspection</div>
              <div className="text-sm font-bold text-foreground font-mono">llama-3.2-11b-vision-preview</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Direct image analysis of fractured components, warning indicators, and wiring diagrams.
              </p>
            </div>
          </div>
        </div>

        {/* Live Playground / Testing Sandbox */}
        <div id="sandbox-section" className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Interactive Evaluation</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">Model Inference Sandbox</h2>
            </div>

            {/* Model select */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Target Model:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleTestPrompt} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Industrial Test Prompt:
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none font-mono"
                placeholder="Enter prompt or query..."
              />
            </div>

            {/* Prompt presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Sample Prompts:</span>
              {samplePrompts.map((sp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(sp)}
                  className="text-[11px] px-2.5 py-1 bg-secondary hover:bg-secondary/80 text-foreground rounded-md transition-colors truncate max-w-xs"
                  title={sp}
                >
                  {sp}
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={testing || !prompt.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-sm transition-colors shadow"
              >
                {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Execute Inference</span>
              </button>
            </div>
          </form>

          {/* Test Error */}
          {testError && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
              Error executing inference: {testError}
            </div>
          )}

          {/* Result Output */}
          {testResult && (
            <div className="mt-6 border-t border-border pt-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Inference Complete
                </span>

                <div className="flex items-center gap-3 text-xs font-mono">
                  {(testResult.total_latency_ms || testResult.metadata?.total_latency_ms) && (
                    <span className="inline-flex items-center gap-1 text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {testResult.total_latency_ms || testResult.metadata?.total_latency_ms} ms total
                    </span>
                  )}
                  {(testResult.model || testResult.model_used || testResult.metadata?.model) && (
                    <span className="text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                      {testResult.model || testResult.model_used || testResult.metadata?.model}
                    </span>
                  )}
                  {(testResult.language || testResult.language_detected) && (
                    <span className="text-muted-foreground uppercase">
                      Lang: {testResult.language || testResult.language_detected}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-background border border-border rounded-xl p-5 font-sans text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {testResult.answer || testResult.summary}
              </div>

              {/* Latency timing breakdown if available */}
              {(testResult.latency_breakdown || testResult.metadata?.latency_breakdown) && (
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 bg-secondary/50 rounded border border-border/50">
                    <span className="text-muted-foreground block text-[10px]">Retrieval</span>
                    <span className="text-foreground font-semibold">
                      {(testResult.latency_breakdown || testResult.metadata?.latency_breakdown)?.retrieval_ms || 0}ms
                    </span>
                  </div>
                  <div className="p-2 bg-secondary/50 rounded border border-border/50">
                    <span className="text-muted-foreground block text-[10px]">Rerank</span>
                    <span className="text-foreground font-semibold">
                      {(testResult.latency_breakdown || testResult.metadata?.latency_breakdown)?.rerank_ms || 0}ms
                    </span>
                  </div>
                  <div className="p-2 bg-secondary/50 rounded border border-border/50">
                    <span className="text-muted-foreground block text-[10px]">LLM Generation</span>
                    <span className="text-foreground font-semibold">
                      {(testResult.latency_breakdown || testResult.metadata?.latency_breakdown)?.llm_ms || 0}ms
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </LandingLayout>
  );
}

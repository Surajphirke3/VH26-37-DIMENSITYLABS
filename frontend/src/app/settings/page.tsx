"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Save,
  RotateCcw,
  CheckCircle2,
  Database,
  Cpu,
  Languages,
  Shield,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import LandingLayout from "@/components/landing/LandingLayout";
import { getSystemConfig, getModels } from "@/lib/api";
import { AIModel } from "@/lib/types";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savedToast, setSavedToast] = useState(false);
  const [models, setModels] = useState<AIModel[]>([]);

  // Config parameters
  const [topK, setTopK] = useState<number>(15);
  const [rerankTopN, setRerankTopN] = useState<number>(5);
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(0.45);
  const [denseWeight, setDenseWeight] = useState<number>(0.7);
  const [defaultModel, setDefaultModel] = useState<string>("llama-3.3-70b-versatile");
  const [temperature, setTemperature] = useState<number>(0.1);
  const [maxTokens, setMaxTokens] = useState<number>(2048);
  const [defaultLanguage, setDefaultLanguage] = useState<string>("en");
  const [autoDetectLanguage, setAutoDetectLanguage] = useState<boolean>(true);
  const [strictGuardrails, setStrictGuardrails] = useState<boolean>(true);
  const [requireGrounding, setRequireGrounding] = useState<boolean>(true);

  useEffect(() => {
    // Load existing settings if saved locally
    const saved = localStorage.getItem("mendx_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.topK) setTopK(parsed.topK);
        if (parsed.rerankTopN) setRerankTopN(parsed.rerankTopN);
        if (parsed.similarityThreshold) setSimilarityThreshold(parsed.similarityThreshold);
        if (parsed.denseWeight) setDenseWeight(parsed.denseWeight);
        if (parsed.defaultModel) setDefaultModel(parsed.defaultModel);
        if (parsed.temperature !== undefined) setTemperature(parsed.temperature);
        if (parsed.maxTokens) setMaxTokens(parsed.maxTokens);
        if (parsed.defaultLanguage) setDefaultLanguage(parsed.defaultLanguage);
        if (parsed.autoDetectLanguage !== undefined) setAutoDetectLanguage(parsed.autoDetectLanguage);
        if (parsed.strictGuardrails !== undefined) setStrictGuardrails(parsed.strictGuardrails);
        if (parsed.requireGrounding !== undefined) setRequireGrounding(parsed.requireGrounding);
      } catch (e) {}
    }

    Promise.all([
      getSystemConfig().catch(() => null),
      getModels().catch(() => null),
    ]).then(([sysConfig, modelsRes]) => {
      if (modelsRes?.models) {
        setModels(modelsRes.models);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const configToSave = {
      topK,
      rerankTopN,
      similarityThreshold,
      denseWeight,
      defaultModel,
      temperature,
      maxTokens,
      defaultLanguage,
      autoDetectLanguage,
      strictGuardrails,
      requireGrounding,
    };
    localStorage.setItem("mendx_settings", JSON.stringify(configToSave));
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleResetDefaults = () => {
    setTopK(15);
    setRerankTopN(5);
    setSimilarityThreshold(0.45);
    setDenseWeight(0.7);
    setDefaultModel("llama-3.3-70b-versatile");
    setTemperature(0.1);
    setMaxTokens(2048);
    setDefaultLanguage("en");
    setAutoDetectLanguage(true);
    setStrictGuardrails(true);
    setRequireGrounding(true);
    localStorage.removeItem("mendx_settings");
  };

  return (
    <LandingLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">
              <Sliders className="w-4 h-4" />
              <span>Pipeline Calibration</span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
              System Settings & RAG Tuning
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure vector retrieval depth, cross-encoder thresholds, default inference models, and safety boundaries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-lg transition-colors border border-border"
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {savedToast && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Settings successfully saved and applied to your workspace!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Retrieval & RAG Pipeline */}
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <Database className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-foreground">ChromaDB Retrieval & Cross-Encoder Reranking</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              Parameters controlling candidate retrieval from the cosine vector space and subsequent cross-encoder precision filtering.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top-K Initial Retrieval */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-foreground">
                    Initial Vector Candidates (Top-K)
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-500 bg-secondary px-2 py-0.5 rounded">
                    {topK} chunks
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-secondary rounded-lg cursor-pointer"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Raw candidate chunks retrieved from ChromaDB before reranking (Recommended: 10-20).
                </span>
              </div>

              {/* Top-N Rerank */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-foreground">
                    Top-N Reranked to Context
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-500 bg-secondary px-2 py-0.5 rounded">
                    {rerankTopN} chunks
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={rerankTopN}
                  onChange={(e) => setRerankTopN(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-secondary rounded-lg cursor-pointer"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Highest-scoring chunks supplied to the LLM context prompt (Recommended: 3-5).
                </span>
              </div>

              {/* Cosine Similarity Minimum Threshold */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-foreground">
                    Cosine Similarity Cutoff Threshold
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-500 bg-secondary px-2 py-0.5 rounded">
                    {(similarityThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.80"
                  step="0.05"
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-secondary rounded-lg cursor-pointer"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Rejects chunks with similarity scores below this cutoff to prevent irrelevant context.
                </span>
              </div>

              {/* Dense vs Sparse Balance */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-foreground">
                    Hybrid Retrieval Balance
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-500 bg-secondary px-2 py-0.5 rounded">
                    {(denseWeight * 100).toFixed(0)}% Dense / {((1 - denseWeight) * 100).toFixed(0)}% BM25
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.9"
                  step="0.05"
                  value={denseWeight}
                  onChange={(e) => setDenseWeight(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-secondary rounded-lg cursor-pointer"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Ratio between semantic dense vector search and keyword/exact alarm code search.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Groq LPU Inference Parameters */}
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <Cpu className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-foreground">Groq Model Inference</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              Control LLM model selection and generation determinism for technical diagnostic instructions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  Default Reasoning Model
                </label>
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </option>
                  ))}
                  {models.length === 0 && (
                    <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Groq)</option>
                  )}
                </select>
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Used for primary procedural synthesis and troubleshooting answers.
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-foreground">
                    Temperature (Determinism)
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-500 bg-secondary px-2 py-0.5 rounded">
                    {temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.7"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-secondary rounded-lg cursor-pointer"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Lower values (0.05-0.15) enforce strict technical accuracy without hallucinations.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Multilingual Support */}
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <Languages className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-foreground">Multilingual Configuration</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              MEND - X natively processes queries in 8+ languages for regional field operators.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  Preferred Output Language
                </label>
                <select
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="en">English (Default)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="gu">Gujarati (ગુજરાતી)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="kn">Kannada (ಕನ್ನಡ)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                </select>
              </div>

              <div className="flex flex-col justify-center">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoDetectLanguage}
                    onChange={(e) => setAutoDetectLanguage(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Auto-detect Input Query Language
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Automatically replies in the exact language used by the technician in the prompt.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Security & Safety Guardrails */}
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-foreground">Safety Guardrails & Anti-Hallucination</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              Protect operators from dangerous or unverified equipment repairs.
            </p>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-lg border border-border/60 bg-background">
                <input
                  type="checkbox"
                  checked={strictGuardrails}
                  onChange={(e) => setStrictGuardrails(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-amber-500"
                />
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Strict Prompt Injection & Jailbreak Defense
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Blocks prompt override patterns, system prompt extraction, and out-of-domain conversational attempts.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-lg border border-border/60 bg-background">
                <input
                  type="checkbox"
                  checked={requireGrounding}
                  onChange={(e) => setRequireGrounding(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-amber-500"
                />
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Enforce Verifiable Citation Grounding
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Mandates that every actionable repair step links to an indexed manual section and page number before display.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-lg transition-colors border border-border"
            >
              Reset to Recommended
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </LandingLayout>
  );
}

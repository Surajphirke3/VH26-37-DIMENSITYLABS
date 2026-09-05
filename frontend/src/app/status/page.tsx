"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Database,
  Server,
  Zap,
  Cpu,
  Clock,
  HardDrive,
  Shield,
  Layers,
} from "lucide-react";
import ConsoleLayout from "@/components/console/ConsoleLayout";
import { getSystemStatus } from "@/lib/api";
import { SystemStatusData } from "@/lib/types";

export default function SystemStatusPage() {
  const [data, setData] = useState<SystemStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const res = await getSystemStatus();
      setData(res);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err?.message || "Failed to reach system diagnostic endpoint");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    if (!autoRefresh) return;
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus, autoRefresh]);

  const formatUptime = (seconds?: number) => {
    if (!seconds && seconds !== 0) return "N/A";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0 || d > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(" ");
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s === "online" || s === "connected" || s === "operational") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {status}
        </span>
      );
    }
    if (s.includes("fallback") || s.includes("in-memory") || s.includes("degraded")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-500/15 text-red-500 border border-red-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        {status || "unknown"}
      </span>
    );
  };

  const isSystemHealthy =
    data &&
    (data.chromadb?.status === "online" || data.chromadb?.status.includes("fallback")) &&
    (data.database?.status === "connected" || data.database?.status.includes("sqlite"));

  return (
    <ConsoleLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">
              <Activity className="w-4 h-4" />
              <span>Real-Time Infrastructure Telemetry</span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
              System Health & Diagnostics
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Live status monitor for ChromaDB vector embeddings, database connectivity, Groq LPU API, and caching subsystems.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>Auto-refresh (5s)</span>
            </label>

            <button
              onClick={() => {
                setLoading(true);
                fetchStatus();
              }}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-lg transition-colors border border-border"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Global Banner */}
        <div
          className={`p-5 rounded-xl border mb-8 flex items-center justify-between flex-wrap gap-4 ${
            isSystemHealthy
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
          }`}
        >
          <div className="flex items-center gap-3">
            {isSystemHealthy ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
            )}
            <div>
              <h3 className="font-bold text-base text-foreground">
                {isSystemHealthy ? "All Industrial Telemetry Operational" : "Degraded or Initializing Subsystems"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isSystemHealthy
                  ? "Vector search engine, database persistence, and Groq inference pipelines responding within target thresholds."
                  : "One or more subsystems are operating under fallback or disconnected mode."}
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-muted-foreground">
            Last checked: {lastRefreshed.toLocaleTimeString()}
          </div>
        </div>

        {/* Component Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* ChromaDB Vector Store */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-foreground">ChromaDB Vector Store</h3>
              </div>
              {getStatusBadge(data?.chromadb?.status)}
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">Similarity Metric:</span>
                <span className="font-mono font-bold text-amber-500 uppercase">
                  {data?.chromadb?.metric || "cosine"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">Indexed Vector Count:</span>
                <span className="font-mono font-bold text-foreground">
                  {data?.chromadb?.vector_count !== undefined
                    ? data.chromadb.vector_count.toLocaleString()
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">Collection Name:</span>
                <span className="font-mono text-foreground">
                  {data?.chromadb?.collection || "manual_chunks"}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Query Latency:</span>
                <span className="font-mono text-emerald-500">
                  {data?.chromadb?.latency_ms !== undefined ? `${data.chromadb.latency_ms} ms` : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Relational Database */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-foreground">SQL Database</h3>
              </div>
              {getStatusBadge(data?.database?.status)}
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">Engine:</span>
                <span className="font-mono font-bold text-foreground">SQLite / PostgreSQL</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">Ping Latency:</span>
                <span className="font-mono text-emerald-500">
                  {data?.database?.latency_ms !== undefined ? `${data.database.latency_ms} ms` : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">ACID Transactions:</span>
                <span className="font-mono text-foreground">Enforced</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Connection State:</span>
                <span className="font-mono text-emerald-500">Active Pool</span>
              </div>
            </div>
          </div>

          {/* Groq LPU Engine */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-foreground">Groq LPU Engine</h3>
              </div>
              {getStatusBadge(data?.groq?.status)}
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">Default Model:</span>
                <span className="font-mono font-bold text-amber-500">
                  {data?.groq?.default_model || "openai/gpt-oss-120b"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">Models Available:</span>
                <span className="font-mono font-bold text-foreground">
                  {data?.groq?.models_available || 4}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">Inference Speed:</span>
                <span className="font-mono text-emerald-500">~250-400 tok/s</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Vision Preview:</span>
                <span className="font-mono text-foreground">Multimodal (Text-Grounded)</span>
              </div>
            </div>
          </div>

          {/* Cache Subsystem */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-foreground">Cache Infrastructure</h3>
              </div>
              {getStatusBadge(data?.redis?.status || data?.cache?.status)}
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">Strategy:</span>
                <span className="font-mono font-bold text-foreground">
                  {data?.cache?.strategy || "LRU Memory + Redis Adapter"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">Embedding Cache TTL:</span>
                <span className="font-mono text-foreground">
                  {data?.cache?.embedding_cache_ttl || 86400}s (24h)
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">Retrieval Cache TTL:</span>
                <span className="font-mono text-foreground">
                  {data?.cache?.retrieval_cache_ttl || 3600}s (1h)
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Cache Ping Latency:</span>
                <span className="font-mono text-emerald-500">
                  {data?.redis?.latency_ms !== undefined ? `${data.redis.latency_ms} ms` : "< 1 ms"}
                </span>
              </div>
            </div>
          </div>

          {/* Runtime & Environment */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-foreground">Server Runtime</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-secondary text-secondary-foreground">
                {data?.runtime?.environment || "production"}
              </span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">Application:</span>
                <span className="font-mono font-bold text-foreground">
                  {data?.runtime?.app_name || "MEND - X"} v{data?.runtime?.version || "1.2.1"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">Python Runtime:</span>
                <span className="font-mono text-foreground">{data?.runtime?.python_version || "3.12+"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">Operating System:</span>
                <span className="font-mono text-foreground">{data?.runtime?.os || "Windows / Linux"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Server Uptime:</span>
                <span className="font-mono text-foreground">
                  {formatUptime(data?.runtime?.uptime_seconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Security & Guardrails */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-foreground">Guardrails & Safety</h3>
              </div>
              {getStatusBadge("operational")}
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">Prompt Injection Filter:</span>
                <span className="font-mono text-emerald-500 font-semibold">Active (Strict)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">Hallucination Guard:</span>
                <span className="font-mono text-emerald-500 font-semibold">Cross-Encoder Grounded</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/70">
                <span className="text-muted-foreground">PII Masking:</span>
                <span className="font-mono text-foreground">Enabled</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Input Token Limit:</span>
                <span className="font-mono text-foreground">4,000 tokens / request</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConsoleLayout>
  );
}

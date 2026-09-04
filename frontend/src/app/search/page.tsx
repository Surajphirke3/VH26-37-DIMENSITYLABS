"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Filter,
  FileText,
  Cpu,
  Layers,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Database,
  RefreshCw,
} from "lucide-react";
import LandingLayout from "@/components/landing/LandingLayout";
import { searchKnowledgeBase, getMachines } from "@/lib/api";
import { SearchResultItem, Machine } from "@/lib/types";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [topK, setTopK] = useState<number>(10);
  const [minSimilarity, setMinSimilarity] = useState<number>(0.1);
  const [machines, setMachines] = useState<Machine[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMachines()
      .then(setMachines)
      .catch(() => {});
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await searchKnowledgeBase(
        query.trim(),
        selectedMachine || undefined,
        topK,
        minSimilarity
      );
      setResults(res.items || []);
      setTotalCount(res.total || 0);
      setSearched(true);
    } catch (err: any) {
      setError(err?.message || "Failed to execute semantic search");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAskInChat = (item: SearchResultItem) => {
    const prompt = `Referencing ${item.manual_title} (Pages ${item.page_start}-${item.page_end}):\n"${item.excerpt.slice(0, 200)}..."\n\nExplain how to resolve this issue:`;
    router.push(`/dashboard?prompt=${encodeURIComponent(prompt)}${item.machine_id ? `&machine=${item.machine_id}` : ""}`);
  };

  return (
    <LandingLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-2">
            <Database className="w-4 h-4" />
            <span>Vector Engine & Cosine Retrieval</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
            Semantic Knowledge Search
          </h1>
          <p className="mt-2 text-base text-muted-foreground max-w-2xl">
            Execute direct vector similarity searches across all indexed equipment manuals, chunk embeddings, and fault documentation.
          </p>
        </div>

        {/* Search Query & Filters Box */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter symptom, alarm code (e.g. E-04), hydraulic pressure anomaly, or maintenance procedure..."
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-foreground transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-sm shadow transition-colors"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Vector Search</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                {/* Machine filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground">Target Machine:</span>
                  <select
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                    className="bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">All Machines (Cross-fleet)</option>
                    {machines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.model ? `(${m.model})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Top-K filter */}
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground">Top Results:</span>
                  <select
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                    className="bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value={5}>Top 5 chunks</option>
                    <option value={10}>Top 10 chunks</option>
                    <option value={20}>Top 20 chunks</option>
                    <option value={50}>Top 50 chunks</option>
                  </select>
                </div>

                {/* Min Similarity Slider */}
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground">Min Similarity:</span>
                  <input
                    type="range"
                    min="0"
                    max="0.8"
                    step="0.05"
                    value={minSimilarity}
                    onChange={(e) => setMinSimilarity(parseFloat(e.target.value))}
                    className="w-24 accent-amber-500 h-1.5 bg-secondary rounded-lg cursor-pointer"
                  />
                  <span className="font-mono font-semibold text-foreground">
                    {(minSimilarity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {searched && (
                <span className="text-muted-foreground font-mono">
                  Found <strong className="text-foreground">{totalCount}</strong> chunks
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : searched && results.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No Matching Vectors Found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              No manual excerpts exceeded the {(minSimilarity * 100).toFixed(0)}% similarity threshold for &quot;{query}&quot;. Try adjusting your keywords or lowering the minimum similarity threshold.
            </p>
            <button
              onClick={() => {
                setMinSimilarity(0.0);
                handleSearch();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-lg transition-colors"
            >
              Reset Min Similarity to 0%
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((item, idx) => {
              const scorePct = Math.round(item.similarity_score * 100);
              const scoreColor =
                scorePct >= 75
                  ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                  : scorePct >= 50
                  ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                  : "bg-blue-500/15 text-blue-500 border-blue-500/30";

              return (
                <div
                  key={item.chunk_id || idx}
                  className="bg-card border border-border hover:border-amber-500/40 rounded-xl p-5 sm:p-6 transition-all shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${scoreColor}`}
                      >
                        {scorePct}% Match
                      </span>
                      <Link
                        href={`/documents/${item.manual_id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:text-amber-500 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{item.manual_title}</span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground ml-0.5" />
                      </Link>
                      {item.machine_name && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                          <Cpu className="w-3 h-3 text-muted-foreground" />
                          {item.machine_name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">
                        Pages {item.page_start}-{item.page_end}
                      </span>
                      {item.section_path && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[200px]" title={item.section_path}>
                            {item.section_path}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="bg-background/80 rounded-lg p-4 font-mono text-xs leading-relaxed text-foreground border border-border/70 mb-4 whitespace-pre-wrap">
                    {item.excerpt}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Chunk ID: {item.chunk_id}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(item.excerpt, item.chunk_id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium rounded-md transition-colors"
                      >
                        {copiedId === item.chunk_id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Copy Excerpt</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleAskInChat(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-md shadow-sm transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Query Assistant</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </LandingLayout>
  );
}

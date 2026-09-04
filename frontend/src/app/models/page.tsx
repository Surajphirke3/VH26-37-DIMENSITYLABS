"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LandingLayout from "@/components/landing/LandingLayout";
import { MODELS } from "@/lib/models";
import { useTheme } from "@/lib/theme-context";

const TIER_COMPARISON = [
  { metric: "Response Time", nord: "<100ms", forge: "1–3s", apex: "3–8s" },
  { metric: "Throughput", nord: "14,900 q/s", forge: "542 q/s", apex: "189 q/s" },
  { metric: "Accuracy", nord: "99.2%", forge: "97.8%", apex: "99.7%" },
  { metric: "Context Window", nord: "8,192 tokens", forge: "1M tokens", apex: "200K tokens" },
  { metric: "Chunks Retrieved", nord: "3", forge: "8", apex: "16" },
  { metric: "Deployment", nord: "Edge / Air-gap", forge: "Cloud / VPC", apex: "Dedicated VPC" },
  { metric: "Embedding Dims", nord: "384 (edge)", forge: "1,536", apex: "3,072" },
  { metric: "Compliance", nord: "Zero egress", forge: "SOC 2 / GDPR", apex: "DO-254 / IEC-61508" },
];

export default function ModelsPage() {
  const { theme } = useTheme();
  const [selectedModel, setSelectedModel] = useState(0);

  return (
    <LandingLayout>
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-grid">
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full orb opacity-15" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full orb opacity-12" style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", animationDelay: "-5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full orb opacity-8" style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)", animationDelay: "-8s" }} />
      </div>

      {/* Hero */}
      <section className="relative z-10 pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full glass border border-[var(--border)] animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25">
            <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6] animate-pulse" />
            <span className="font-mono text-[10px] font-bold text-violet-600 dark:text-violet-400 tracking-widest uppercase">AI Intelligence</span>
          </div>
        </div>

        <h1 className="font-black text-[clamp(3rem,8vw,6rem)] leading-[1] tracking-tighter uppercase text-[var(--text-primary)] mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          Three Engines.<br />
          <span className="gradient-text">One Mission.</span>
        </h1>

        <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-3xl leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          MEND-X routes every diagnostic query to the right model. Not the most powerful model — the right model. NORD for instant answers. FORGE for multi-step reasoning. APEX for critical systems.
        </p>

        <div className="flex items-center gap-2 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Try Console
          </Link>
        </div>
      </section>

      {/* Model Cards */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {MODELS.map((model, idx) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(idx)}
              className={`group relative p-8 rounded-3xl border-2 transition-all duration-500 text-left animate-slide-up ${
                selectedModel === idx
                  ? "border-opacity-100 shadow-2xl scale-[1.02]"
                  : "border-opacity-40 hover:border-opacity-80 hover:scale-[1.01]"
              }`}
              style={{
                animationDelay: `${0.1 * idx}s`,
                background: model.colorBg,
                borderColor: model.color,
                boxShadow: selectedModel === idx ? `0 0 60px ${model.glowColor}, 0 20px 60px ${model.glowColor}` : `0 4px 20px ${model.glowColor}`,
              }}
            >
              {/* Glow orb */}
              <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 transition-opacity duration-500"
                style={{ background: model.color }}
              />

              {/* Tier badge */}
              <div className="flex items-center justify-between mb-8">
                <span className="font-mono text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded" style={{ color: model.color, backgroundColor: `${model.color}20`, border: `1px solid ${model.color}40` }}>
                  {model.tier}
                </span>
                {selectedModel === idx && (
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: model.color }}>
                    Active
                  </span>
                )}
              </div>

              {/* Logo */}
              <div className="h-16 mb-6 flex items-center">
                <Image
                  src={theme === "light" ? `/${model.id}-light.png` : `/${model.id}-dark.png`}
                  alt={model.name}
                  width={140}
                  height={60}
                  className="object-contain"
                />
              </div>

              {/* Model info */}
              <div className="mb-6">
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-1">{model.name}</h2>
                <p className="text-sm font-medium" style={{ color: model.color }}>{model.tagline}</p>
              </div>

              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
                {model.useCase}
              </p>

              {/* Latency pill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: model.color, boxShadow: `0 0 8px ${model.color}` }} />
                  <span className="font-mono text-sm font-bold" style={{ color: model.color }}>{model.latency}</span>
                </div>
                <span className="text-xs font-semibold text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Explore
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Selected Model Detail */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div
          className="rounded-3xl p-10 border transition-all duration-500 animate-scale-in"
          style={{
            background: MODELS[selectedModel].colorBg,
            borderColor: MODELS[selectedModel].color,
            boxShadow: `0 0 80px ${MODELS[selectedModel].glowColor}`,
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={theme === "light" ? `/${MODELS[selectedModel].id}-light.png` : `/${MODELS[selectedModel].id}-dark.png`}
                  alt={MODELS[selectedModel].name}
                  width={120}
                  height={50}
                  className="object-contain"
                />
                <div>
                  <h2 className="text-3xl font-black text-[var(--text-primary)]">{MODELS[selectedModel].name}</h2>
                  <p className="text-sm font-semibold" style={{ color: MODELS[selectedModel].color }}>{MODELS[selectedModel].model} · {MODELS[selectedModel].provider}</p>
                </div>
              </div>

              <p className="text-[var(--text-muted)] leading-relaxed mb-8 mt-6">
                {MODELS[selectedModel].longDesc}
              </p>

              <Link
                href={`/models/${MODELS[selectedModel].id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: MODELS[selectedModel].gradient, boxShadow: `0 0 30px ${MODELS[selectedModel].glowColor}` }}
              >
                Explore {MODELS[selectedModel].name}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Right: Key Metrics */}
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-6">Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                {MODELS[selectedModel].metrics.map((m, i) => (
                  <div key={i} className="p-4 rounded-xl border border-[var(--border)]" style={{ background: "var(--bg-surface)" }}>
                    <p className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">{m.label}</p>
                    <p className="text-2xl font-black text-[var(--text-primary)] font-mono">{m.value}</p>
                    {m.unit && <p className="text-xs text-[var(--text-muted)]">{m.unit}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODELS[selectedModel].features.map((feat, i) => (
            <div key={i} className="p-6 rounded-2xl border border-[var(--border)] glass-hover" style={{ background: "var(--bg-surface)" }}>
              <div className="text-2xl mb-3">{feat.icon}</div>
              <h4 className="font-bold text-[var(--text-primary)] mb-2">{feat.title}</h4>
              <p className="text-sm text-[var(--text-muted)]">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tier Comparison Table */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-[var(--border)]">
        <div className="text-center mb-12">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-indigo-500 tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-4">
            Side by Side
          </span>
          <h2 className="font-black text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight">
            How They Compare
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[var(--border)]">
                <th className="text-left px-4 py-4 font-black text-[var(--text-primary)]">Metric</th>
                <th className="text-center px-4 py-4 font-mono text-[10px] font-bold text-blue-500 uppercase tracking-widest">NORD</th>
                <th className="text-center px-4 py-4 font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest">FORGE</th>
                <th className="text-center px-4 py-4 font-mono text-[10px] font-bold text-violet-500 uppercase tracking-widest">APEX</th>
              </tr>
            </thead>
            <tbody>
              {TIER_COMPARISON.map((row, i) => (
                <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface)]/30 transition-colors">
                  <td className="px-4 py-4 font-semibold text-[var(--text-primary)]">{row.metric}</td>
                  <td className="text-center px-4 py-4 font-mono text-xs text-blue-400">{row.nord}</td>
                  <td className="text-center px-4 py-4 font-mono text-xs text-amber-400">{row.forge}</td>
                  <td className="text-center px-4 py-4 font-mono text-xs text-violet-400">{row.apex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-16">
        <div className="glass rounded-[2rem] p-10 sm:p-16 text-center border-indigo-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
          <h2 className="font-black text-3xl sm:text-4xl text-[var(--text-primary)] mb-4 relative z-10">
            Choose the right tier for every query.
          </h2>
          <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-xl mx-auto mb-8 relative z-10">
            MEND-X routes automatically. But you can also manually select a model tier in the console for fine-grained control.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
            <Link href="/dashboard" className="px-8 py-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              Launch Console
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link href="/architecture" className="px-8 py-4 rounded-xl font-black text-sm border border-[var(--border)] text-[var(--text-primary)] hover:border-indigo-500/50 transition-colors flex items-center gap-2">
              View Architecture
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

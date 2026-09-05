"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import LandingLayout from "@/components/landing/LandingLayout";
import { MODELS, getModel } from "@/lib/models";
import { useTheme } from "@/lib/theme-context";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { id } = await params;
  const model = getModel(id);
  if (!model) notFound();

  return <ModelDetailClient modelId={id} />;
}

function ModelDetailClient({ modelId }: { modelId: string }) {
  const model = getModel(modelId);
  if (!model) notFound();
  const { theme } = useTheme();
  const logoSrc = theme === "light" ? `/${model.id}-light.png` : `/${model.id}-dark.png`;

  return (
    <LandingLayout>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-grid">
        <div className="absolute top-1/4 -right-1/4 w-[900px] h-[900px] rounded-full orb opacity-20" style={{ background: `radial-gradient(circle, ${model.color} 0%, transparent 70%)` }} />
        <div className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full orb opacity-10" style={{ background: `radial-gradient(circle, ${model.colorDim} 0%, transparent 70%)`, animationDelay: "-5s" }} />
      </div>

      {/* Hero */}
      <section className="relative z-10 pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Link href="/models" className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6 sm:mb-8">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          All Models
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-3 mb-6 px-3 py-1.5 rounded-full glass border" style={{ borderColor: `${model.color}40`, backgroundColor: `${model.color}10` }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: model.color, boxShadow: `0 0 8px ${model.color}` }} />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: model.color }}>{model.tier}</span>
            </div>

            <div className="mb-8">
              <Image
                src={logoSrc}
                alt={model.name}
                width={200}
                height={80}
                className="object-contain"
              />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--text-primary)] tracking-tight leading-[1.05] mb-4">
              {model.tagline.split(". ").map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}{i < arr.length - 1 ? "." : ""}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </h1>

            <p className="text-[var(--text-muted)] text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
              {model.longDesc}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: model.gradient, boxShadow: `0 0 30px ${model.glowColor}` }}
              >
                Try {model.name} in Console
              </Link>
              <Link
                href="/models"
                className="px-6 py-3 rounded-xl font-bold text-sm border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
              >
                Compare Tiers
              </Link>
            </div>
          </div>

          {/* Right: Headline metric */}
          <div className="relative">
            <div
              className="rounded-3xl p-8 border-2 relative overflow-hidden"
              style={{
                background: model.colorBg,
                borderColor: model.color,
                boxShadow: `0 0 80px ${model.glowColor}`,
              }}
            >
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-30" style={{ background: model.color }} />

              <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: model.color }}>
                Headline Speed
              </p>
              <p className="text-7xl sm:text-8xl font-black font-mono text-[var(--text-primary)] tracking-tighter mb-2">
                {model.latency}
              </p>
              <p className="text-sm text-[var(--text-muted)] mb-8">median response time, end-to-end</p>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--border)]">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Model</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{model.model}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Provider</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{model.provider}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Tier</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{model.tier.split("— ")[1] || model.tier}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics grid */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {model.metrics.map((m, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-[var(--border)] glass-hover"
              style={{ background: "var(--bg-surface)" }}
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">{m.label}</p>
              <p className="text-2xl sm:text-3xl font-black font-mono text-[var(--text-primary)] mb-1">{m.value}</p>
              {m.unit && <p className="text-xs text-[var(--text-muted)]">{m.unit}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="text-center mb-12">
          <span className="inline-block font-mono text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border mb-4" style={{ color: model.color, backgroundColor: `${model.color}10`, borderColor: `${model.color}30` }}>
            Capabilities
          </span>
          <h2 className="font-black text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight">
            What {model.name} does best
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {model.features.map((feat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-[var(--border)] glass-hover relative overflow-hidden"
              style={{ background: "var(--bg-surface)" }}
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-10" style={{ background: model.color }} />
              <div className="relative z-10">
                <div className="text-3xl mb-3">{feat.icon}</div>
                <h4 className="font-bold text-lg text-[var(--text-primary)] mb-2">{feat.title}</h4>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="text-center mb-12">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-indigo-500 tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-4">
            In the Field
          </span>
          <h2 className="font-black text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight">
            Real scenarios. Real answers.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {model.useCases.map((uc, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border-2 relative"
              style={{
                background: model.colorBg,
                borderColor: `${model.color}50`,
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="font-mono text-xs font-black w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: model.color, color: "#000" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-bold text-[var(--text-primary)] text-sm leading-snug">{uc.scenario}</p>
              </div>
              <div className="pl-10 border-l-2" style={{ borderColor: `${model.color}40` }}>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed italic">"{uc.response}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best for / Not for */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Best for */}
          <div className="p-8 rounded-2xl border-2 border-emerald-500/30" style={{ background: "rgba(16,185,129,0.06)" }}>
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              <h3 className="font-black text-lg text-[var(--text-primary)] uppercase tracking-wider">Best For</h3>
            </div>
            <ul className="space-y-3">
              {model.bestFor.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-muted)]">
                  <span className="text-emerald-500 mt-0.5">▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not for */}
          <div className="p-8 rounded-2xl border-2 border-rose-500/30" style={{ background: "rgba(244,63,94,0.06)" }}>
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              <h3 className="font-black text-lg text-[var(--text-primary)] uppercase tracking-wider">Not For</h3>
            </div>
            <ul className="space-y-3">
              {model.notFor.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-muted)]">
                  <span className="text-rose-500 mt-0.5">▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-[var(--border)]">
        <div className="text-center mb-12">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-indigo-500 tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-4">
            Technical
          </span>
          <h2 className="font-black text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight">
            Under the hood
          </h2>
        </div>

        <div className="rounded-2xl border border-[var(--border)] overflow-hidden" style={{ background: "var(--bg-surface)" }}>
          {model.specs.map((spec, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-2 px-6 py-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-base)]/30 transition-colors"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">{spec.label}</p>
              <p className="text-sm font-semibold text-[var(--text-primary)] mt-1 sm:mt-0">{spec.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Other models */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="text-center mb-12">
          <h2 className="font-black text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight">
            Other engines in the lineup
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MODELS.filter((m) => m.id !== model.id).map((other) => (
            <Link
              key={other.id}
              href={`/models/${other.id}`}
              className="group p-6 rounded-2xl border-2 transition-all hover:scale-[1.02]"
              style={{
                background: other.colorBg,
                borderColor: `${other.color}50`,
                boxShadow: `0 4px 20px ${other.glowColor}`,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <Image
                  src={theme === "light" ? `/${other.id}-light.png` : `/${other.id}-dark.png`}
                  alt={other.name}
                  width={120}
                  height={48}
                  className="object-contain"
                />
                <span className="font-mono text-[10px] uppercase tracking-widest font-bold" style={{ color: other.color }}>
                  {other.tier}
                </span>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: other.color }}>{other.tagline}</p>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">{other.useCase}</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold" style={{ color: other.color }}>{other.latency}</span>
                <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform" style={{ color: other.color }}>
                  Explore
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-16">
        <div
          className="rounded-[2rem] p-10 sm:p-16 text-center border-2 relative overflow-hidden"
          style={{
            background: model.colorBg,
            borderColor: model.color,
            boxShadow: `0 0 60px ${model.glowColor}`,
          }}
        >
          <h2 className="font-black text-3xl sm:text-4xl text-[var(--text-primary)] mb-4 relative z-10">
            See {model.name} in action.
          </h2>
          <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-xl mx-auto mb-8 relative z-10">
            {model.useCase} Open the console and route your next query through {model.name}.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black text-sm text-white transition-all hover:scale-105 active:scale-95 relative z-10"
            style={{ background: model.gradient, boxShadow: `0 0 30px ${model.glowColor}` }}
          >
            Launch Console
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </section>
    </LandingLayout>
  );
}

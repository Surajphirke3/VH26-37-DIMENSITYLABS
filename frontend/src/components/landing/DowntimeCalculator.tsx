"use client";

import React, { useState } from "react";

export default function DowntimeCalculator() {
  const [hourlyCost, setHourlyCost] = useState(25000);
  const [incidentsPerMonth, setIncidentsPerMonth] = useState(4);
  const [avgRepairTime, setAvgRepairTime] = useState(4.5);

  const traditionalCost = hourlyCost * incidentsPerMonth * avgRepairTime * 12;
  const mendXRepairTime = 0.5; // Estimated repair time with Mend-X (hours, fast triage)
  const mendXCost = hourlyCost * incidentsPerMonth * mendXRepairTime * 12;
  const savings = traditionalCost - mendXCost;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  return (
    <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-28 border-t border-[var(--border)] scroll-mt-28">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="animate-slide-in-left">
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-rose-500 tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 mb-4">
            Economic Impact Analysis
          </span>
          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight mb-6">
            Calculate your <span className="gradient-text-rose">Downtime Burn.</span>
          </h2>
          <p className="text-[var(--text-muted)] text-base leading-relaxed mb-8">
            Every minute an assembly line sits idle, capital evaporates. Traditional troubleshooting relies on manual searches through outdated PDFs, burning hours before wrenches ever turn.
            Plug in your facility metrics to see the capital MEND-X salvages.
          </p>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Downtime Cost / Hour
                </label>
                <span className="text-sm font-black text-[var(--text-primary)]">{formatCurrency(hourlyCost)}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="1000"
                value={hourlyCost}
                onChange={(e) => setHourlyCost(Number(e.target.value))}
                className="w-full appearance-none bg-[var(--border)] h-2 rounded-full outline-none slider-thumb"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Incidents / Month
                </label>
                <span className="text-sm font-black text-[var(--text-primary)]">{incidentsPerMonth} events</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={incidentsPerMonth}
                onChange={(e) => setIncidentsPerMonth(Number(e.target.value))}
                className="w-full appearance-none bg-[var(--border)] h-2 rounded-full outline-none slider-thumb"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Avg. Manual Triage (Hrs)
                </label>
                <span className="text-sm font-black text-[var(--text-primary)]">{avgRepairTime} hrs</span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                step="0.5"
                value={avgRepairTime}
                onChange={(e) => setAvgRepairTime(Number(e.target.value))}
                className="w-full appearance-none bg-[var(--border)] h-2 rounded-full outline-none slider-thumb"
              />
            </div>
          </div>
        </div>

        <div className="animate-slide-in-right relative">
          <div className="absolute inset-0 bg-rose-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="cyber-card p-10 relative z-10 bg-white/10 dark:bg-black/40 backdrop-blur-3xl border border-[var(--border)]">
            <h3 className="text-sm font-bold text-[var(--text-secondary)] tracking-widest uppercase mb-8 border-b border-[var(--border)] pb-4">
              Annual Fiscal Projection
            </h3>

            <div className="flex flex-col gap-8">
              <div>
                <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2">Status Quo Loss</p>
                <p className="text-3xl font-black text-rose-500 font-mono tracking-tighter">
                  {formatCurrency(traditionalCost)}
                </p>
              </div>

              <div>
                <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2">With MEND-X</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] font-mono tracking-tighter">
                  {formatCurrency(mendXCost)}
                </p>
              </div>

              <div className="pt-6 border-t border-[var(--border)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">
                    Capital Salvaged
                  </p>
                </div>
                <p className="text-[clamp(2.5rem,5vw,4rem)] font-black text-emerald-500 font-mono tracking-tighter leading-none" style={{ filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.3))' }}>
                  {formatCurrency(savings)}
                </p>
                <p className="text-xs font-medium text-emerald-600/70 mt-2">
                  *Based on median LLM retrieval speed of 8s vs manual document traversal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html:`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent-primary);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(99,102,241,0.5);
          transition: transform 0.1s;
        }
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
      `}}/>
    </section>
  );
}

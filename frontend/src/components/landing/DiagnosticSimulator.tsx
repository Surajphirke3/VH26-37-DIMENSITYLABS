"use client";

import React, { useState, useEffect } from "react";

const CODE_SCENARIOS = [
  {
    code: "ERR-792",
    machine: "KUKA KR210",
    desc: "Servo amplifier overcurrent on Axis 4",
    triage: [
      "Analyzing telemetry trace...",
      "Matching fault 'ERR-792' in KUKA ServPack Volume 2...",
      "Cross-referencing schematic K-4901...",
      "Diagnostics complete. Resolution found."
    ],
    resolution: "Replace IGBT module on drive 4. Torque to 3.2Nm. Recalibrate joint sensor via KRC4 pad."
  },
  {
    code: "ALM-401",
    machine: "FANUC M20iA",
    desc: "VRDY off alarm (communication fault)",
    triage: [
      "Accessing FANUC R-30iB Mate manual...",
      "Scanning serial bus troubleshooting trees...",
      "Isolating emergency stop board contacts...",
      "Root cause isolated to CRM62 connection."
    ],
    resolution: "Reseat connector CRM62 on the emergency stop board. Verify 24V across pins A1/B1."
  },
  {
    code: "F07901",
    machine: "SIEMENS S7-1500 / SINAMICS",
    desc: "Motor overspeed detected",
    triage: [
      "Parsing SINAMICS S120 parameter list...",
      "Evaluating p1082 (max speed) vs r0063 (actual speed)...",
      "Checking encoder signals at SMC20...",
      "Resolution ready."
    ],
    resolution: "Check encoder coupling for mechanical slip. Verify parameter p0408 (encoder pulses) matches hardware."
  }
];

export default function DiagnosticSimulator() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [step, setStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = () => {
    setIsSimulating(true);
    setStep(0);
  };

  useEffect(() => {
    if (isSimulating && step <= CODE_SCENARIOS[activeScenario].triage.length) {
      const timer = setTimeout(() => {
        setStep(s => s + 1);
      }, 800 + Math.random() * 600); // 0.8s to 1.4s per step
      return () => clearTimeout(timer);
    } else if (isSimulating && step > CODE_SCENARIOS[activeScenario].triage.length) {
      setIsSimulating(false);
    }
  }, [isSimulating, step, activeScenario]);

  return (
    <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24">
      <div className="text-center mb-16 animate-slide-up">
        <span className="inline-block font-mono text-[10px] uppercase font-bold text-cyan-500 tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 mb-4">
          Live Interactive Simulator
        </span>
        <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
          Experience <span className="gradient-text-emerald">Sub-10s</span> diagnostics.
        </h2>
        <p className="text-[var(--text-muted)] mt-4 max-w-2xl mx-auto">
          Select an industrial fault scenario below. Watch the MEND-X retrieval augmented generation (RAG) pipeline rip through thousands of pages to extract the exact repair protocol.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scenario Selector */}
        <div className="flex flex-col gap-4">
          {CODE_SCENARIOS.map((scenario, idx) => (
            <button
              key={scenario.code}
              disabled={isSimulating}
              onClick={() => { setActiveScenario(idx); setStep(0); }}
              className={`text-left p-6 rounded-2xl glass border transition-all duration-300 ${activeScenario === idx ? 'border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'border-[var(--border)] hover:border-cyan-500/30 opacity-70 hover:opacity-100'} ${isSimulating ? 'cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {scenario.code}
                </span>
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {scenario.machine}
                </span>
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {scenario.desc}
              </p>
            </button>
          ))}
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="mt-4 w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex justify-center items-center gap-2"
          >
            {isSimulating ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : "Inject Fault"}
          </button>
        </div>

        {/* Terminal Output */}
        <div className="lg:col-span-2">
          <div className="h-full cyber-card bg-[#0a0a0a] dark:bg-[#0a0a0a] border border-slate-800 rounded-2xl overflow-hidden flex flex-col font-mono text-sm shadow-2xl relative">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#111] border-b border-slate-800">
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <span className="ml-2 text-[10px] text-slate-500 tracking-widest uppercase">MEND-X Diagnostic Trace Terminal</span>
            </div>

            {/* Terminal Body */}
            <div className="p-6 flex-1 text-cyan-400/90 leading-relaxed overflow-y-auto" style={{ textShadow: '0 0 5px rgba(34,211,238,0.3)' }}>
              {step > 0 && (
                <div className="mb-4">
                  <span className="text-rose-400 font-bold">[FAULT_DETECTED]</span> System received interrupt code <span className="text-white bg-rose-500/20 px-1 rounded">{CODE_SCENARIOS[activeScenario].code}</span> from {CODE_SCENARIOS[activeScenario].machine}.
                </div>
              )}

              {CODE_SCENARIOS[activeScenario].triage.map((t, i) => (
                <div key={i} className={`mb-2 transition-opacity duration-300 ${i < step ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  <span className="text-slate-500">{new Date().toISOString().split('T')[1].slice(0,-1)}</span> <span className="text-yellow-400 font-semibold">[RAG_PIPELINE]</span> {t}
                </div>
              ))}

              {step > CODE_SCENARIOS[activeScenario].triage.length && (
                <div className="mt-6 p-4 rounded bg-cyan-950/40 border border-cyan-800/50 animate-fade-in text-white/90">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="font-bold text-emerald-400 uppercase tracking-widest text-xs">Verified Repair Protocol</span>
                  </div>
                  <p className="text-[13px]">{CODE_SCENARIOS[activeScenario].resolution}</p>
                </div>
              )}

              {step > 0 && isSimulating && (
                <div className="mt-4 flex items-center gap-2 text-cyan-500/70">
                  <div className="w-2 h-4 bg-cyan-500 animate-pulse" />
                  <span className="text-xs blink">Fetching vectors...</span>
                </div>
              )}
            </div>

            <style dangerouslySetInnerHTML={{__html:`
              .blink { animation: blink 1s step-end infinite; }
              @keyframes blink { 50% { opacity: 0; } }
            `}}/>
          </div>
        </div>
      </div>
    </section>
  );
}

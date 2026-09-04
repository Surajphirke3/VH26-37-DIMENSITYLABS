"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  const [glitchActive, setGlitchActive] = useState(true);
  const [logs, setLogs] = useState<string[]>([
    "INITIALIZING KERNEL TELEMETRY TRACE...",
    "RESOLVING REQUESTED URI PATH IN VECTOR SPACE...",
    "WARN: NODE IDENTIFIER NOT INDEXED IN LOCAL OR EMBEDDED MEMORY",
    "FATAL_ERR 0x00000404: SECTOR_UNMAPPED_FAULT",
    "AUTOMATIC SAFEGUARD: SAFE STATE RESTORATION RECOMMENDED"
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setGlitchActive(prev => !prev);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#07080b] text-[#f1f5f9] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />
      <div className="absolute inset-0 scanline-overlay pointer-events-none opacity-40 z-20" />

      {/* Atmospheric glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Radar sweep line */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-20">
        <div 
          className="w-[600px] h-[600px] rounded-full border border-indigo-500/20 relative"
          style={{ animation: 'radarSweep 8s linear infinite' }}
        >
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-indigo-500/30 to-transparent rounded-tr-full origin-bottom-left" />
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-30 max-w-2xl w-full flex flex-col items-center text-center">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="font-mono text-xs text-red-400 font-bold uppercase tracking-widest">
            TELEMETRY DISCONNECTED // 404
          </span>
          <span className="text-white/20">|</span>
          <span className="font-mono text-xs text-slate-400">
            MEND-X OS v1.2.1
          </span>
        </div>

        {/* Glitch 404 Display */}
        <div className="relative my-2">
          <h1 
            className="text-8xl sm:text-9xl md:text-[11rem] font-black tracking-tighter leading-none glitch-text select-none text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500"
            data-text="404"
          >
            404
          </h1>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded text-red-400 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md whitespace-nowrap">
            [ INDUSTRIAL FAULT: MEMORY PAGE NOT FOUND ]
          </div>
        </div>

        {/* Description */}
        <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-lg mb-2">
          The requested coordinate or manual segment does not exist in vector space.
        </p>
        <p className="text-sm text-slate-400 max-w-md mb-8">
          The sensor telemetry link was interrupted or the document address has been decommissioned from the factory neural network.
        </p>

        {/* Simulated Machine HUD Terminal */}
        <div className="w-full bg-[#0e111a]/80 border border-white/10 rounded-xl p-4 mb-8 text-left shadow-2xl backdrop-blur-xl font-mono text-xs relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-[11px] text-slate-300 font-semibold">DIAGNOSTIC_CONSOLE.LOG</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
              ERR_CODE: 0x404
            </span>
          </div>

          <div className="space-y-1.5 text-slate-300">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-indigo-400 select-none">❯</span>
                <span className={log.includes("FATAL") || log.includes("WARN") ? "text-amber-400 font-semibold" : "text-slate-400"}>
                  {log}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold pt-1">
              <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse" />
              <span>AWAITING TECHNICIAN COMMAND INTERVENTION...</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm border border-indigo-400/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return to Command Center
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 text-sm backdrop-blur-md"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Diagnostic Console
          </Link>
        </div>

        {/* Hackathon & System Credit */}
        <div className="mt-12 flex flex-col items-center gap-1.5 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>DIMENSITY LABS [VH26-37]</span>
            <span>•</span>
            <span>VCET HACKATHON 2026</span>
          </div>
          <p className="text-[11px] text-slate-400">Autonomous Factory Intelligence • Zero Unverified Guidance</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface DemoScenario {
  id: string;
  machine: string;
  errorCode: string;
  symptom: string;
  confidence: number;
  manualCitation: string;
  pageNumber: number;
  safetyAlert: string;
  ppe: string[];
  steps: { title: string; detail: string }[];
  timeSaved: string;
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "haas-cnc",
    machine: "Haas VF-4 CNC Vertical Mill",
    errorCode: "ALARM 102 / SP-702",
    symptom: "Spindle axis overheat during continuous high-RPM roughing cycle. Thermal cutoff triggered.",
    confidence: 99.4,
    manualCitation: "Haas VF-Series Maintenance & Service Manual Rev. G",
    pageNumber: 84,
    safetyAlert: "CRITICAL: Spindle cartridge exceeds 85°C. Allow 20 minutes cooldown before physical inspection. Lockout/Tagout main disconnect.",
    ppe: ["Heat-resistant gloves", "Safety goggles", "Dielectric boots"],
    steps: [
      {
        title: "Verify Spindle Chiller Coolant Flow",
        detail: "Inspect reservoir level on rear coolant chiller. Ensure pressure gauge reads between 2.2 and 2.6 bar. Check for air cavitation in clear poly return line."
      },
      {
        title: "Clean Heat Exchanger Filter Grids",
        detail: "Slide out mesh intake filters on lower cabinet. Blow clean with 40 PSI compressed dry air from reverse direction to clear aluminum micro-chips."
      },
      {
        title: "Inspect Thermistor Ohm Resistance",
        detail: "Measure pins 4 & 5 on connector J8 at spindle head junction box. Normal ambient reading: 10.2 kΩ. If reading is open (>100 kΩ), replace thermal probe."
      }
    ],
    timeSaved: "4.5 hours manual search → 8 seconds"
  },
  {
    id: "siemens-s7",
    machine: "Siemens SIMATIC S7-1500 PLC",
    errorCode: "BF2 / PROFINET 0x80C4",
    symptom: "Bus Fault 2 active. Remote ET200SP I/O rack communication dropped abruptly mid-cycle.",
    confidence: 98.7,
    manualCitation: "Siemens S7-1500 Automation System Diagnostic Guide",
    pageNumber: 142,
    safetyAlert: "Line remains energized. Do not short 24V DC auxiliary bus bars during backplane inspection.",
    ppe: ["ESD wrist strap", "Safety glasses"],
    steps: [
      {
        title: "Inspect Port 1 Link LED Status",
        detail: "Check RJ45 green link LED on CPU 1515-2. If blinking orange at 2 Hz, physical link is degraded due to electromagnetic interference."
      },
      {
        title: "Validate Subnet Mask & Station Name",
        detail: "Use PRONETA diagnostic scanner to verify decentralized peripheral node 'ET200-STATION-03' matches hardware configuration topology."
      },
      {
        title: "Reseat FastConnect Industrial Cable",
        detail: "Replace damaged Cat6A shielded cable on Port 2. Ensure 360-degree shield clamp makes direct contact with DIN rail ground spring."
      }
    ],
    timeSaved: "3 hours tracing wiring → 12 seconds"
  },
  {
    id: "kuka-robot",
    machine: "KUKA KR 210 R2700 Industrial Arm",
    errorCode: "KSS 26014 / AXIS-4",
    symptom: "Axis 4 torque deviation exceeded threshold during high-speed palletizing reorientation.",
    confidence: 99.1,
    manualCitation: "KUKA KR C4 System Software & Mechanical Service Manual",
    pageNumber: 219,
    safetyAlert: "DANGER: Ensure safety fence interlock is engaged and Emergency Stop circuit is open before entering robot cell workspace.",
    ppe: ["Safety shoes with steel toe", "High-visibility vest", "Hard hat"],
    steps: [
      {
        title: "Inspect Mechanical Belt Tension",
        detail: "Remove Axis 4 side shroud. Measure toothed timing belt deflection at 15N perpendicular load; allowable deflection is 3.5mm ± 0.5mm."
      },
      {
        title: "Check Harmonic Drive Lubricant Level",
        detail: "Remove inspection plug M10. Check oil clarity for metallic slivers. If discolored dark bronze, flush and replenish with Syntheso QHT 220."
      },
      {
        title: "Perform Software Mastering Calibration",
        detail: "Attach EMD (Electronic Mastering Device) to Axis 4 gauge notch. Navigate to Teach Pendant > Start-up > Service > Position Check."
      }
    ],
    timeSaved: "6 hours engineering callout → 15 seconds"
  }
];

export default function LandingPage() {
  const [selectedDemo, setSelectedDemo] = useState<DemoScenario>(DEMO_SCENARIOS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#08090c] text-[#f1f5f9] relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* ─── Ambient Glowing Background Elements ───────────────── */}
      <div className="fixed inset-0 bg-grid opacity-25 pointer-events-none z-0" />
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 right-10 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-10 left-1/3 w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* ─── Sticky Cyber Header ───────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#08090c]/80 border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-lg shadow-indigo-600/30 group-hover:shadow-indigo-500/50 transition-all">
              <div className="w-full h-full bg-[#0d0f18] rounded-[10px] flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo-dark.png"
                  alt="MEND-X"
                  width={28}
                  height={28}
                  className="object-contain transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  MEND<span className="text-indigo-400 font-black">-X</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v1.1.1
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">
                From Failure to Function
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <a href="#problem" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.05] transition-colors">
              The Crisis
            </a>
            <a href="#simulator" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.05] transition-colors">
              Live Simulator
            </a>
            <a href="#how-it-works" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.05] transition-colors">
              Neural Pipeline
            </a>
            <a href="#features" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.05] transition-colors">
              Capabilities
            </a>
            <a href="#architecture" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.05] transition-colors">
              Architecture
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] text-emerald-300 font-semibold tracking-wide">
                SYSTEM OPERATIONAL
              </span>
            </div>

            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all backdrop-blur-sm"
            >
              Sign In
            </Link>

            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/30 transition-all border border-indigo-400/30 flex items-center gap-1.5"
            >
              <span>Console</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ──────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          {/* Hackathon Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="text-xs font-mono font-semibold text-indigo-300 tracking-wide">
              DIMENSITY LABS [VH26-37] • VCET HACKATHON 2026
            </span>
            <span className="text-white/20">|</span>
            <span className="text-xs font-mono text-slate-400">
              INDUSTRIAL RAG
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] max-w-5xl mb-6">
            FROM FAILURE <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
              TO FUNCTION.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl font-normal leading-relaxed mb-10">
            The Zero-Hallucination Industrial AI Diagnostic Engine.
            Turning thousands of pages of heavy machinery manuals into{" "}
            <span className="text-white font-semibold">
              instantaneous, page-verified repair protocols
            </span>{" "}
            for factory floor technicians.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all transform hover:-translate-y-0.5 border border-indigo-400/40 flex items-center justify-center gap-2.5"
            >
              <svg className="w-5 h-5 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Launch Live Diagnostic Terminal
            </Link>

            <a
              href="#simulator"
              className="w-full sm:w-auto px-7 py-4 rounded-xl text-sm font-semibold text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Interactive Simulator
            </a>
          </div>

          {/* Live Hero Telemetry Preview Card */}
          <div className="w-full max-w-4xl bg-[#0d1019]/90 border border-indigo-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden text-left glow-primary">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-xs text-slate-400 ml-2 font-medium">
                  MEND-X-TERMINAL // AUTOMATED RAG GROUNDING
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  VECTOR SYNC: 100%
                </span>
              </div>
            </div>

            {/* Query Line */}
            <div className="bg-black/40 border border-white/5 rounded-xl p-3.5 mb-4 font-mono text-xs flex items-center gap-3">
              <span className="text-indigo-400 font-bold">OPERATOR &gt;</span>
              <span className="text-slate-200">
                Machine: Haas VF-4 CNC | Alarm 102 &amp; Spindle Overheat. What is the immediate procedure?
              </span>
            </div>

            {/* AI Grounded Response Snippet */}
            <div className="bg-[#121522]/90 border border-indigo-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-xs text-white">MEND-X Autonomous Protocol</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
                    CONFIDENCE: 99.4%
                  </span>
                </div>
                <div className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/25">
                  SOURCE: Haas VF-Series Manual • Page 84
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2 font-medium">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>SAFETY HAZARD: High thermal hazard. Discharge coolant loop before unscrewing cartridge.</span>
              </div>

              <ol className="text-xs text-slate-300 space-y-2 pl-4 list-decimal marker:text-indigo-400 marker:font-bold">
                <li><strong className="text-white">Verify Spindle Chiller Flow:</strong> Check rear reservoir pressure gauge for 2.2–2.6 bar.</li>
                <li><strong className="text-white">Clear Aluminum Micro-Debris:</strong> Clean lower intake filter screens using 40 PSI compressed air.</li>
                <li><strong className="text-white">Calibrate Thermistor:</strong> Verify 10.2 kΩ across pins 4 &amp; 5 at J8 junction.</li>
              </ol>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/[0.06] text-center font-mono">
              <div className="p-2 rounded-lg bg-white/[0.02]">
                <div className="text-lg font-bold text-emerald-400">4.5h → 8s</div>
                <div className="text-[10px] text-slate-400 uppercase">Diagnosis Speed</div>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02]">
                <div className="text-lg font-bold text-indigo-400">100%</div>
                <div className="text-[10px] text-slate-400 uppercase">Citation Grounding</div>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02]">
                <div className="text-lg font-bold text-amber-400">Zero</div>
                <div className="text-[10px] text-slate-400 uppercase">Hallucinations</div>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02]">
                <div className="text-lg font-bold text-violet-400">$260K/hr</div>
                <div className="text-[10px] text-slate-400 uppercase">Downtime Prevented</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Problem Statement Section ─────────────────────────── */}
      <section id="problem" className="relative py-24 z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.08]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            The Industrial Crisis
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6">
            Why Modern Factories Still Lose Millions To Downtime
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Every minute an assembly line stops, automotive, aerospace, and precision manufacturing plants hemorrhage capital. The bottleneck is rarely the hardware—it is the speed of technical knowledge retrieval.
          </p>
        </div>

        {/* 3 Major Problem Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-red-500/20 bg-gradient-to-b from-[#14121a] to-[#0c0d14] relative group hover:border-red-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 text-red-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">$260,000 / Hour</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              According to Aberdeen Research, unplanned downtime costs heavy industrial plants an average of $260,000 every single hour. 70% of plants lack full visibility into equipment maintenance status.
            </p>
            <div className="text-xs font-mono text-red-400/80 bg-red-500/5 p-2.5 rounded border border-red-500/10">
              IMPACT: Crippled throughput &amp; missed delivery SLAs
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-amber-500/20 bg-gradient-to-b from-[#16141a] to-[#0c0d14] relative group hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">1,000-Page PDF Labyrinths</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Machinery manuals are dense, scattered across physical grease-stained binders or clunky PDF files on detached workstations. Technicians spend an average of 4.5 hours simply hunting for the right page.
            </p>
            <div className="text-xs font-mono text-amber-400/80 bg-amber-500/5 p-2.5 rounded border border-amber-500/10">
              BOTTLENECK: Alphanumeric codes with zero context
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-[#121422] to-[#0c0d14] relative group hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-6 text-indigo-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Hallucination Danger</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Standard generative chatbots fabricate nonexistent torque specs, incorrect wiring pins, or lethal maintenance instructions. In heavy industry, hallucination leads to catastrophic equipment fires or technician injury.
            </p>
            <div className="text-xs font-mono text-indigo-400/80 bg-indigo-500/5 p-2.5 rounded border border-indigo-500/10">
              SOLUTION: Strict RAG grounding &amp; mandatory citations
            </div>
          </div>
        </div>

        {/* Before vs After Comparison Card */}
        <div className="glass-elevated rounded-2xl p-6 sm:p-8 border border-white/[0.08] relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 w-full p-5 rounded-xl bg-red-950/20 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3 text-red-400 font-bold text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>TRADITIONAL FACTORY FLOOR</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-2.5 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Machine halts abruptly; error code displays &quot;E-502&quot; without explanation.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Technician searches dusty filing cabinets or 800-page unindexed PDF.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Trial-and-error component replacement damages sensitive servo axes.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Average downtime: 4 to 8 hours. Loss: $500,000+.
                </li>
              </ul>
            </div>

            <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center flex-shrink-0 text-indigo-300 font-bold text-xs">
              VS
            </div>

            <div className="flex-1 w-full p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>WITH MEND-X NEURAL PROTOCOL</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2.5 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Technician types symptom or error code on any mobile or desktop device.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  MEND-X retrieves vector-matched chunk from OEM manual in &lt;800ms.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Step-by-step verified instructions, PPE warnings, and exact page citations.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Resolution in minutes. Production line back online immediately.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Live Simulator Section ────────────────── */}
      <section id="simulator" className="relative py-24 z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.08]">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Interactive Fault Simulator
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Test The Diagnostic Engine In Action
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Select a critical factory machinery failure below to see how MEND-X indexes, evaluates, and synthesizes verifiable repair procedures in real time.
          </p>
        </div>

        {/* Machine Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {DEMO_SCENARIOS.map((demo) => {
            const isActive = selectedDemo.id === demo.id;
            return (
              <button
                key={demo.id}
                onClick={() => setSelectedDemo(demo)}
                className={`px-5 py-3 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center gap-2.5 border ${
                  isActive
                    ? "bg-indigo-600/20 text-white border-indigo-500/50 shadow-lg shadow-indigo-600/20 glow-sm"
                    : "bg-white/[0.03] text-slate-400 border-white/[0.08] hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? "bg-indigo-400 animate-pulse" : "bg-slate-600"}`} />
                <span className="font-semibold">{demo.machine}</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/40 text-slate-300">
                  {demo.errorCode}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Active Simulator Display Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl relative overflow-hidden">
          {/* Machine Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-white">{selectedDemo.machine}</h3>
                <span className="px-2.5 py-0.5 rounded font-mono text-xs bg-red-500/20 text-red-300 border border-red-500/30">
                  {selectedDemo.errorCode}
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm">
                Symptom: <span className="text-slate-200">{selectedDemo.symptom}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="text-right">
                <div className="text-[11px] text-slate-400 font-mono uppercase">Grounding Match</div>
                <div className="text-lg font-mono font-bold text-emerald-400">
                  {selectedDemo.confidence}%
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Safety Hazard Banner */}
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{selectedDemo.safetyAlert}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 uppercase font-mono mr-1">Required PPE:</span>
              {selectedDemo.ppe.map((item, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/20">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Step-by-Step Interactive Protocol */}
          <div className="mb-6">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Step-by-Step Verified Remediation Procedure
            </h4>
            <div className="space-y-3">
              {selectedDemo.steps.map((step, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/30 transition-all flex items-start gap-3.5">
                  <div className="step-badge">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white mb-1">
                      {step.title}
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citation & Grounding Proof */}
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-indigo-300">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{selectedDemo.manualCitation}</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-white font-bold border border-indigo-500/40">
                Page {selectedDemo.pageNumber}
              </span>
            </div>
            <div className="text-emerald-400 font-semibold">
              ⚡ {selectedDemo.timeSaved}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Neural Architecture & How It Works ─────────────────── */}
      <section id="how-it-works" className="relative py-24 z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.08]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 font-mono text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            Neural RAG Architecture
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            How MEND-X Eliminates Hallucinations
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Generic LLMs guess. MEND-X anchors every token to OEM engineering manuals through a four-stage neural pipeline designed for high-consequence industrial facilities.
          </p>
        </div>

        {/* 4 Pipeline Stages */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="glass-card p-6 rounded-2xl border border-white/[0.08] relative group hover:border-indigo-500/40 transition-all">
            <div className="font-mono text-3xl font-black text-indigo-500/40 mb-3">01</div>
            <h3 className="text-base font-bold text-white mb-2">Multimodal PDF Ingestion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Industrial manuals are extracted with PyMuPDF, preserving table structures, wiring schematics, error code indexes, and torque specifications.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/[0.08] relative group hover:border-violet-500/40 transition-all">
            <div className="font-mono text-3xl font-black text-violet-500/40 mb-3">02</div>
            <h3 className="text-base font-bold text-white mb-2">pgvector Embeddings</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hierarchical semantic chunking creates dense dimensional embeddings stored in PostgreSQL pgvector, indexing mechanical terminology and acronyms.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/[0.08] relative group hover:border-emerald-500/40 transition-all">
            <div className="font-mono text-3xl font-black text-emerald-500/40 mb-3">03</div>
            <h3 className="text-base font-bold text-white mb-2">Disambiguation Filter</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When symptoms are ambiguous across multiple machine series, the engine triggers conversational clarification rather than making unverified guesses.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/[0.08] relative group hover:border-cyan-500/40 transition-all">
            <div className="font-mono text-3xl font-black text-cyan-500/40 mb-3">04</div>
            <h3 className="text-base font-bold text-white mb-2">Strict Grounded Synthesis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The LLM is strictly constrained to the retrieved context chunks. If information is not in the manual, it issues an explicit safe refusal.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Core Capabilities Matrix ──────────────────────────── */}
      <section id="features" className="relative py-24 z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.08]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider mb-4">
            Industrial Grade
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Engineered For The Shop Floor
          </h2>
          <p className="text-slate-400 text-base">
            Every feature is built around the high-pressure needs of maintenance supervisors, robotics engineers, and line technicians.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/[0.08] hover:border-indigo-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center mb-4 text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-white mb-2">Zero-Hallucination Safe Guard</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an OEM manual does not contain an explicit resolution for a queried fault code, MEND-X generates a refusal rather than extrapolating.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/[0.08] hover:border-violet-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center mb-4 text-violet-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-white mb-2">Exact Page Citations</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every procedure displays the exact manual name, chapter, and page number with clickable reference snippets for full audit compliance.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/[0.08] hover:border-emerald-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-4 text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-white mb-2">Sub-Second Vector Search</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Optimized pgvector cosine similarity search retrieves the top relevant chunks in under 350 milliseconds across millions of indexed manual tokens.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/[0.08] hover:border-amber-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mb-4 text-amber-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-white mb-2">Safety Hazard Alerting</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatically flags high-voltage, hydraulic pressure, toxic coolant, or pinch-point hazards before showing mechanical steps.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/[0.08] hover:border-blue-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center mb-4 text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-white mb-2">Multi-Machine Fleet Support</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Index and segment manuals for Haas CNCs, Siemens PLCs, KUKA robotics, injection molders, and hydraulic presses under one unified tenant.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/[0.08] hover:border-teal-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center mb-4 text-teal-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-white mb-2">Disambiguation Questions</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an error code matches multiple sub-assemblies (e.g. pneumatic vs hydraulic), MEND-X prompts the operator with options to pinpoint root cause.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Tech Stack & Hackathon Credentials ─────────────────── */}
      <section id="architecture" className="relative py-24 z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.08]">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-white/[0.1] bg-gradient-to-b from-[#10121d] via-[#0b0d14] to-[#07080b] relative overflow-hidden">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
              ENTERPRISE INDUSTRIAL STACK
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
              Built On Modern, Resilient Architecture
            </h3>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Engineered from the ground up for high reliability, fast response times, and strict data isolation on modern production networks.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <div className="font-mono text-base font-bold text-white mb-1">Next.js 16</div>
              <div className="text-[11px] text-slate-400">React Server &amp; Client</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <div className="font-mono text-base font-bold text-white mb-1">FastAPI</div>
              <div className="text-[11px] text-slate-400">Async Python Backend</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <div className="font-mono text-base font-bold text-white mb-1">pgvector</div>
              <div className="text-[11px] text-slate-400">Vector Embeddings</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <div className="font-mono text-base font-bold text-white mb-1">OpenRouter</div>
              <div className="text-[11px] text-slate-400">Grounded LLMs</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <div className="font-mono text-base font-bold text-white mb-1">PyMuPDF</div>
              <div className="text-[11px] text-slate-400">OCR &amp; Chunking</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <div className="font-mono text-base font-bold text-white mb-1">Tailwind CSS</div>
              <div className="text-[11px] text-slate-400">Dark Glassmorphism</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA Banner ──────────────────────────────────── */}
      <section className="relative py-20 z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="relative p-10 sm:p-16 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-violet-900/30 to-indigo-950/40 border border-indigo-500/30 shadow-2xl backdrop-blur-2xl overflow-hidden glow-primary">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Eliminate Factory Downtime Today
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Access the diagnostic console now to upload your machine manuals and start resolving complex faults in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 border border-indigo-400/40 flex items-center justify-center gap-2"
            >
              <span>Launch Terminal Console</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-semibold text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 transition-all flex items-center justify-center"
            >
              Technician Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#06070a] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5">
              <div className="w-full h-full bg-[#0d0f18] rounded-[6px] flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo-dark.png"
                  alt="MEND-X"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-sm text-white">MEND-X</span>
              <p className="text-[11px] text-slate-400 font-mono">From Failure to Function</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-400 font-mono text-center">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>DIMENSITY LABS [VH26-37]</span>
            </div>
            <span className="hidden sm:inline text-white/20">•</span>
            <span>VCET NATIONAL HACKATHON 2026</span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span>RAG GROUNDED INDUSTRIAL AI</span>
          </div>

          <div className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} MEND-X. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

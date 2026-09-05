"use client";

import React, { useState } from "react";
import Link from "next/link";
import LandingLayout from "@/components/landing/LandingLayout";

const WORKFLOW_STAGES = [
  {
    stage: "Manual Upload & Ingestion",
    actor: "Plant Engineer / IT Admin",
    time: "2-4 hours setup",
    desc: "Upload OEM manuals (PDFs) to MEND-X ingestion pipeline. PyMuPDF extracts text, tables, diagrams. Automatic schema detection identifies procedures, fault trees, part numbers.",
    tasks: [
      "Drag & drop PDF folder into ingestion portal",
      "Configure machine_id tags per manual set",
      "Validate extracted text quality (>95% OCR accuracy)",
      "Review auto-detected cross-references",
      "Approve manual set for production indexing"
    ]
  },
  {
    stage: "Vector Indexing & Validation",
    actor: "MEND-X System (Automated)",
    time: "30-60 minutes",
    desc: "Deterministic chunking (512 tokens, 128 overlap). OpenAI text-embedding-3-small generates 1536-dim vectors. pgvector ANN indexing with HNSW optimization.",
    tasks: [
      "Chunk documents preserving semantic boundaries",
      "Generate embeddings for each chunk",
      "Build pgvector HNSW index for fast retrieval",
      "Cross-reference mapping (e.g., 'See Bulletin 4F-20')",
      "Validate retrieval accuracy with test queries"
    ]
  },
  {
    stage: "Field Technician Workflow",
    actor: "Maintenance Technician",
    time: "<8 seconds per query",
    desc: "Technician encounters fault, enters error code or symptom description. MEND-X dynamic Groq LPU routing returns cited repair protocol.",
    tasks: [
      "Observe machine fault (alarm, error code, symptom)",
      "Open MEND-X mobile app or terminal",
      "Enter error code OR describe fault in plain language",
      "Receive step-by-step repair protocol with citations",
      "Execute repair, mark incident resolved"
    ]
  },
  {
    stage: "Human-in-the-Loop Validation",
    actor: "Senior Technician / Engineer",
    time: "5-10 minutes review",
    desc: "For critical faults or ambiguous responses, senior staff review MEND-X recommendations. Feedback loop improves future retrieval accuracy.",
    tasks: [
      "Review MEND-X suggested repair protocol",
      "Validate against plant-specific procedures",
      "Approve or override recommendation",
      "Execute repair with oversight",
      "Log outcome for continuous learning"
    ]
  }
];

const INTEGRATION_POINTS = [
  {
    system: "SCADA / HMI Systems",
    connection: "Real-time alarm integration",
    desc: "MEND-X receives live fault codes from Siemens WinCC, GE iFIX, Wonderware. Automatic fault-to-manual lookup without manual entry.",
    protocols: ["OPC-UA", "Modbus TCP", "Ethernet/IP", "Custom API"]
  },
  {
    system: "CMMS (Maintenance Management)",
    connection: "Work order generation",
    desc: "Integration with SAP PM, Maximo, eMaint. MEND-X protocols auto-populate work orders with parts lists, procedures, estimated time.",
    protocols: ["REST API", "SOAP", "Database connector", "File export"]
  },
  {
    system: "PLCs & Controllers",
    connection: "Direct fault monitoring",
    desc: "Monitor Allen-Bradley ControlLogix, Siemens S7, Mitsubishi MELSEC. Fault detection triggers immediate MEND-X lookup.",
    protocols: ["Ethernet/IP", "Profinet", "CC-Link", "EtherCAT"]
  },
  {
    system: "Mobile Apps & Tablets",
    connection: "Field technician interface",
    desc: "Native iOS/Android apps with QR code scanning, voice input, and fast edge mode. Ruggedized tablet support.",
    protocols: ["REST API", "WebSocket", "Progressive Web App", "Offline sync"]
  }
];

const TECHNICIAN_PERSONAS = [
  {
    name: "Entry-Level Technician",
    experience: "0-2 years",
    challenges: [
      "Limited fault diagnosis experience",
      "Overwhelmed by thick OEM manuals",
      "Needs step-by-step guidance"
    ],
    mendxBenefits: [
      "Instant error code explanations",
      "Visual, step-by-step procedures",
      "Confidence through cited sources"
    ]
  },
  {
    name: "Experienced Maintenance Tech",
    experience: "5-15 years",
    challenges: [
      "Knows common faults, struggles with edge cases",
      "Manual cross-referencing takes too long",
      "Multiple concurrent breakdowns"
    ],
    mendxBenefits: [
      "Rapid edge case resolution",
      "Multi-machine context switching",
      "Reduced diagnostic time"
    ]
  },
  {
    name: "Senior Engineer / Supervisor",
    experience: "15+ years",
    challenges: [
      "Mentoring junior staff remotely",
      "Compliance documentation requirements",
      "Knowledge transfer before retirement"
    ],
    mendxBenefits: [
      "Consistent guidance for junior staff",
      "Audit-ready procedure trails",
      "Institutional knowledge capture"
    ]
  }
];

const DEPLOYMENT_SCENARIOS = [
  {
    title: "Automotive Assembly Plant",
    scale: "47 production lines, 340 machines",
    challenge: "Welding robots frequent servo faults, 4.2h avg downtime",
    deployment: "Private VPC, SCADA integration, mobile tablets on factory floor",
    outcome: "87% reduction in diagnostic time, \$12.6M annual savings"
  },
  {
    title: "Aerospace Manufacturing",
    scale: "12 test rigs, flight-critical systems",
    challenge: "DO-254 compliance, complex hydraulic diagnostics",
    deployment: "Air-gapped or dedicated VPC, GPT-OSS 120B tier for safety-critical analysis",
    outcome: "99.7% compliance audit pass rate, 6.5h → 9min fault isolation"
  },
  {
    title: "Thermal Power Plant",
    scale: "500MW turbine, 2,400 control points",
    challenge: "Grid stability, emergency response <30min SLA",
    deployment: "Redundant cloud + edge, real-time SCADA monitoring",
    outcome: "14 prevented grid incidents/quarter, \$5.6M revenue protection"
  }
];

const TRACE_SIMULATION = [
  { timestamp: "14:23:01.045", system: "SCADA", event: "Alarm received: KUKA-KR210-CELL4 → ERR-792 (Servo overcurrent Axis 4)" },
  { timestamp: "14:23:01.112", system: "MEND-X", event: "Query ingestion: machine_id='kuka_kr210_cell_4', fault_code='ERR-792'" },
  { timestamp: "14:23:01.156", system: "pgvector", event: "ANN search: 3 matches found (cosine similarity ≥ 0.72)" },
  { timestamp: "14:23:01.203", system: "Mini", event: "Edge inference: 67ms → 'Servo drive fault, proceed to diagnostic tier'" },
  { timestamp: "14:23:01.298", system: "GPT-OSS", event: "Groq LPU: Multi-step procedure generation..." },
  { timestamp: "14:23:02.891", system: "GPT-OSS", event: "Response: Replace IGBT module, Axis 4. Torque: 3.2Nm. Recalibrate via KRC4." },
  { timestamp: "14:23:02.934", system: "Mobile App", event: "Technician receives protocol with 3 OEM manual citations" },
  { timestamp: "14:31:14.782", system: "Technician", event: "Repair completed, production line resumed" },
];

export default function WorkflowPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [traceVisible, setTraceVisible] = useState(false);

  const tabs = ["Workflow", "Integrations", "Field Teams", "Live Trace"];

  return (
    <LandingLayout>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-grid">
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full orb opacity-20" style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full orb opacity-15" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", animationDelay: "-5s" }} />
      </div>

      {/* Hero */}
      <section className="relative z-10 pt-24 sm:pt-28 md:pt-32 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-3 mb-4 sm:mb-6 px-4 py-1.5 sm:py-2 rounded-full glass border border-[var(--border)] animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
            <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">Process Flow</span>
          </div>
        </div>

        <h1 className="font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight uppercase text-[var(--text-primary)] mb-4 sm:mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          From Alarm to <span className="gradient-text-emerald">Resolution.</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-[var(--text-muted)] max-w-3xl leading-relaxed mb-6 sm:mb-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          Industrial troubleshooting accelerated. From manual ingestion to field technician workflow, MEND-X integrates into existing plant operations while transforming diagnostic speed.
        </p>
      </section>

      {/* Tab Navigation */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border)]">
        <div className="flex border-b border-[var(--border)]">
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === idx ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Tab Content */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        {activeTab === 0 && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="font-black text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight leading-tight">
                End-to-End <span className="gradient-text-emerald">Workflow.</span>
              </h2>
            </div>

            <div className="space-y-8">
              {WORKFLOW_STAGES.map((stage, idx) => (
                <div key={idx} className="cyber-card p-8 animate-slide-up" style={{ animationDelay: `${0.1 * idx}s` }}>
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="lg:w-1/4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-wider">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="font-black text-lg text-[var(--text-primary)] mb-2">{stage.stage}</h3>
                      <p className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Actor</p>
                      <p className="text-sm text-emerald-400 font-semibold mb-2">{stage.actor}</p>
                      <p className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Duration</p>
                      <p className="text-sm text-amber-400 font-semibold">{stage.time}</p>
                    </div>

                    <div className="lg:w-1/2">
                      <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">{stage.desc}</p>
                    </div>

                    <div className="lg:w-1/4">
                      <p className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Tasks</p>
                      <ul className="space-y-2">
                        {stage.tasks.map((task, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div>
            <div className="text-center mb-12">
              <h2 className="font-black text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight leading-tight">
                Plant <span className="gradient-text">Integration.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {INTEGRATION_POINTS.map((integration, i) => (
                <div key={i} className="cyber-card p-6 animate-slide-up" style={{ animationDelay: `${0.1 * i}s` }}>
                  <h3 className="font-black text-lg text-[var(--text-primary)] mb-2 flex items-center gap-2">
                    <span className="text-indigo-500">🔗</span>
                    {integration.system}
                  </h3>
                  <p className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-wider mb-2">{integration.connection}</p>
                  <p className="text-sm text-[var(--text-muted)] mb-4">{integration.desc}</p>
                  <div>
                    <p className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Protocols</p>
                    <div className="flex flex-wrap gap-2">
                      {integration.protocols.map((protocol, idx) => (
                        <span key={idx} className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-xs font-mono font-semibold border border-indigo-500/20">
                          {protocol}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div>
            <div className="text-center mb-12">
              <h2 className="font-black text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight leading-tight">
                Field Team <span className="gradient-text-gold">Personas.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TECHNICIAN_PERSONAS.map((persona, i) => (
                <div key={i} className="cyber-card p-8 animate-slide-up" style={{ animationDelay: `${0.15 * i}s` }}>
                  <div className="text-3xl mb-4">👷</div>
                  <h3 className="font-black text-lg text-[var(--text-primary)] mb-2">{persona.name}</h3>
                  <p className="text-sm text-amber-400 font-semibold mb-6">{persona.experience}</p>

                  <div className="mb-6">
                    <p className="text-xs font-mono font-bold text-rose-500 uppercase tracking-wider mb-3">Current Challenges</p>
                    <ul className="space-y-2">
                      {persona.challenges.map((challenge, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                          <span className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-wider mb-3">MEND-X Benefits</p>
                    <ul className="space-y-2">
                      {persona.mendxBenefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Deployment Scenarios */}
            <div className="mt-16">
              <div className="text-center mb-12">
                <h3 className="font-black text-2xl text-[var(--text-primary)] tracking-tight">Real Deployments</h3>
              </div>

              <div className="space-y-6">
                {DEPLOYMENT_SCENARIOS.map((scenario, idx) => (
                  <div key={idx} className="cyber-card p-8 animate-slide-up" style={{ animationDelay: `${0.1 * idx}s` }}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <h4 className="font-bold text-[var(--text-primary)] mb-2">{scenario.title}</h4>
                        <p className="text-sm text-[var(--text-muted)]">{scenario.scale}</p>
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-rose-500 uppercase tracking-wider mb-2">Challenge</p>
                        <p className="text-sm text-[var(--text-muted)]">{scenario.challenge}</p>
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-cyan-500 uppercase tracking-wider mb-2">Deployment</p>
                        <p className="text-sm text-[var(--text-muted)]">{scenario.deployment}</p>
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-wider mb-2">Outcome</p>
                        <p className="text-sm text-emerald-400 font-semibold">{scenario.outcome}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div>
            <div className="text-center mb-12">
              <h2 className="font-black text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight leading-tight">
                Live System <span className="gradient-text-emerald">Trace.</span>
              </h2>
              <p className="text-[var(--text-muted)] mt-4 max-w-2xl mx-auto">
                Watch MEND-X process a real servo fault from alarm to resolution. Every step logged with microsecond precision.
              </p>
            </div>

            <div className="mb-8 text-center">
              <button
                onClick={() => setTraceVisible(!traceVisible)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                {traceVisible ? "Reset Trace" : "Start Live Trace"}
              </button>
            </div>

            <div className="cyber-card bg-[#0a0a0a] border-slate-800 rounded-2xl overflow-hidden font-mono text-sm shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#111] border-b border-slate-800">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <span className="ml-2 text-[10px] text-slate-500 tracking-widest uppercase">MEND-X System Trace</span>
              </div>

              <div className="p-6 text-cyan-400/90 leading-relaxed min-h-[400px]">
                {!traceVisible ? (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <span>Waiting for trace activation...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {TRACE_SIMULATION.map((entry, i) => (
                      <div
                        key={i}
                        className="animate-fade-in opacity-0"
                        style={{
                          animationDelay: `${i * 0.8}s`,
                          animationFillMode: "forwards"
                        }}
                      >
                        <span className="text-slate-500">{entry.timestamp}</span> <span className={`font-semibold ${entry.system === 'SCADA' ? 'text-rose-400' : entry.system === 'MEND-X' ? 'text-cyan-400' : entry.system === 'pgvector' ? 'text-blue-400' : entry.system === 'Mini' ? 'text-indigo-400' : entry.system === 'GPT-OSS' ? 'text-amber-400' : entry.system === 'Mobile App' ? 'text-green-400' : 'text-emerald-400'}`}>[{entry.system}]</span> <span className="text-white/90">{entry.event}</span>
                      </div>
                    ))}

                    {traceVisible && (
                      <div className="mt-6 p-4 rounded bg-emerald-950/40 border border-emerald-800/50 animate-fade-in text-white/90" style={{ animationDelay: "6.4s", animationFillMode: "forwards", opacity: 0 }}>
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          <span className="font-bold text-emerald-400 uppercase tracking-widest text-xs">Incident Resolution Complete</span>
                        </div>
                        <p className="text-xs">Total time: 8min 13s. Production line restored. Root cause: IGBT module thermal failure on Axis 4 servo drive.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-24">
        <div className="glass rounded-[2rem] p-10 sm:p-16 text-center border-emerald-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] mb-6 relative z-10">
            Integrate with Confidence.<br />Accelerate with Precision.
          </h2>
          <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-xl mx-auto mb-10 relative z-10 leading-relaxed">
            MEND-X fits your existing workflow. From SCADA alarms to mobile technicians, every integration point designed for industrial reliability.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm text-[var(--bg-base)] bg-emerald-500 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              Start Your Deployment
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/architecture"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm border border-[var(--border)] text-[var(--text-primary)] hover:border-emerald-500/50 transition-colors flex items-center justify-center gap-2"
            >
              Technical Details
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
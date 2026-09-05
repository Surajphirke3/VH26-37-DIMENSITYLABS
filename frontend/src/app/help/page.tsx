"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  BookOpen,
  AlertTriangle,
  Zap,
  Cpu,
  Search,
  Camera,
  Languages,
  FileText,
  Keyboard,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import LandingLayout from "@/components/landing/LandingLayout";

export default function HelpPage() {
  const [alarmSearch, setAlarmSearch] = useState("");

  const alarmCodes = [
    {
      code: "E-04 / 104",
      system: "Spindle Drive",
      title: "Spindle Overload / Thermal Trip",
      cause: "High cut load, dull tooling, axis mechanical binding, or thermal sensor fault.",
      immediateAction: "Halt cycle immediately. Check coolant flow, measure motor thermals with IR thermometer. Inspect spindle belt tension.",
    },
    {
      code: "AL-24",
      system: "Fanuc Alpha Drive",
      title: "Pulse Coder Disconnection",
      cause: "Broken feedback cable, loose pin connector, or optical encoder disk contamination.",
      immediateAction: "Power off main breaker. Inspect JF1 connector pins. Check continuity of pulse wires A/B/Z channels.",
    },
    {
      code: "F30002",
      system: "Siemens Sinamics S120",
      title: "DC Link Overvoltage",
      cause: "Rapid braking regeneration without braking resistor or supply voltage surge.",
      immediateAction: "Verify braking chopper resistor resistance. Check deceleration ramp-down rate (p1135).",
    },
    {
      code: "HYD-LOW-01",
      system: "Hydraulic Power Unit",
      title: "Low System Pressure Interlock",
      cause: "Clogged suction strainer, worn gear pump, or proportional relief valve stuck open.",
      immediateAction: "Verify tank oil level sight glass. Check differential pressure gauge across suction filter. Inspect pressure switch relay.",
    },
    {
      code: "AXIS-LAG-08",
      system: "Motion Controller",
      title: "Following Error / Position Lag Exceeded",
      cause: "Way lube starvation, ball nut backlash, or servo tuning gain discrepancy.",
      immediateAction: "Inspect automatic grease injector reservoir. Manually jog axis to verify mechanical free movement.",
    },
    {
      code: "EMERG-STOP-00",
      system: "Safety Circuit",
      title: "Emergency Stop Chain Open",
      cause: "Depressed E-stop mushroom switch, safety gate interlock tripped, or blown 24V fuse.",
      immediateAction: "Inspect all physical safety boundary gates and E-stop pushbuttons. Verify dual-channel safety relay LEDs (K1/K2).",
    },
  ];

  const filteredAlarms = alarmCodes.filter(
    (a) =>
      a.code.toLowerCase().includes(alarmSearch.toLowerCase()) ||
      a.system.toLowerCase().includes(alarmSearch.toLowerCase()) ||
      a.title.toLowerCase().includes(alarmSearch.toLowerCase()) ||
      a.cause.toLowerCase().includes(alarmSearch.toLowerCase())
  );

  return (
    <LandingLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Industrial Field Reference</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
            Operator Handbook & Alarm Index
          </h1>
          <p className="mt-2 text-base text-muted-foreground max-w-3xl">
            Standard operating procedures, common industrial alarm code resolutions, multimodal image capture best practices, and emergency protocols.
          </p>
        </div>

        {/* LOTO Warning Banner */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 mb-10 flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-red-500 text-sm mb-1 uppercase tracking-wide">
              Mandatory OSHA Lockout / Tagout (LOTO) Compliance
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              Always isolate electrical disconnects, dissipate residual hydraulic/pneumatic stored energy, and attach personal lockout hasps before opening machine enclosure cabinets or conducting mechanical interventions. MEND - X provides diagnostic intelligence but does not replace qualified plant safety protocols.
            </p>
          </div>
        </div>

        {/* Quick Guide Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Asking Effective Questions */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500 mb-4">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground mb-2">Effective Diagnostic Prompts</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              For fastest resolution, specify the machine model, alarm code or symptom, and what operation was running when the fault tripped:
            </p>
            <div className="bg-background border border-border rounded p-3 text-[11px] font-mono text-muted-foreground">
              &quot;Haas VF-2 alarm 104 during spindle start. Spindle makes humming sound then trips after 3 seconds.&quot;
            </div>
          </div>

          {/* Card 2: Multimodal Camera Inspection */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-500 mb-4">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground mb-2">Visual Inspection Uploads</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Upload photos of warning display panels, fractured tool bits, hydraulic leaks, or wiring junction boxes. The Groq Vision model will identify:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Seven-segment and LED indicator states</li>
              <li>Visible thermal burns or mechanical galling</li>
              <li>Nameplate serial and rating specifications</li>
            </ul>
          </div>

          {/* Card 3: Multilingual Voice & Text */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500 mb-4">
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground mb-2">Multilingual Plant Support</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Operators can submit queries in English, Hindi, Marathi, Gujarati, Tamil, Telugu, Kannada, or Bengali. The assistant will respond natively:
            </p>
            <div className="bg-background border border-border rounded p-3 text-[11px] font-mono text-muted-foreground">
              &quot;मशीन का हाइड्रोलिक प्रेशर कम हो रहा है, क्या चेक करें?&quot;
            </div>
          </div>
        </div>

        {/* Alarm Code Cheat-Sheet */}
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Quick Diagnostic Lookup</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">Common Alarm Code Index</h2>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={alarmSearch}
                onChange={(e) => setAlarmSearch(e.target.value)}
                placeholder="Filter by code or system..."
                className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/50 text-muted-foreground font-semibold uppercase tracking-wider text-[11px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">Alarm Code</th>
                  <th className="py-3 px-4">Subsystem</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Root Cause</th>
                  <th className="py-3 px-4">Immediate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAlarms.map((a, idx) => (
                  <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-500 whitespace-nowrap">
                      {a.code}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-secondary text-foreground text-[11px]">
                        {a.system}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">{a.title}</td>
                    <td className="py-3.5 px-4 text-muted-foreground max-w-xs">{a.cause}</td>
                    <td className="py-3.5 px-4 text-foreground leading-relaxed max-w-sm">
                      {a.immediateAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Keyboard className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-foreground">Keyboard Shortcuts & Navigation</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-background border border-border rounded-lg flex items-center justify-between">
              <span className="text-muted-foreground">Send Message</span>
              <kbd className="px-2 py-1 bg-secondary border border-border rounded text-[11px] font-mono font-bold">
                Enter
              </kbd>
            </div>

            <div className="p-3 bg-background border border-border rounded-lg flex items-center justify-between">
              <span className="text-muted-foreground">Multi-line Break</span>
              <kbd className="px-2 py-1 bg-secondary border border-border rounded text-[11px] font-mono font-bold">
                Shift + Enter
              </kbd>
            </div>

            <div className="p-3 bg-background border border-border rounded-lg flex items-center justify-between">
              <span className="text-muted-foreground">Global Search</span>
              <kbd className="px-2 py-1 bg-secondary border border-border rounded text-[11px] font-mono font-bold">
                /
              </kbd>
            </div>

            <div className="p-3 bg-background border border-border rounded-lg flex items-center justify-between">
              <span className="text-muted-foreground">Close Inspector</span>
              <kbd className="px-2 py-1 bg-secondary border border-border rounded text-[11px] font-mono font-bold">
                Esc
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}

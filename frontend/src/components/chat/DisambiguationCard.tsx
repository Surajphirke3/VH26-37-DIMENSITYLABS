"use client";

import type { DisambiguationOption } from "@/lib/types";

interface DisambiguationCardProps {
  options: DisambiguationOption[];
  onSelect: (machineId: string) => void;
}

export default function DisambiguationCard({ options, onSelect }: DisambiguationCardProps) {
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-semibold text-indigo-900">Multiple Machines Match This Error</p>
      </div>
      <p className="text-sm text-indigo-800">
        This error code appears in manuals for multiple machines. Which machine are you troubleshooting?
      </p>

      <div className="space-y-2">
        {options.map((opt) => (
          <div
            key={opt.machine_id}
            className="bg-white rounded-lg border border-indigo-100 p-3 flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">{opt.machine_name}</p>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{opt.snippet}</p>
            </div>
            <button
              onClick={() => onSelect(opt.machine_id)}
              className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white
                text-xs font-medium rounded-lg transition-colors"
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getManuals, getMachines } from "@/lib/api";
import type { Manual, Machine } from "@/lib/types";
import ManualList from "@/components/admin/ManualList";
import Spinner from "@/components/ui/Spinner";

type Tab = "manuals" | "machines";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("manuals");
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  const loadData = async () => {
    setFetching(true);
    try {
      const [m, mac] = await Promise.all([getManuals(), getMachines()]);
      setManuals(m);
      setMachines(mac);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") loadData();
  }, [user]);

  if (isLoading || fetching) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" label="Loading..." /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")}
            className="text-slate-400 hover:text-slate-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-slate-800">Admin Panel</h1>
        </div>
        <button onClick={() => router.push("/admin/manuals/upload")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
          Upload Manual
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 mb-6">
          {(["manuals", "machines"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px
                ${tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {t}
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {t === "manuals" ? manuals.length : machines.length}
              </span>
            </button>
          ))}
        </div>

        {tab === "manuals" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <ManualList manuals={manuals} onRefresh={loadData} />
          </div>
        )}

        {tab === "machines" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            {machines.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">No machines registered.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {machines.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                      <p className="text-xs text-slate-400">{[m.manufacturer, m.model].filter(Boolean).join(" · ")}</p>
                    </div>
                    {m.category && (
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">{m.category}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

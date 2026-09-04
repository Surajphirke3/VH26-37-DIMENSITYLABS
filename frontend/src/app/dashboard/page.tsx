"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getMachines, createConversation } from "@/lib/api";
import type { Machine } from "@/lib/types";
import MachineSelector from "@/components/chat/MachineSelector";
import ChatInterface from "@/components/chat/ChatInterface";
import Spinner from "@/components/ui/Spinner";

interface ConvEntry { id: string; label: string; }

const GEAR_PATH = "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z";

export default function DashboardPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [conversations, setConversations] = useState<ConvEntry[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  useEffect(() => { if (!authLoading && !user) router.replace("/login"); }, [user, authLoading, router]);
  useEffect(() => { if (user) getMachines().then(setMachines).catch(console.error); }, [user]);

  const startNewConversation = async (): Promise<string | null> => {
    try {
      const conv = await createConversation();
      const label = `Session ${conversations.length + 1}`;
      setConversations((prev) => [...prev, { id: conv.conversation_id, label }]);
      setActiveConvId(conv.conversation_id);
      return conv.conversation_id;
    } catch (err) { console.error("Failed to create conversation", err); return null; }
  };

  const handleFirstMessage = (query: string) => {
    if (!activeConvId) return;
    const short = query.length > 40 ? query.slice(0, 40) + "…" : query;
    setConversations((prev) => prev.map((c) => (c.id === activeConvId ? { ...c, label: short } : c)));
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" label="Loading..." /></div>;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <img src="/logo.png" alt="MEND - X" className="w-7 h-7 rounded-md object-contain" />
          <span className="font-extrabold text-slate-900 text-sm tracking-tight">MEND - X</span>
        </div>

        <div className="px-3 py-3 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Machine</p>
          <MachineSelector machines={machines} selected={selectedMachine} onChange={setSelectedMachine} />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Sessions</p>
            <button onClick={startNewConversation} className="text-xs px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors">+ New</button>
          </div>
          <div className="space-y-1">
            {conversations.map((c) => (
              <button key={c.id} onClick={() => setActiveConvId(c.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${activeConvId === c.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}>
                {c.label}
              </button>
            ))}
            {conversations.length === 0 && <p className="text-xs text-slate-400 px-1">No sessions yet. Start a new one.</p>}
          </div>
        </div>

        <div className="border-t border-slate-100 px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">{user?.full_name ?? user?.email}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
            <div className="flex gap-1">
              {user?.role === "admin" && (
                <button onClick={() => router.push("/admin")} className="text-xs px-2 py-1 text-slate-500 hover:text-indigo-600 rounded transition-colors">Admin</button>
              )}
              <button onClick={logout} className="text-xs px-2 py-1 text-slate-400 hover:text-red-500 rounded transition-colors">Out</button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center">
          <div>
            <h1 className="text-sm font-semibold text-slate-800">Troubleshooting Assistant</h1>
            <p className="text-xs text-slate-400">{selectedMachine ? `Machine: ${selectedMachine.name}` : "No machine filter active"}</p>
          </div>
        </header>
        {activeConvId === null ? (
          <div className="flex flex-col items-center justify-center flex-1 px-6 bg-slate-50">
            <div className="max-w-md text-center">
              <div className="flex justify-center mb-4">
                <img 
                  src="/logo.png" 
                  alt="MEND - X" 
                  className="h-20 w-auto object-contain drop-shadow-sm rounded-xl"
                />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">MEND - X</h2>
              <p className="text-sm font-semibold text-emerald-600 mb-3">From Failure to Function.</p>
              <p className="text-sm text-slate-500 mb-6">
                Industrial RAG Troubleshooting System. Select a machine or ask about any alarm code, symptom, or repair procedure.
              </p>
              <button onClick={startNewConversation} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors">New Troubleshooting Session</button>
            </div>
          </div>
        ) : (
          <ChatInterface conversationId={activeConvId} machineId={selectedMachine?.id ?? null}
            onMachineSelect={(id) => { const m = machines.find((x) => x.id === id); if (m) setSelectedMachine(m); }}
            onFirstMessage={handleFirstMessage} />
        )}
      </main>
    </div>
  );
}

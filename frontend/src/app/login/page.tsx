"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <img 
              src="/logo.png" 
              alt="MEND - X Logo" 
              className="h-20 w-auto object-contain drop-shadow-sm rounded-xl"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">MEND - X</h1>
          <p className="text-sm font-medium text-emerald-600 mt-1">From Failure to Function.</p>
          <p className="text-xs text-slate-400">Industrial Machine Troubleshooting System</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="technician@plant.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                  focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                  focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400
                text-white font-medium text-sm rounded-lg transition-colors mt-2"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {process.env.NODE_ENV !== "production" && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-slate-100 border border-slate-200 text-center">
            <p className="text-xs font-medium text-slate-500 mb-1">Demo credentials</p>
            <p className="text-xs text-slate-400 font-mono">admin@mechmind.io / Admin123!</p>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-6">
          MEND - X v1.1.0 · Team DIMENSITY LABS [VH26-37]
        </p>
      </div>
    </div>
  );
}

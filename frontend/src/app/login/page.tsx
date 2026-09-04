"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Login failed. Check credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200">
      {/* ── Top Nav Controls ── */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Home
        </Link>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* ── Animated Background ── */}
      <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none" />

      {/* Glow Orbs */}
      <div
        className="orb absolute w-[600px] h-[600px] opacity-20"
        style={{
          background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
          top: "-15%",
          left: "-10%",
          animation: "orb-float 14s ease-in-out infinite",
        }}
      />
      <div
        className="orb absolute w-[500px] h-[500px] opacity-15"
        style={{
          background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
          bottom: "-10%",
          right: "-5%",
          animation: "orb-float 18s ease-in-out infinite -6s",
        }}
      />
      <div
        className="orb absolute w-[300px] h-[300px] opacity-10"
        style={{
          background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
          top: "40%",
          right: "10%",
          animation: "orb-float 10s ease-in-out infinite -3s",
        }}
      />

      {/* ── Main Card ── */}
      <div
        className="relative z-10 w-full max-w-md mx-4 animate-slide-up"
        style={{ animationDelay: "0.1s" }}
      >
        {/* Logo / Brand */}
        <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-2xl opacity-60"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  filter: "blur(16px)",
                  transform: "scale(1.1)",
                }}
              />
              <img
                src={theme === "light" ? "/mend-x.png" : "/mend-x-dark.png"}
                alt="MEND - X"
                className="relative w-20 h-20 object-contain rounded-2xl animate-float"
                style={{ animationDuration: "5s" }}
              />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            MEND<span className="text-indigo-600 dark:text-indigo-400"> - X</span>
          </h1>
          <p className="text-sm font-bold mt-1 text-emerald-600 dark:text-emerald-400">
            From Failure to Function
          </p>
          <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
            Industrial Machine Troubleshooting System
          </p>
        </div>

        {/* Glass Card */}
        <div
          className="p-8 bg-white/95 dark:bg-[rgba(15,17,23,0.85)] border border-slate-200 dark:border-white/[0.08] rounded-[20px] shadow-xl dark:shadow-[0_8px_64px_rgba(0,0,0,0.8)] transition-colors relative overflow-hidden backdrop-blur-2xl"
        >
          {/* Edge glow sweep effect could go here */}

          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-400">
              Secure Access Portal
            </h2>
          </div>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 text-red-600 dark:text-red-300"
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-600 dark:text-slate-400"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="technician@plant.com"
                className="w-full px-4 py-3 text-sm rounded-xl transition-all duration-300 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-[#f1f5f9] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-600 dark:text-slate-400"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 text-sm rounded-xl transition-all duration-300 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-[#f1f5f9] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3 px-4 mt-2 rounded-xl font-semibold text-sm text-white overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: isLoading
                  ? "rgba(99,102,241,0.4)"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: isLoading ? "none" : "0 0 24px rgba(99,102,241,0.4)",
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-75">●</span>
                  <span className="animate-bounce delay-150">●</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        {process.env.NODE_ENV !== "production" && (
          <div
            className="mt-4 px-4 py-3 rounded-xl text-center animate-fade-in bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]"
            style={{
              animationDelay: "0.5s",
            }}
          >
            <p className="text-xs font-medium mb-1 text-slate-500 dark:text-slate-400">
              Demo credentials
            </p>
            <p className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              admin@mechmind.io / Admin123!
            </p>
          </div>
        )}

        <p className="text-center text-xs mt-5 text-slate-500 dark:text-slate-500">
          MEND - X v1.2.1 · Team DIMENSITY LABS [VH26-37]
        </p>
      </div>
    </div>
  );
}


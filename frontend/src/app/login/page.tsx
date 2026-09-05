"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === "light";
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
        err instanceof Error ? err.message : "Authentication failed. Check credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("admin@mechmind.io");
    setPassword("Admin123!");
    setError("");
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300 flex flex-col justify-between relative overflow-hidden">
      {/* ── Top Ambient Glow Line ── */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-500 to-indigo-500 opacity-70 z-50 pointer-events-none" />

      {/* ── Top Header Navigation ── */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-white/[0.05] hover:bg-slate-200/90 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 transition-all duration-200 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Portal
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            CORE v3.0.0 · SYSTEM OPERATIONAL
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Main Split View Container ── */}
      <main className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ── Left Column: Enterprise Industrial Capability Showcase (Desktop Only) ── */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-8 pr-4">
            {/* Brand Header */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] shadow-sm">
                <Image
                  src={isLight ? "/brand-icon-light.png" : "/brand-icon-dark.png"}
                  alt="MEND-X"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain"
                  priority
                />
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  MEND-X DIAGNOSTIC CONSOLE
                </span>
              </div>

              <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Industrial Intelligence for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 dark:from-teal-400 dark:via-cyan-400 dark:to-indigo-400">
                  Zero-Downtime Operations.
                </span>
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                Connect line technicians directly to OEM schematics, live fault trees, and AI-grounded repair protocols in under 8 seconds.
              </p>
            </div>

            {/* Visual Industrial Telemetry Card Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-slate-900">
              <div className="relative h-44 w-full">
                <Image
                  src="/industrial-hero.jpg"
                  alt="Industrial Plant Automated Line"
                  fill
                  sizes="50vw"
                  className="object-cover opacity-60 filter contrast-125 brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                <div className="absolute top-3 left-4 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 backdrop-blur-md">
                    PLANT SENSORS CONNECTED
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">CANopen · Modbus TCP</span>
                </div>
              </div>

              {/* Real-Time Telemetry Stats Row */}
              <div className="p-4 bg-slate-950/90 backdrop-blur-md grid grid-cols-3 gap-4 border-t border-white/10 text-xs font-mono">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase">RAG Grounding</div>
                  <div className="text-emerald-400 font-bold mt-0.5">100% Citations</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase">Model Latency</div>
                  <div className="text-cyan-400 font-bold mt-0.5">&lt;100ms (Groq LPU)</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase">Supported OEMs</div>
                  <div className="text-slate-200 font-bold mt-0.5">Siemens · KUKA · Fanuc</div>
                </div>
              </div>
            </div>

            {/* Industrial Compliance Badges */}
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Air-Gap Compatible
              </span>
              <span>•</span>
              <span>Deterministic Protocols</span>
              <span>•</span>
              <span>Strict Role-Based Access</span>
            </div>
          </div>

          {/* ── Right Column: Sleek High-Contrast Login Card ── */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="rounded-3xl p-6 sm:p-8 bg-white/95 dark:bg-[#0c1017]/95 border border-slate-200/90 dark:border-white/10 shadow-2xl backdrop-blur-xl transition-all relative overflow-hidden">
              
              {/* Card Accent Top Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500" />

              {/* Logo & Headline */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-3.5 p-3 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] shadow-sm">
                  <Image
                    src={isLight ? "/brand-icon-light.png" : "/brand-icon-dark.png"}
                    alt="MEND-X Brand Emblem"
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                    priority
                  />
                </div>

                <div className="flex items-center gap-1.5 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  MEND<span className="text-teal-600 dark:text-teal-400">-X</span>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-0.5 font-bold">
                  Troubleshooting Portal
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Authenticate to inspect live machine telemetry and error logs.
                </p>
              </div>

              {/* Quick-Fill Demo Pill */}
              <div className="mb-6 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-3">
                <div className="text-left">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Evaluation Access
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    admin@mechmind.io
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Auto-Fill
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-5 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300">
                  <svg className="w-4 h-4 shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300"
                  >
                    Technician Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                      </svg>
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="technician@plant.com"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl transition-all duration-200 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Console Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="login-password"
                      type={showPass ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl transition-all duration-200 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 transition-colors p-1"
                      tabIndex={-1}
                      aria-label={showPass ? "Hide password" : "Show password"}
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

                {/* Submit Button */}
                <button
                  id="login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 mt-3 rounded-xl font-bold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 via-indigo-600 to-indigo-700 hover:from-teal-500 hover:via-indigo-500 hover:to-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Enter Diagnostic Console
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>

              {/* Security Footnote */}
              <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  TLS 1.3 Encrypted
                </span>
                <span>Dimensity Labs [VH26-37]</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-20 py-4 text-center text-xs font-mono text-slate-500 dark:text-slate-500">
        &copy; 2026 MEND-X Industrial Systems · All Rights Reserved
      </footer>
    </div>
  );
}

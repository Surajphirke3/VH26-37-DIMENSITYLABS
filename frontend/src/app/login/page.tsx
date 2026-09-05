"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Wrench, Shield, Briefcase, Sparkles, ArrowRight, CheckCircle2, Cpu } from "lucide-react";

type LoginMode = "technician" | "admin";

export default function LoginPage() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const router = useRouter();

  const [loginMode, setLoginMode] = useState<LoginMode>("technician");
  const [email, setEmail] = useState("tech@mechmind.io");
  const [password, setPassword] = useState("Tech123!");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Check URL query parameters for initial role preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const role = params.get("role") || params.get("mode");
      if (role === "admin") {
        setLoginMode("admin");
        setEmail("admin@mechmind.io");
        setPassword("Admin123!");
      } else if (role === "technician" || role === "user" || role === "tech") {
        setLoginMode("technician");
        setEmail("tech@mechmind.io");
        setPassword("Tech123!");
      }
    }
  }, []);

  const handleModeSwitch = (mode: LoginMode) => {
    setLoginMode(mode);
    setError("");
    if (mode === "admin") {
      setEmail("admin@mechmind.io");
      setPassword("Admin123!");
    } else {
      setEmail("tech@mechmind.io");
      setPassword("Tech123!");
    }
  };

  const setRolePreset = (roleEmail: string, rolePass: string, mode: LoginMode) => {
    setLoginMode(mode);
    setEmail(roleEmail);
    setPassword(rolePass);
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      // Route admin directly to admin page if logging in via admin mode, else to dashboard
      if (loginMode === "admin" && email === "admin@mechmind.io") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Authentication failed. Please verify credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300 flex flex-col justify-between relative overflow-hidden">
      {/* ── Top Ambient Glow Line ── */}
      <div
        className={`fixed top-0 left-0 right-0 h-1 transition-all duration-500 z-50 pointer-events-none ${
          loginMode === "technician"
            ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"
            : "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"
        }`}
      />

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
            <span>ENTERPRISE GATEWAY ONLINE</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Main Split View Container ── */}
      <main className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ── Left Column: System & Role Overview ── */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-8 pr-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] shadow-sm">
                <Image
                  src={isLight ? "/brand-icon-light.png" : "/brand-icon-dark.png"}
                  alt="MEND-X"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain"
                  priority
                />
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  MEND-X DUAL-PORTAL AUTHENTICATION
                </span>
              </div>

              <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {loginMode === "technician" ? (
                  <>
                    Field Operator Diagnostics &amp; <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500">
                      Zero-Downtime Troubleshooting.
                    </span>
                  </>
                ) : (
                  <>
                    Administrative Operations &amp; <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-400 to-cyan-400">
                      Knowledge Ingestion Control.
                    </span>
                  </>
                )}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                {loginMode === "technician"
                  ? "Ground line technicians and maintenance crews directly with OEM manuals, error code isolation, optical camera scanning, and step-by-step LOTO safety procedures."
                  : "Empower knowledge engineers and system administrators to manage vector database ingestion, configure AI models, inspect fleet telemetry, and provision team access."}
              </p>
            </div>

            {/* Industrial Capability Badge Box */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    Active Environment Capabilities
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                  Dual Role Architecture
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>USER / TECHNICIAN SIDE</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Mobile OCR scanner, targeted machine grounding, live citations, step-by-step isolation.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-indigo-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                    <Shield className="w-3.5 h-3.5" />
                    <span>ADMINISTRATOR SIDE</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    PDF manual ingestion, machine registry, team roster &amp; role governance.
                  </p>
                </div>
              </div>
            </div>

            {/* Compliance badges */}
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                Air-Gap Compatible
              </span>
              <span>•</span>
              <span>768-Dim Vector Store</span>
              <span>•</span>
              <span>Role-Based Access Control</span>
            </div>
          </div>

          {/* ── Right Column: Two-Mode Login Card ── */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="rounded-3xl p-6 sm:p-8 bg-white/95 dark:bg-[#0c1017]/95 border border-slate-200/90 dark:border-white/10 shadow-2xl backdrop-blur-xl transition-all relative overflow-hidden">
              
              {/* Card Accent Top Line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
                  loginMode === "technician"
                    ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"
                    : "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"
                }`}
              />

              {/* ── User Side vs Admin Side Switcher Tabs ── */}
              <div className="mb-6 p-1 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] grid grid-cols-2 gap-1 text-xs font-mono select-none">
                <button
                  type="button"
                  onClick={() => handleModeSwitch("technician")}
                  className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginMode === "technician"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>User / Tech</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeSwitch("admin")}
                  className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginMode === "admin"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Side</span>
                </button>
              </div>

              {/* Headline */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold mb-2 uppercase border ${
                  loginMode === 'technician'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                }">
                  {loginMode === "technician" ? "🔧 FIELD OPERATOR PORTAL" : "🛡️ ENTERPRISE ADMIN PORTAL"}
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {loginMode === "technician" ? "Technician Sign In" : "Administrator Sign In"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {loginMode === "technician"
                    ? "Log in to launch live equipment troubleshooting."
                    : "Log in to manage manuals, fleet assets, and team roles."}
                </p>
              </div>

              {/* One-Click Quick Fill Credentials Pills */}
              <div className="mb-5 space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Quick Demo Accounts:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRolePreset("tech@mechmind.io", "Tech123!", "technician")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      email === "tech@mechmind.io"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm"
                        : "bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-mono text-[10px] font-bold uppercase">Tech User</span>
                      <Wrench className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="text-[10px] font-mono truncate text-slate-300">tech@mechmind.io</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRolePreset("admin@mechmind.io", "Admin123!", "admin")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      email === "admin@mechmind.io"
                        ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300 shadow-sm"
                        : "bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-mono text-[10px] font-bold uppercase">Admin User</span>
                      <Shield className="w-3 h-3 text-indigo-400" />
                    </div>
                    <div className="text-[10px] font-mono truncate text-slate-300">admin@mechmind.io</div>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-xl text-xs flex items-center gap-2 bg-rose-500/10 border border-rose-500/25 text-rose-400 animate-fade-in">
                  <span className="font-bold">⚠</span>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300"
                  >
                    {loginMode === "technician" ? "Operator Email" : "Admin Email"}
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@plant.com"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl transition-all duration-200 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] outline-none"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300"
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
                      placeholder="••••••••••••"
                      className="w-full px-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl transition-all duration-200 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                      tabIndex={-1}
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? "✕" : "👁"}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  id="login-submit"
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 mt-2 rounded-xl font-bold text-xs sm:text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                    loginMode === "technician"
                      ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-emerald-600/25"
                      : "bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-indigo-600/25"
                  }`}
                >
                  {isLoading ? (
                    <span>Authenticating Credentials...</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {loginMode === "technician" ? "Launch Technician Workspace" : "Access Administrative Console"}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </form>

              {/* Security Footnote */}
              <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  TLS 1.3 Air-Gapped Authentication
                </span>
                <span>MEND-X v1.2.1</span>
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

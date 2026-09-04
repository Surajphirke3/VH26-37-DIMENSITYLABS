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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#08090c]">
      {/* ── Animated Background ── */}
      <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none" />

      {/* Glow Orbs */}
      <div
        className="orb absolute w-[600px] h-[600px] opacity-20"
        style={{
          background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
          top: "-15%",
          left: "-10%",
          animationDuration: "14s",
        }}
      />
      <div
        className="orb absolute w-[500px] h-[500px] opacity-15"
        style={{
          background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
          bottom: "-10%",
          right: "-5%",
          animationDuration: "18s",
          animationDelay: "-6s",
        }}
      />
      <div
        className="orb absolute w-[300px] h-[300px] opacity-10"
        style={{
          background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
          top: "40%",
          right: "10%",
          animationDuration: "10s",
          animationDelay: "-3s",
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
                src="/mend-x.png"
                alt="MEND - X"
                className="relative w-20 h-20 object-contain rounded-2xl animate-float"
                style={{ animationDuration: "5s" }}
              />
            </div>
          </div>
          <h1
            className="text-3xl font-black tracking-tight"
            style={{
              background: "linear-gradient(135deg, #a5b4fc, #c4b5fd, #f0abfc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            MEND - X
          </h1>
          <p className="text-sm font-semibold mt-1" style={{ color: "#10b981" }}>
            From Failure to Function
          </p>
          <p className="text-xs mt-1" style={{ color: "#475569" }}>
            Industrial Machine Troubleshooting System
          </p>
        </div>

        {/* Glass Card */}
        <div
          className="glass-card p-8"
          style={{
            background: "rgba(15,17,23,0.85)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            boxShadow: "0 8px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.1)",
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="status-dot-online" />
            <h2 className="text-sm font-semibold" style={{ color: "#94a3b8" }}>
              Secure Access Portal
            </h2>
          </div>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#fca5a5",
              }}
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
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#64748b" }}
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
                className="input-glow w-full px-4 py-3 text-sm rounded-xl transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#f1f5f9",
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#64748b" }}
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
                  className="input-glow w-full px-4 py-3 pr-12 text-sm rounded-xl transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#f1f5f9",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
              className="relative w-full py-3 px-4 mt-2 rounded-xl font-semibold text-sm text-white overflow-hidden"
              style={{
                background: isLoading
                  ? "rgba(99,102,241,0.4)"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: isLoading ? "none" : "0 0 24px rgba(99,102,241,0.4)",
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
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
            className="mt-4 px-4 py-3 rounded-xl text-center animate-fade-in"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              animationDelay: "0.5s",
            }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: "#475569" }}>
              Demo credentials
            </p>
            <p className="font-mono text-xs" style={{ color: "#6366f1" }}>
              admin@mechmind.io / Admin123!
            </p>
          </div>
        )}

        <p className="text-center text-xs mt-5" style={{ color: "#334155" }}>
          MEND - X v1.1.0 · Team DIMENSITY LABS [VH26-37]
        </p>
      </div>
    </div>
  );
}

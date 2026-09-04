"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useTheme } from "@/lib/theme-context";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Diagnostics" },
  { href: "/documents", label: "Documents" },
  { href: "/search", label: "Search" },
  { href: "/models", label: "Models" },
  { href: "/status", label: "Status" },
  { href: "/architecture", label: "Architecture" },
  { href: "/help", label: "Help" },
];

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300 relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Ambient Glow Bar */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80 z-50 pointer-events-none blur-[1px]" />

      {/* ── Sticky Navbar ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[var(--bg-base)]/85 backdrop-blur-2xl border-b border-[var(--border)] shadow-2xl shadow-indigo-950/20 py-1"
            : "bg-transparent py-2"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3.5 flex-shrink-0 group">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 opacity-60 group-hover:opacity-100 blur-sm transition-all duration-500 group-hover:scale-105" />
              <div className="relative w-10 h-10 rounded-xl bg-[var(--bg-surface)] p-[2px] border border-[var(--border)] flex items-center justify-center overflow-hidden shadow-md">
                <Image
                  src={theme === "light" ? "/logo-solid.png" : "/logo-dark.png"}
                  alt="MEND-X"
                  width={24}
                  height={24}
                  className="object-contain transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-black text-lg tracking-tight text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">
                MEND<span className="text-indigo-500 dark:text-indigo-400">-X</span>
              </span>
              <span className="font-mono text-[9px] text-[var(--text-muted)] tracking-widest uppercase font-bold">
                From Failure to Function
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-surface)]/60 backdrop-blur-md border border-[var(--border)] shadow-inner">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 flex items-center gap-1.5 ${
                    active
                      ? "text-white font-bold bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-600/30"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls & CTAs */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-widest">SYSTEM ONLINE</span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            <Link
              href="/login"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] transition-all duration-200"
            >
              Sign In
            </Link>

            <Link
              href="/dashboard"
              className="relative group overflow-hidden px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_auto] hover:bg-[position:right_center] shadow-lg shadow-indigo-600/30 transition-all duration-500 border border-indigo-400/30 flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>Console</span>
              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileOpen && (
          <div className="md:hidden bg-[var(--bg-surface)]/98 backdrop-blur-2xl border-t border-[var(--border)] px-4 py-4 space-y-2 animate-slide-down shadow-2xl">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    active
                      ? "text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Page Content Container */}
      <main className="min-h-screen relative">{children}</main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-[var(--border)] bg-[var(--bg-surface)] py-12 px-4 transition-colors duration-300 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-[var(--text-muted)] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Image
                src={theme === "light" ? "/logo-solid.png" : "/logo-dark.png"}
                alt="MEND-X"
                width={18}
                height={18}
                className="object-contain"
              />
            </div>
            <span className="font-bold text-[var(--text-primary)]">MEND-X v1.2.1</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">PROD</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-center">
            <span className="font-semibold text-indigo-400">DIMENSITY LABS [VH26-37]</span>
            <span className="text-[var(--border)]">•</span>
            <span>VCET NATIONAL HACKATHON 2026</span>
            <span className="text-[var(--border)]">•</span>
            <span className="text-emerald-500">From Failure to Function</span>
          </div>

          <div className="text-[var(--text-muted)] flex items-center gap-2">
            <span>&copy; 2026 MEND-X. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

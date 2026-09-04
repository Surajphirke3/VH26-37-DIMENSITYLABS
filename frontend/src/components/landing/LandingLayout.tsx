"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/problem", label: "Problem & Solution" },
  { href: "/architecture", label: "Architecture" },
  { href: "/workflow", label: "How It Works" },
];

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
    <div className="min-h-screen bg-[#07080c] text-[#f1f5f9]">
      {/* ── Sticky Navbar ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#07080c]/95 backdrop-blur-xl border-b border-white/[0.07] shadow-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 p-[2px] shadow-lg shadow-indigo-600/30 group-hover:shadow-indigo-500/50 transition-shadow">
              <div className="w-full h-full bg-[#0d0f18] rounded-[6px] flex items-center justify-center overflow-hidden">
                <Image src="/logo-dark.png" alt="MEND-X" width={22} height={22} className="object-contain" />
              </div>
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-black text-base tracking-tight text-white">
                MEND<span className="text-indigo-400">-X</span>
              </span>
              <span className="font-mono text-[9px] text-slate-500 tracking-widest uppercase">From Failure to Function</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    active
                      ? "text-white bg-indigo-500/15 border border-indigo-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {active && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-2.5">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] text-emerald-400 font-semibold tracking-wider">LIVE</span>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 transition-all border border-indigo-400/25 flex items-center gap-1.5"
            >
              Console
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-400"
            >
              {mobileOpen ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0a0b10]/98 backdrop-blur-xl border-t border-white/[0.06] px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 text-sm font-semibold rounded-lg ${
                    active ? "text-white bg-indigo-500/15 border border-indigo-500/30" : "text-slate-400"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="min-h-screen">{children}</main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] bg-[#05060a] py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <Image src="/logo-dark.png" alt="MEND-X" width={20} height={20} className="object-contain opacity-60" />
            <span className="font-semibold text-slate-400">MEND-X v1.1.1</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-center">
            <span>DIMENSITY LABS [VH26-37]</span>
            <span className="text-white/20">•</span>
            <span>VCET NATIONAL HACKATHON 2026</span>
            <span className="text-white/20">•</span>
            <span>From Failure to Function</span>
          </div>
          <div className="text-slate-600">&copy; 2026 MEND-X</div>
        </div>
      </footer>
    </div>
  );
}

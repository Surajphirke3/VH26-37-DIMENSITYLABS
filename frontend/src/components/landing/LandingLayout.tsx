"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import IndustrialHeroBackground from "@/components/landing/IndustrialHeroBackground";
import LanguageSelector from "@/components/common/LanguageSelector";
import { useLanguage } from "@/lib/i18n/context";
import { LogOut } from "lucide-react";

interface NavLinkItem {
  href: string;
  key: string;
  defaultLabel: string;
  shortLabel?: string;
  isModels?: boolean;
}

const PUBLIC_LINKS: NavLinkItem[] = [
  { href: "/", key: "nav.home", defaultLabel: "Home", shortLabel: "Home" },
  { href: "/problem", key: "nav.problemSolution", defaultLabel: "Problem & Solution", shortLabel: "Problem" },
  { href: "/models", key: "nav.ourModels", defaultLabel: "Our Models", shortLabel: "Models", isModels: true },
  { href: "/architecture", key: "nav.architecture", defaultLabel: "Architecture", shortLabel: "Architecture" },
  { href: "/workflow", key: "nav.howItWorks", defaultLabel: "How It Works", shortLabel: "Workflow" },
  { href: "/help", key: "nav.help", defaultLabel: "Help & FAQ", shortLabel: "Help" },
  { href: "/inspector", key: "nav.judgeInspection", defaultLabel: "Judge Inspection ⚡", shortLabel: "Inspect ⚡" },
];



export default function LandingLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navLinks = PUBLIC_LINKS;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modelsDropdownOpen, setModelsDropdownOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setModelsDropdownOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300 relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Ambient Glow Bar */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80 z-50 pointer-events-none blur-[1px]" />

      {/* Cinematic Industrial Atmospheric Background & Laser Particle Telemetry */}
      <IndustrialHeroBackground />

      {/* ── Sticky Navbar ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--bg-base)]/95 backdrop-blur-2xl border-b border-[var(--border)] shadow-xl shadow-black/10 py-1"
            : "bg-[var(--bg-base)]/90 backdrop-blur-xl border-b border-[var(--border)]/70 py-1.5"
        }`}
      >
        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 lg:gap-3 xl:gap-4">
          {/* Brand Logo & Name - NO circle/box, direct prominent emblem */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group py-1">
            <Image
              src={theme === "light" ? "/brand-icon-light.png" : "/brand-icon-dark.png"}
              alt="MEND-X"
              width={36}
              height={36}
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
              priority
            />
            <div className="flex flex-col leading-tight">
              <span className="font-black text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white transition-colors flex items-center gap-0.5">
                MEND<span className="text-teal-600 dark:text-teal-400">-X</span>
              </span>
              <span className="hidden 2xl:block font-mono text-[9px] text-slate-500 dark:text-slate-400 tracking-wider uppercase font-semibold">
                {t("nav.tagline", "From Failure to Function")}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-0.5 bg-slate-100/80 dark:bg-white/[0.04] p-1 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md shadow-sm shrink-0">
            {navLinks.map((link) => {
              const active = pathname === link.href;

              if (link.isModels) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setModelsDropdownOpen(true)}
                    onMouseLeave={() => setModelsDropdownOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className={`px-2.5 xl:px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                        active
                          ? "text-slate-900 dark:text-white bg-white dark:bg-white/[0.12] shadow-sm font-bold border border-slate-200/80 dark:border-white/[0.08]"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.08]"
                      }`}
                    >
                      <span className="hidden 2xl:inline">{t(link.key, link.defaultLabel)}</span>
                      <span className="2xl:hidden">{link.shortLabel || t(link.key, link.defaultLabel)}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                        3
                      </span>
                      <svg
                        className={`w-3 h-3 transition-transform duration-200 ${modelsDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Link>

                    {/* Interactive Dropdown Preview */}
                    {modelsDropdownOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-80 z-50 animate-slide-down">
                        <div className="rounded-2xl p-3 bg-white dark:bg-[#12141c] backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl space-y-1.5">
                          <div className="flex items-center justify-between px-2.5 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/[0.06]">
                            <span>Tiered AI Architecture</span>
                            <span className="text-emerald-500 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Online
                            </span>
                          </div>

                          {/* Compound Mini */}
                          <Link
                            href="/models"
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors group"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#3b82f6]" />
                              <div>
                                <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                                  Compound Mini
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">Edge Triage · Groq LPU</div>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-500/20 whitespace-nowrap">
                              &lt;100ms
                            </span>
                          </Link>

                          {/* GPT-OSS 20B */}
                          <Link
                            href="/models"
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors group"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_#f59e0b]" />
                              <div>
                                <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                                  GPT-OSS 20B
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">Diagnostic Engine · Groq Fast</div>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-500/20 whitespace-nowrap">
                              1–2s
                            </span>
                          </Link>

                          {/* GPT-OSS 120B */}
                          <Link
                            href="/models"
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors group"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0 shadow-[0_0_8px_#8b5cf6]" />
                              <div>
                                <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-violet-500 transition-colors">
                                  GPT-OSS 120B
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">Deep Reasoning · Groq LPU</div>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold border border-violet-200 dark:border-violet-500/20 whitespace-nowrap">
                              2–4s
                            </span>
                          </Link>

                          <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex flex-col gap-1 text-center">
                            <Link
                              href="/space"
                              className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center justify-center gap-1.5 py-0.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                              <span>Enter Tri-Model Space (Nord · Forge · Apex) 🌌</span>
                            </Link>
                            <Link
                              href="/models"
                              className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:underline"
                            >
                              Explore Technical Specs Matrix →
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 xl:px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap ${
                    active
                      ? "text-slate-900 dark:text-white bg-white dark:bg-white/[0.12] shadow-sm font-bold border border-slate-200/80 dark:border-white/[0.08]"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.08] border border-transparent"
                  }`}
                >
                  <span className="hidden 2xl:inline">{t(link.key, link.defaultLabel)}</span>
                  <span className="2xl:hidden">{link.shortLabel || t(link.key, link.defaultLabel)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls & CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-2.5 shrink-0">
            {/* Status dot */}
            <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-semibold tracking-wider whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              {t("nav.systemOnline", "ONLINE")}
            </div>

            {/* Language Selector */}
            <LanguageSelector variant="header-pill" />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Authenticated User or Sign In */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08]">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                    {(user.full_name || user.email)[0].toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left leading-none">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 max-w-[70px] xl:max-w-[100px] truncate">
                      {user.full_name || user.email.split("@")[0]}
                    </span>
                    <span className="text-[8px] font-mono text-emerald-500 uppercase font-bold mt-0.5">
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                  title={t("nav.signOut", "Sign Out")}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors whitespace-nowrap shrink-0"
              >
                {t("nav.signIn", "Sign In")}
              </Link>
            )}

            {/* Console button - ALWAYS VISIBLE */}
            <Link
              href={user ? "/dashboard" : "/login"}
              className="px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 hover:scale-[1.02] active:scale-95"
            >
              <span>{t("nav.console", "Console")}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
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
          <div className="lg:hidden bg-[var(--bg-surface)]/98 backdrop-blur-2xl border-t border-[var(--border)] px-4 py-4 space-y-2 animate-slide-down shadow-2xl">
            {navLinks.map((link) => {
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
                  {t(link.key, link.defaultLabel)}
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
            <Image
              src={theme === "light" ? "/brand-icon-light.png" : "/brand-icon-dark.png"}
              alt="MEND-X"
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
            />
            <span className="font-bold text-[var(--text-primary)]">MEND-X v1.2.1</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">PROD</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-center">
            <span className="font-semibold text-indigo-400">DIMENSITY LABS [VH26-37]</span>
            <span className="text-[var(--border)]">•</span>
            <span>VCET NATIONAL HACKATHON 2026</span>
            <span className="text-[var(--border)]">•</span>
            <span className="text-emerald-500">{t("nav.tagline", "From Failure to Function")}</span>
          </div>

          <div className="text-[var(--text-muted)] flex items-center gap-2">
            <span>&copy; 2026 MEND-X. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

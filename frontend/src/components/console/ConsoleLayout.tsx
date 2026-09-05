"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSelector from "@/components/common/LanguageSelector";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n/context";
import {
  FileText,
  UploadCloud,
  Search,
  Activity,
  Sliders,
  Cpu,
  Layers,
  HelpCircle,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Zap,
} from "lucide-react";

interface ConsoleNavItem {
  href: string;
  key: string;
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const PRIMARY_NAV: ConsoleNavItem[] = [
  {
    href: "/dashboard",
    key: "nav.diagnosticsChat",
    defaultLabel: "Diagnostics Chat",
    icon: Activity,
  },
  {
    href: "/documents",
    key: "nav.technicalManuals",
    defaultLabel: "Technical Manuals",
    icon: FileText,
  },
  {
    href: "/upload",
    key: "nav.uploadEngine",
    defaultLabel: "Upload Engine",
    icon: UploadCloud,
  },
  {
    href: "/search",
    key: "nav.vectorSearch",
    defaultLabel: "Vector Deep Search",
    icon: Search,
  },
  {
    href: "/status",
    key: "nav.infrastructureStatus",
    defaultLabel: "Infrastructure Status",
    icon: Layers,
  },
  {
    href: "/settings",
    key: "nav.systemSettings",
    defaultLabel: "System Settings",
    icon: Sliders,
  },
];

const REFERENCE_NAV: ConsoleNavItem[] = [
  {
    href: "/models",
    key: "nav.modelSpecs",
    defaultLabel: "Model Specifications",
    icon: Cpu,
  },
  {
    href: "/architecture",
    key: "nav.liveArchitecture",
    defaultLabel: "Live Architecture",
    icon: Layers,
  },
  {
    href: "/help",
    key: "nav.fieldHandbook",
    defaultLabel: "Field Handbook",
    icon: HelpCircle,
  },
  {
    href: "/inspector",
    key: "nav.judgeStudio",
    defaultLabel: "Judge X-Ray Studio ⚡",
    icon: Zap,
  },
];

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const currentNav =
    PRIMARY_NAV.find((item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))) ||
    REFERENCE_NAV.find((item) => pathname === item.href);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200 flex">
      {/* ── DESKTOP PERSISTENT LEFT SIDEBAR (CONSOLE SHELL) ── */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col h-screen fixed top-0 left-0 z-30 bg-[var(--bg-surface)] border-r border-[var(--border)] select-none">
        {/* Console Header / Brand Identity */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[var(--border)] shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 group"
            title="MEND-X Diagnostics Console"
          >
            <div className="relative shrink-0">
              <Image
                src={isLight ? "/brand-icon-light.png" : "/brand-icon-dark.png"}
                alt="MEND-X"
                width={32}
                height={32}
                className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white">
                  MEND<span className="text-teal-600 dark:text-teal-400">-X</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wide">
                  {t("nav.console", "CONSOLE")}
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t("nav.systemOnline", "SYSTEM ONLINE")}
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Group 1: Core Operations */}
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
              {t("nav.operations", "Console Operations")}
            </p>
            <nav className="space-y-1">
              {PRIMARY_NAV.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      active
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                      <span>{t(item.key, item.defaultLabel)}</span>
                    </div>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Group 2: Specs & Handbook */}
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
              {t("nav.referenceManuals", "Specs & Documentation")}
            </p>
            <nav className="space-y-1">
              {REFERENCE_NAV.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      active
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                      <span>{t(item.key, item.defaultLabel)}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Group 3: Language & Exit to Public Site */}
          <div className="pt-2 border-t border-[var(--border)] space-y-1">
            <LanguageSelector variant="sidebar-item" />
            <Link
              href="/"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
                <span>{t("nav.portal", "Portal ↗")}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-500">Exit ↗</span>
            </Link>
          </div>
        </div>

        {/* User Profile & Sign Out Footer in Sidebar */}
        <div className="p-3 border-t border-[var(--border)] bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {(user?.full_name ?? user?.email ?? "T")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.full_name ?? "Technician"}
                </p>
                <p className="text-[10px] font-mono text-slate-400 truncate">
                  {user?.email ?? "admin@mechmind.io"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
              title="Sign Out of Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE HEADER (SMALL SCREENS ONLY) ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 z-40 bg-[var(--bg-surface)] border-b border-[var(--border)] px-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src={isLight ? "/brand-icon-light.png" : "/brand-icon-dark.png"}
            alt="MEND-X"
            width={28}
            height={28}
            className="w-7 h-7 object-contain"
          />
          <span className="font-black text-sm tracking-tight">MEND-X CONSOLE</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm pt-16 flex flex-col animate-fade-in">
          <div className="flex-1 bg-[var(--bg-surface)] p-4 space-y-4 overflow-y-auto">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              {t("nav.operations", "Console Operations")}
            </p>
            {PRIMARY_NAV.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    active
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t(item.key, item.defaultLabel)}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <Link href="/" className="text-xs font-mono text-indigo-500">
                ← {t("nav.portal", "Exit to Portal")}
              </Link>
              <button onClick={handleLogout} className="text-xs font-semibold text-rose-500">
                {t("nav.signOut", "Sign Out")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT WORKSPACE (OFFSET BY 256px SIDEBAR ON DESKTOP) ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Command Bar */}
        <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-surface)]/80 backdrop-blur-md sticky top-0 z-20 px-6 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 dark:text-slate-500">
              <span>{t("nav.console", "Console")}</span>
              <span>/</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currentNav ? t(currentNav.key, currentNav.defaultLabel) : "Workspace"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector variant="header-pill" />
            <ThemeToggle />
          </div>
        </header>

        {/* Workspace Children Container */}
        <main className="flex-1 pt-4 lg:pt-2 px-4 sm:px-8 pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}

// ==============================================================================
// MEND - X | Mobile Design System & Tokens
// Aligned with Next.js Web Frontend (globals.css Cyber Noir Theme)
// ==============================================================================

export const colors = {
  // Base Surfaces (exact matches to globals.css)
  bgBase: "#06070a",
  background: "#06070a",
  surface: "#0c0e14",
  surfaceElevated: "#121520",
  surfaceOverlay: "#181c2b",

  // Borders
  border: "rgba(255, 255, 255, 0.08)",
  borderSolid: "#1a1e2d",
  borderHover: "rgba(255, 255, 255, 0.18)",
  borderAccent: "rgba(99, 102, 241, 0.5)",

  // Brand & Accent Colors
  accent: "#6366f1",
  accentPrimary: "#6366f1",
  accentHover: "#4f46e5",
  accentMuted: "#312e81",
  accentViolet: "#8b5cf6",
  accentPink: "#ec4899",
  accentAi: "#10b981",
  accentCyan: "#06b6d4",

  // Typography
  text: "#f8fafc",
  textPrimary: "#f8fafc",
  textSecondary: "#a1a1aa",
  muted: "#71717a",
  textMuted: "#71717a",

  // Status & Semantics
  success: "#10b981",
  successMuted: "rgba(16, 185, 129, 0.15)",
  warning: "#f59e0b",
  warningMuted: "rgba(245, 158, 11, 0.15)",
  error: "#ef4444",
  errorMuted: "rgba(239, 68, 68, 0.15)",
  info: "#06b6d4",
  infoMuted: "rgba(6, 182, 212, 0.15)",

  // Ambient & Overlays
  overlay: "rgba(0, 0, 0, 0.78)",
  cyberGlow: "rgba(99, 102, 241, 0.25)",
} as const;

export const roleColors: Record<string, { main: string; bg: string; border: string }> = {
  admin: { main: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.35)" },
  technician: { main: "#10b981", bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.35)" },
  manager: { main: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.35)" },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const typography = {
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 34,
  },
  weight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 8,
  },
  glow: {
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

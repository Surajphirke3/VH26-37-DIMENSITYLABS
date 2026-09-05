export const colors = {
  background: "#0f172a",
  surface: "#1e293b",
  surfaceElevated: "#263548",
  border: "#334155",
  accent: "#6366f1",
  accentHover: "#4f46e5",
  accentMuted: "#312e81",
  text: "#f1f5f9",
  textSecondary: "#cbd5e1",
  muted: "#94a3b8",
  success: "#22c55e",
  successMuted: "#14532d",
  warning: "#f59e0b",
  warningMuted: "#451a03",
  error: "#ef4444",
  errorMuted: "#450a0a",
  info: "#38bdf8",
  infoMuted: "#0c4a6e",
  overlay: "rgba(0,0,0,0.6)",
} as const;

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
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 8,
  },
} as const;

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, borderRadius, typography, spacing } from "@/lib/theme";

type BadgeVariant = "success" | "warning" | "error" | "info" | "accent" | "default";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantMap: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  success: { bg: "rgba(16, 185, 129, 0.12)", text: colors.success, border: "rgba(16, 185, 129, 0.35)" },
  warning: { bg: "rgba(245, 158, 11, 0.12)", text: colors.warning, border: "rgba(245, 158, 11, 0.35)" },
  error:   { bg: "rgba(239, 68, 68, 0.12)",  text: colors.error,   border: "rgba(239, 68, 68, 0.35)" },
  info:    { bg: "rgba(6, 182, 212, 0.12)",   text: colors.info,    border: "rgba(6, 182, 212, 0.35)" },
  accent:  { bg: "rgba(99, 102, 241, 0.12)",  text: colors.accent,  border: "rgba(99, 102, 241, 0.35)" },
  default: { bg: colors.surfaceElevated,      text: colors.textSecondary, border: colors.border },
};

export default function Badge({ label, variant = "default", dot = false }: BadgeProps) {
  const v = variantMap[variant] ?? variantMap.default;
  return (
    <View style={[styles.pill, { backgroundColor: v.bg, borderColor: v.border }]}>
      {dot && <View style={[styles.dot, { backgroundColor: v.text }]} />}
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 1,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});

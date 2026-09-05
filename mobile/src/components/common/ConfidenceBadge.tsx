import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, borderRadius, typography, spacing } from "@/lib/theme";

type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

interface ConfidenceBadgeProps {
  level: ConfidenceLevel | null;
  score?: number | null;
}

const levelConfig: Record<ConfidenceLevel, { bg: string; text: string; border: string; label: string }> = {
  HIGH:   { bg: "rgba(16, 185, 129, 0.12)", text: colors.success, border: "rgba(16, 185, 129, 0.35)", label: "HIGH" },
  MEDIUM: { bg: "rgba(245, 158, 11, 0.12)", text: colors.warning, border: "rgba(245, 158, 11, 0.35)", label: "MED" },
  LOW:    { bg: "rgba(239, 68, 68, 0.12)",  text: colors.error,   border: "rgba(239, 68, 68, 0.35)",  label: "LOW" },
};

export default function ConfidenceBadge({ level, score }: ConfidenceBadgeProps) {
  if (!level) return null;

  const cfg = levelConfig[level];
  const pct = score != null ? `${Math.round(score * 100)}%` : null;

  return (
    <View style={[styles.pill, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[styles.levelText, { color: cfg.text }]}>{cfg.label}</Text>
      {pct ? (
        <>
          <View style={[styles.divider, { backgroundColor: cfg.text }]} />
          <Text style={[styles.scoreText, { color: cfg.text }]}>{pct}</Text>
        </>
      ) : null}
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
    gap: spacing.xs,
  },
  levelText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 10,
    opacity: 0.3,
  },
  scoreText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
});

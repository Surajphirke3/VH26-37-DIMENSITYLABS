import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, borderRadius, typography, spacing } from "@/lib/theme";

type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

interface ConfidenceBadgeProps {
  level: ConfidenceLevel | null;
  score?: number | null;
}

const levelConfig: Record<ConfidenceLevel, { bg: string; text: string; label: string }> = {
  HIGH:   { bg: colors.successMuted, text: colors.success, label: "HIGH" },
  MEDIUM: { bg: colors.warningMuted, text: colors.warning, label: "MED" },
  LOW:    { bg: colors.errorMuted,   text: colors.error,   label: "LOW" },
};

export default function ConfidenceBadge({ level, score }: ConfidenceBadgeProps) {
  if (!level) return null;

  const cfg = levelConfig[level];
  const pct = score != null ? `${Math.round(score * 100)}%` : null;

  return (
    <View style={[styles.pill, { backgroundColor: cfg.bg }]}>
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
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 1,
    gap: spacing.xs - 1,
  },
  levelText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 10,
    opacity: 0.4,
  },
  scoreText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
});

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, borderRadius, typography, spacing } from "@/lib/theme";

type BadgeVariant = "success" | "warning" | "error" | "info" | "default";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantMap: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: colors.successMuted, text: colors.success },
  warning: { bg: colors.warningMuted, text: colors.warning },
  error:   { bg: colors.errorMuted,   text: colors.error },
  info:    { bg: colors.infoMuted,    text: colors.info },
  default: { bg: colors.border,       text: colors.muted },
};

export default function Badge({ label, variant = "default" }: BadgeProps) {
  const v = variantMap[variant];
  return (
    <View style={[styles.pill, { backgroundColor: v.bg }]}>
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 1,
  },
  text: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});

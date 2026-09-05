import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors, typography, spacing } from "@/lib/theme";

type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  label?: string;
}

const nativeSizeMap: Record<SpinnerSize, "small" | "large"> = {
  sm: "small",
  md: "small",
  lg: "large",
};

const labelSizeMap: Record<SpinnerSize, number> = {
  sm: typography.size.xs,
  md: typography.size.sm,
  lg: typography.size.base,
};

export default function Spinner({
  size = "md",
  color = colors.accent,
  label,
}: SpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={nativeSizeMap[size]} color={color} />
      {label ? (
        <Text style={[styles.label, { fontSize: labelSizeMap[size] }]}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  label: {
    color: colors.muted,
    fontWeight: typography.weight.medium,
  },
});

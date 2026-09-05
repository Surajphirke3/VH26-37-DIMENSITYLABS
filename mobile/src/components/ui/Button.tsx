import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { colors, borderRadius, typography, spacing, shadows } from "@/lib/theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "ai";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<string, { bg: string; border?: string; text: string }> = {
  primary:   { bg: colors.accent, text: "#ffffff" },
  secondary: { bg: colors.surfaceElevated, border: colors.border, text: colors.text },
  danger:    { bg: colors.error, text: "#ffffff" },
  ghost:     { bg: "transparent", text: colors.textSecondary },
  ai:        { bg: colors.accentAi, text: "#ffffff" },
};

const sizeStyles: Record<string, { px: number; py: number; fontSize: number; iconGap: number }> = {
  sm: { px: spacing.md, py: spacing.xs + 2, fontSize: typography.size.sm, iconGap: spacing.xs },
  md: { px: spacing.lg, py: spacing.sm + 4, fontSize: typography.size.base, iconGap: spacing.sm },
  lg: { px: spacing.xl, py: spacing.md, fontSize: typography.size.md, iconGap: spacing.sm },
};

export default function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
}: ButtonProps) {
  const v = variantStyles[variant] ?? variantStyles.primary;
  const s = sizeStyles[size] ?? sizeStyles.md;
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle = {
    backgroundColor: v.bg,
    borderWidth: v.border ? 1 : 0,
    borderColor: v.border ?? "transparent",
    paddingHorizontal: s.px,
    paddingVertical: s.py,
    borderRadius: borderRadius.md,
    opacity: isDisabled ? 0.5 : 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: s.iconGap,
    ...(variant === "primary" ? shadows.glow : shadows.sm),
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {icon && <View>{icon}</View>}
          <Text style={[styles.label, { color: v.text, fontSize: s.fontSize }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: typography.weight.bold,
    letterSpacing: 0.3,
  },
});

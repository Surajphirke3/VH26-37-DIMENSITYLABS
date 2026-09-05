import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { colors, borderRadius, typography, spacing } from "@/lib/theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<string, { bg: string; border?: string; text: string }> = {
  primary: { bg: colors.accent, text: colors.text },
  secondary: { bg: colors.surface, border: colors.border, text: colors.text },
  danger: { bg: colors.error, text: colors.text },
  ghost: { bg: "transparent", text: colors.muted },
};

const sizeStyles: Record<string, { px: number; py: number; fontSize: number; iconGap: number }> = {
  sm: { px: spacing.md, py: spacing.xs + 2, fontSize: typography.size.sm, iconGap: spacing.xs },
  md: { px: spacing.lg, py: spacing.sm + 2, fontSize: typography.size.base, iconGap: spacing.sm },
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
  const v = variantStyles[variant];
  const s = sizeStyles[size];
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
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
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
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.2,
  },
});

import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { colors, borderRadius, spacing, shadows } from "@/lib/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  cyberEdge?: boolean;
  elevated?: boolean;
}

export default function Card({
  children,
  style,
  onPress,
  cyberEdge = false,
  elevated = false,
}: CardProps) {
  const cardStyle = [
    styles.card,
    elevated && styles.elevated,
    cyberEdge && styles.cyberCard,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.78}
      >
        {cyberEdge && <View style={styles.topEdge} />}
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {cyberEdge && <View style={styles.topEdge} />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    overflow: "hidden",
    position: "relative",
    ...shadows.sm,
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
    ...shadows.md,
  },
  cyberCard: {
    borderColor: "rgba(99, 102, 241, 0.25)",
  },
  topEdge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accent,
  },
});

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Machine } from "@/lib/types";
import { colors, typography, spacing, borderRadius, shadows } from "@/lib/theme";
import Badge from "@/components/ui/Badge";

interface MachineCardProps {
  machine: Machine;
  onPress: () => void;
  onDeactivate?: () => void;
}

export default function MachineCard({ machine, onPress, onDeactivate }: MachineCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.78}>
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Ionicons name="hardware-chip-outline" size={20} color={colors.accent} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {machine.name}
          </Text>
          {(machine.manufacturer || machine.model) ? (
            <Text style={styles.sub} numberOfLines={1}>
              {[machine.manufacturer, machine.model].filter(Boolean).join(" · ")}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.border} />
      </View>

      <View style={styles.bottomRow}>
        {machine.category ? (
          <Badge label={machine.category} variant="info" />
        ) : null}
        {onDeactivate ? (
          <TouchableOpacity
            style={styles.deactivateBtn}
            onPress={onDeactivate}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="power-outline" size={14} color={colors.error} />
            <Text style={styles.deactivateText}>Deactivate</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.text,
  },
  sub: {
    fontSize: typography.size.sm,
    color: colors.muted,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deactivateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.errorMuted,
  },
  deactivateText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.error,
  },
});

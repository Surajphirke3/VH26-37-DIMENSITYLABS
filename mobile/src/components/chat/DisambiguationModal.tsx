import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DisambiguationOption } from "@/lib/types";
import { colors, typography, spacing, borderRadius, shadows } from "@/lib/theme";

interface DisambiguationModalProps {
  visible: boolean;
  options: DisambiguationOption[];
  onSelect: (machineId: string) => void;
  onDismiss: () => void;
}

export default function DisambiguationModal({
  visible,
  options,
  onSelect,
  onDismiss,
}: DisambiguationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Select Machine</Text>
              <Text style={styles.headerSub}>
                Multiple machines match your query
              </Text>
            </View>
            <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => item.machine_id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => onSelect(item.machine_id)}
                activeOpacity={0.78}
              >
                <View style={styles.optionRow}>
                  <Ionicons name="hardware-chip-outline" size={18} color={colors.accent} />
                  <Text style={styles.machineName}>{item.machine_name}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.border} style={styles.chevron} />
                </View>
                {item.snippet ? (
                  <Text style={styles.snippet} numberOfLines={2}>
                    {item.snippet}
                  </Text>
                ) : null}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    maxHeight: "70%",
    ...shadows.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text,
  },
  headerSub: {
    fontSize: typography.size.sm,
    color: colors.muted,
    marginTop: 2,
  },
  list: {
    padding: spacing.md,
  },
  separator: {
    height: spacing.xs,
  },
  optionCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  machineName: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.text,
  },
  chevron: {
    marginLeft: "auto",
  },
  snippet: {
    fontSize: typography.size.sm,
    color: colors.muted,
    marginTop: spacing.xs,
    lineHeight: typography.size.sm * 1.5,
  },
});

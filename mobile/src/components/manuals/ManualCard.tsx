import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Manual } from "@/lib/types";
import { colors, typography, spacing, borderRadius, shadows } from "@/lib/theme";
import Badge from "@/components/ui/Badge";

interface ManualCardProps {
  manual: Manual;
  onPress: () => void;
  onDelete?: () => void;
}

type BadgeVariant = "success" | "warning" | "error" | "info" | "default";

const statusVariant: Record<Manual["processing_status"], BadgeVariant> = {
  completed:    "success",
  processing:   "info",
  reprocessing: "info",
  pending:      "warning",
  failed:       "error",
};

function formatBytes(bytes?: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ManualCard({ manual, onPress, onDelete }: ManualCardProps) {
  const isProcessing = manual.processing_status === "processing" || manual.processing_status === "reprocessing";
  const variant = statusVariant[manual.processing_status];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.78}>
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Ionicons name="document-text-outline" size={20} color={colors.accent} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{manual.title}</Text>
          {manual.machine_name ? (
            <Text style={styles.machineName} numberOfLines={1}>{manual.machine_name}</Text>
          ) : null}
        </View>
        {onDelete ? (
          <TouchableOpacity
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        ) : null}
      </View>

      {isProcessing && (
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      )}

      <View style={styles.metaRow}>
        <Badge label={manual.processing_status} variant={variant} />
        <View style={styles.statsRow}>
          {manual.page_count ? (
            <Text style={styles.stat}>{manual.page_count} pp</Text>
          ) : null}
          {manual.chunk_count != null ? (
            <Text style={styles.stat}>{manual.chunk_count} chunks</Text>
          ) : null}
          {manual.file_size_bytes ? (
            <Text style={styles.stat}>{formatBytes(manual.file_size_bytes)}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.md, ...shadows.sm },
  topRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  iconBox: { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.accentMuted, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  info: { flex: 1, gap: 2 },
  title: { fontSize: typography.size.base, fontWeight: typography.weight.semibold, color: colors.text },
  machineName: { fontSize: typography.size.sm, color: colors.muted },
  deleteBtn: { padding: spacing.xs, backgroundColor: colors.errorMuted, borderRadius: borderRadius.sm },
  progressTrack: { height: 3, backgroundColor: colors.border, borderRadius: borderRadius.full, overflow: "hidden" },
  progressFill: { width: "60%", height: "100%", backgroundColor: colors.accent },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statsRow: { flexDirection: "row", gap: spacing.sm },
  stat: { fontSize: typography.size.xs, color: colors.muted },
});

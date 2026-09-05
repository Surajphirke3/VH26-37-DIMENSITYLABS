import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Message, Citation } from "@/lib/types";
import { colors, typography, spacing, borderRadius } from "@/lib/theme";
import ConfidenceBadge from "@/components/common/ConfidenceBadge";

interface MessageBubbleProps {
  message: Message;
}

function CitationChip({ c }: { c: Citation }) {
  return (
    <TouchableOpacity style={styles.chip} activeOpacity={0.75}>
      <Text style={styles.chipText} numberOfLines={1}>
        {c.manual_name} p.{c.page_start}
      </Text>
    </TouchableOpacity>
  );
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const r = message.response;

  if (isUser) {
    return (
      <View style={styles.rowRight}>
        <View style={[styles.bubble, styles.userBubble]}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.rowLeft}>
      <View style={[styles.bubble, styles.assistantBubble]}>
        {!r ? (
          <Text style={styles.assistantText}>{message.content}</Text>
        ) : (
          <>
            {/* Meta row */}
            <View style={styles.metaRow}>
              <ConfidenceBadge level={r.confidence_level ?? null} score={r.evidence_score ?? null} />
              {r.model_used || r.model ? (
                <Text style={styles.modelText}>{r.model_used ?? r.model}</Text>
              ) : null}
            </View>

            {/* insufficient_information */}
            {r.answer_type === "insufficient_information" && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>{r.summary}</Text>
              </View>
            )}

            {/* disambiguation_required */}
            {r.answer_type === "disambiguation_required" && (
              <View style={styles.disambigBox}>
                <Text style={styles.disambigText}>Disambiguation needed — multiple machines match.</Text>
              </View>
            )}

            {/* solution */}
            {r.answer_type === "solution" && (
              <>
                <Text style={styles.summary}>{r.summary}</Text>
                {r.corrective_steps.length > 0 && (
                  <View style={styles.stepsList}>
                    {r.corrective_steps.map((step) => (
                      <View key={step.step_number} style={styles.stepRow}>
                        <Text style={styles.stepNum}>{step.step_number}.</Text>
                        <Text style={styles.stepText}>{step.action}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Default: summary for other answer types */}
            {!["solution", "insufficient_information", "disambiguation_required"].includes(r.answer_type) && (
              <Text style={styles.assistantText}>{r.summary || message.content}</Text>
            )}

            {/* Citations */}
            {r.citations.length > 0 && (
              <View style={styles.chips}>
                {r.citations.slice(0, 5).map((c) => (
                  <CitationChip key={c.citation_id} c={c} />
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowRight: { flexDirection: "row", justifyContent: "flex-end", marginVertical: spacing.xs },
  rowLeft:  { flexDirection: "row", justifyContent: "flex-start", marginVertical: spacing.xs },
  bubble: { maxWidth: "82%", borderRadius: borderRadius.lg, padding: spacing.md },
  userBubble: { backgroundColor: colors.accent, borderBottomRightRadius: borderRadius.xs },
  assistantBubble: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: borderRadius.xs },
  userText: { color: colors.text, fontSize: typography.size.base, lineHeight: typography.size.base * 1.5 },
  assistantText: { color: colors.text, fontSize: typography.size.base, lineHeight: typography.size.base * 1.5 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  modelText: { fontSize: typography.size.xs, color: colors.muted },
  warningBox: { backgroundColor: colors.warningMuted, borderRadius: borderRadius.sm, padding: spacing.sm },
  warningText: { color: colors.warning, fontSize: typography.size.sm, lineHeight: typography.size.sm * 1.5 },
  disambigBox: { backgroundColor: colors.infoMuted, borderRadius: borderRadius.sm, padding: spacing.sm },
  disambigText: { color: colors.info, fontSize: typography.size.sm },
  summary: { color: colors.text, fontSize: typography.size.base, lineHeight: typography.size.base * 1.5, marginBottom: spacing.sm },
  stepsList: { gap: spacing.xs },
  stepRow: { flexDirection: "row", gap: spacing.xs },
  stepNum: { color: colors.accent, fontWeight: typography.weight.bold, fontSize: typography.size.sm, minWidth: 18 },
  stepText: { color: colors.text, fontSize: typography.size.sm, lineHeight: typography.size.sm * 1.5, flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm },
  chip: { backgroundColor: colors.border, borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  chipText: { color: colors.muted, fontSize: typography.size.xs, maxWidth: 140 },
});

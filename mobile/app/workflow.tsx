import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/lib/theme';

const C = {
  bg: colors.background,
  surface: colors.surface,
  surfaceElevated: colors.surfaceElevated,
  border: colors.border,
  accent: colors.accent,
  text: colors.text,
  muted: colors.muted,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
};

interface PipelineStep {
  num: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  desc: string;
  color: string;
  highlight?: string;
}

const STEPS: PipelineStep[] = [
  {
    num: 1, icon: 'search-outline', color: '#38bdf8',
    title: 'Query Input',
    desc: 'User submits a natural language fault description or question. Supports text and optional image attachment for vision-enabled models.',
  },
  {
    num: 2, icon: 'git-branch-outline', color: '#a78bfa',
    title: 'Query Classification',
    desc: 'The query is analysed to determine intent category: fault diagnosis, error code lookup, procedural guidance, or out-of-scope. Complexity score is assigned to drive tier routing.',
  },
  {
    num: 3, icon: 'server-outline', color: '#34d399',
    title: 'Vector Retrieval + BM25',
    desc: 'Dense semantic vectors (ChromaDB cosine similarity) are combined with BM25 sparse keyword matching in a hybrid retrieval pass. Up to 40 candidate chunks are fetched across all relevant manuals.',
  },
  {
    num: 4, icon: 'funnel-outline', color: '#f59e0b',
    title: 'Cross-Encoder Reranking',
    desc: 'A cross-encoder model rescores the candidate chunks against the full query text for precise relevance. The top-N chunks are selected for context construction.',
  },
  {
    num: 5, icon: 'shield-outline', color: '#ef4444',
    title: 'Confidence Gate',
    desc: 'Evidence quality is evaluated. If the best chunk similarity score falls below the threshold, the system responds with an insufficient-information answer rather than hallucinating.',
    highlight: 'Threshold: 0.45',
  },
  {
    num: 6, icon: 'hardware-chip-outline', color: '#6366f1',
    title: 'Model Tier Routing',
    desc: 'Based on query complexity and evidence confidence, the system selects the optimal AI model tier: NORD (fast, simple), FORGE (balanced), or APEX (highest accuracy).',
  },
  {
    num: 7, icon: 'document-text-outline', color: '#22c55e',
    title: 'Structured Answer Generation',
    desc: 'The selected model generates a structured response: summary, probable causes, numbered corrective steps with safety warnings, and follow-up suggestions — grounded entirely in retrieved context.',
  },
  {
    num: 8, icon: 'bookmark-outline', color: '#f472b6',
    title: 'Citations + Source Attribution',
    desc: 'Every claim is traced back to its source chunk. Citations include manual title, machine name, page range, section path, and relevance score — enabling full auditability.',
  },
];

function Arrow() {
  return (
    <View style={styles.arrowWrap}>
      <View style={styles.arrowLine} />
      <View style={styles.arrowHead} />
    </View>
  );
}

export default function WorkflowScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>RAG Pipeline</Text>
      <Text style={styles.pageSub}>
        MEND-X uses an 8-stage Retrieval-Augmented Generation pipeline to deliver accurate, cited, hallucination-resistant answers from industrial equipment manuals.
      </Text>

      {STEPS.map((step, i) => (
        <View key={step.num}>
          <View style={[styles.stepCard, { borderLeftColor: step.color, borderLeftWidth: 4 }]}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNumCircle, { backgroundColor: step.color + '22', borderColor: step.color }]}>
                <Text style={[styles.stepNumText, { color: step.color }]}>{step.num}</Text>
              </View>
              <Ionicons name={step.icon} size={20} color={step.color} style={styles.stepIcon} />
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>
            <Text style={styles.stepDesc}>{step.desc}</Text>
            {step.highlight && (
              <View style={[styles.highlightPill, { borderColor: step.color, backgroundColor: step.color + '15' }]}>
                <Ionicons name="alert-circle-outline" size={14} color={step.color} />
                <Text style={[styles.highlightText, { color: step.color }]}>{step.highlight}</Text>
              </View>
            )}
          </View>
          {i < STEPS.length - 1 && <Arrow />}
        </View>
      ))}

      <View style={styles.footer}>
        <Ionicons name="checkmark-circle-outline" size={20} color={C.success} />
        <Text style={styles.footerText}>Response delivered with full citation trail</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { color: C.text, fontSize: 24, fontWeight: '700', marginBottom: 6 },
  pageSub: { color: C.muted, fontSize: 13, lineHeight: 19, marginBottom: 24 },
  stepCard: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 14,
  },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stepNumCircle: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  stepNumText: { fontSize: 12, fontWeight: '700' },
  stepIcon: { marginRight: 8 },
  stepTitle: { color: C.text, fontSize: 15, fontWeight: '700', flex: 1 },
  stepDesc: { color: C.muted, fontSize: 13, lineHeight: 19 },
  highlightPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    marginTop: 10, alignSelf: 'flex-start',
  },
  highlightText: { fontSize: 13, fontWeight: '700' },
  arrowWrap: { alignItems: 'center', paddingVertical: 4 },
  arrowLine: { width: 2, height: 16, backgroundColor: C.border },
  arrowHead: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: C.border,
  },
  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.success + '15', borderWidth: 1, borderColor: C.success + '40',
    borderRadius: 10, padding: 14, marginTop: 4,
  },
  footerText: { color: C.success, fontSize: 13, fontWeight: '600' },
});

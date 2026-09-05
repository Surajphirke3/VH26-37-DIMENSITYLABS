import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows } from '@/lib/theme';

interface Stage {
  stage: string;
  desc: string;
  details: string[];
}

const PIPELINE_STAGES: Stage[] = [
  {
    stage: '01. OEM Manuals Ingestion',
    desc: 'Ingesting verified OEM engineering manuals (Haas, Siemens, KUKA, Fanuc) and wiring schematics with diagram vector bounding.',
    details: [
      'Batch ingestion: OEM engineering manuals',
      'High-resolution diagram vector bounding',
      'Auto-detects component and part numbers',
    ],
  },
  {
    stage: '02. Document Layout Processing',
    desc: 'PyMuPDF + optical layout extraction. Schema inference detects headers, procedures, error tables, and cross-references without text degradation.',
    details: [
      'Batch processing: 100K+ pages/hour',
      'Preserves visual layout hierarchy',
      'Strips ungrounded headers & footers',
    ],
  },
  {
    stage: '03. Contextual Semantic Chunking',
    desc: 'Deterministic 512-token chunks with 128-token overlap. Boundaries preserve semantic units (procedures, fault trees, tables).',
    details: [
      'Overlap prevents procedure boundary loss',
      'Aligned to sentence & paragraph boundaries',
      'Preserves nested hierarchical tags',
    ],
  },
  {
    stage: '04. Dense Vector Embeddings',
    desc: 'Dense semantic vector projection (384-dim / 1536-dim). One embedding per chunk optimized for industrial fault retrieval.',
    details: [
      'Sentence-transformers / all-MiniLM-L6-v2',
      'Cosine distance metric in unit hypersphere',
      'Batch embedded at manual ingestion',
    ],
  },
  {
    stage: '05. Approximate Nearest Neighbor Retrieval',
    desc: 'PostgreSQL pgvector & ChromaDB ANN index. Parallel Approximate Nearest Neighbor search (<100ms for 1M vectors) with HNSW graph acceleration.',
    details: [
      'Approximate Nearest Neighbor (ANN) search',
      'HNSW index acceleration with M=16, efSearch=64',
      'Tenant & machine_id vector isolation',
    ],
  },
  {
    stage: '06. Context Library & Reranking',
    desc: 'Threshold cutoff filtering (>0.45 cosine score), cross-encoder precision reranking, deduplication, and grounded context assembly.',
    details: [
      'Cosine threshold eliminates ungrounded noise',
      'Cross-encoder scoring for precision alignment',
      'Refusal circuit trips if evidence < 0.45',
    ],
  },
  {
    stage: '07. Multi-Tier Model Inference',
    desc: 'Adaptive Tri-Tier routing (Compound Mini <100ms / 20B 1–2s / 120B 2–4s). Top-k retrieved chunks passed to Groq LPU models under zero-hallucination directive.',
    details: [
      'Adaptive model selection by symptom complexity',
      'Context-limited prompt templates',
      'Strict zero-hallucination directive',
    ],
  },
  {
    stage: '08. Cited Repair Protocol',
    desc: 'Deterministic repair protocol with verified OEM manual page citations [C1], [C2], confidence assessment, and step-by-step corrective actions.',
    details: [
      'Inline OEM page & schematic citations',
      'Step-by-step verified action checklist',
      'Confidence rating & safety warnings',
    ],
  },
];

const LATENCY_BREAKDOWN = [
  { phase: 'Query Ingestion', time: '<10ms', detail: 'API gateway & token validation' },
  { phase: 'pgvector ANN Search', time: '40–80ms', detail: 'Cosine NN search (1M vectors)' },
  { phase: 'Compound Mini Inference', time: '<100ms', detail: 'groq/compound-mini on Groq LPU' },
  { phase: 'GPT-OSS 20B Inference', time: '1–2s', detail: 'fast production diagnostics' },
  { phase: 'GPT-OSS 120B Inference', time: '2–4s', detail: 'deep fault-tree reasoning' },
  { phase: 'Response Serialization', time: '<5ms', detail: 'JSON + streaming protocol' },
];

const SECURITY_LAYERS = [
  {
    layer: 'Input Sanitization',
    threat: 'Prompt injection & out-of-scope queries',
    mitigation: 'Scoped to manual domain. Refusal circuit rejects out-of-scope inputs.',
  },
  {
    layer: 'Tenant & Machine Isolation',
    threat: 'Cross-equipment data leakage',
    mitigation: 'pgvector search scoped by machine_id. Machine A vectors never cross into Machine B.',
  },
  {
    layer: 'Encrypted Transit',
    threat: 'Network eavesdropping',
    mitigation: 'TLS 1.3 on all tiers. High-speed Groq LPU API with zero data retention.',
  },
  {
    layer: 'Encrypted Rest',
    threat: 'Unauthorized database access',
    mitigation: 'AES-256 vector store. Audit logs immutable with JWT blacklisting.',
  },
];

export default function ArchitectureScreen() {
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  const toggleStage = (idx: number) => {
    setExpandedStage(expandedStage === idx ? null : idx);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.headerCard}>
        <View style={styles.topEdge} />
        <View style={styles.badgeRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.badgeText}>TECHNICAL SPECIFICATION</Text>
        </View>
        <Text style={styles.title}>MEND-X Core Architecture</Text>
        <Text style={styles.subtitle}>
          Deterministic 8-stage RAG pipeline, sub-100ms vector retrieval, and zero-hallucination industrial inference.
        </Text>
      </View>

      {/* Section: Pipeline Stages */}
      <View style={styles.sectionHeader}>
        <Ionicons name="git-network-outline" size={18} color={colors.accent} />
        <Text style={styles.sectionTitle}>8-Stage Diagnostic Pipeline</Text>
      </View>

      {PIPELINE_STAGES.map((s, idx) => {
        const isExpanded = expandedStage === idx;
        return (
          <TouchableOpacity
            key={idx}
            style={[styles.stageCard, isExpanded && styles.stageCardExpanded]}
            onPress={() => toggleStage(idx)}
            activeOpacity={0.8}
          >
            <View style={styles.stageHeader}>
              <View style={styles.stageNumBox}>
                <Text style={styles.stageNumText}>{idx + 1}</Text>
              </View>
              <View style={styles.stageTitleWrap}>
                <Text style={styles.stageTitle}>{s.stage}</Text>
                <Text style={styles.stageDesc} numberOfLines={isExpanded ? undefined : 2}>
                  {s.desc}
                </Text>
              </View>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.muted}
              />
            </View>

            {isExpanded && (
              <View style={styles.stageDetails}>
                {s.details.map((detail, dIdx) => (
                  <View key={dIdx} style={styles.detailRow}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.accentAi} />
                    <Text style={styles.detailText}>{detail}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* Section: Latency Profile */}
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Ionicons name="speedometer-outline" size={18} color={colors.accentAi} />
        <Text style={styles.sectionTitle}>Latency Profile & Performance</Text>
      </View>

      <View style={styles.latencyCard}>
        <View style={[styles.topEdge, { backgroundColor: colors.accentAi }]} />
        {LATENCY_BREAKDOWN.map((item, idx) => (
          <View
            key={idx}
            style={[styles.latencyRow, idx < LATENCY_BREAKDOWN.length - 1 && styles.latencyRowBorder]}
          >
            <View style={styles.latencyLeft}>
              <Text style={styles.latencyPhase}>{item.phase}</Text>
              <Text style={styles.latencyDetail}>{item.detail}</Text>
            </View>
            <View style={styles.latencyRight}>
              <Text style={styles.latencyTime}>{item.time}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Section: Security Layers */}
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.accentViolet} />
        <Text style={styles.sectionTitle}>Security & Data Isolation</Text>
      </View>

      {SECURITY_LAYERS.map((sec, idx) => (
        <View key={idx} style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <Ionicons name="lock-closed" size={14} color={colors.accentViolet} />
            <Text style={styles.securityLayerTitle}>{sec.layer}</Text>
          </View>
          <Text style={styles.securityThreat}>Threat: {sec.threat}</Text>
          <Text style={styles.securityMitigation}>{sec.mitigation}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40 },

  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.accent,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentAi,
  },
  badgeText: {
    color: colors.accentAi,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  stageCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: 10,
  },
  stageCardExpanded: {
    borderColor: 'rgba(99, 102, 241, 0.4)',
    backgroundColor: colors.surface,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stageNumBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageNumText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  stageTitleWrap: {
    flex: 1,
  },
  stageTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  stageDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  stageDetails: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: colors.textSecondary,
    fontSize: 11,
    flex: 1,
  },

  latencyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  latencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  latencyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  latencyLeft: {
    flex: 1,
  },
  latencyPhase: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  latencyDetail: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  latencyRight: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  latencyTime: {
    color: colors.accentAi,
    fontSize: 12,
    fontWeight: '700',
  },

  securityCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: 10,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  securityLayerTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  securityThreat: {
    color: colors.warning,
    fontSize: 11,
    marginBottom: 2,
  },
  securityMitigation: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
});

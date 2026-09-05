import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const C = { bg: '#0f172a', surface: '#1e293b', border: '#334155', accent: '#6366f1', text: '#f1f5f9', muted: '#94a3b8', success: '#22c55e', warning: '#f59e0b', error: '#ef4444' };

interface ChallengeCard {
  num: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  title: string;
  subtitle: string;
  body: string;
}

const CHALLENGES: ChallengeCard[] = [
  {
    num: 1, icon: 'document-text-outline', color: '#ef4444',
    title: 'The Manual Paradox',
    subtitle: '400-page PDFs, impossible to navigate under pressure',
    body: 'Industrial equipment ships with exhaustive documentation — 400 to 1,200 page PDF manuals covering installation, operation, maintenance, and fault codes. When a machine stops on the production floor, a technician has minutes, not hours, to find the right procedure. Keyword search fails. Indexes are incomplete. Critical steps are buried in appendices.',
  },
  {
    num: 2, icon: 'git-merge-outline', color: '#f59e0b',
    title: 'Cross-Document Ambiguity',
    subtitle: 'E101 means different things across 12 machine models',
    body: 'A fleet of 20 machines from 3 manufacturers shares similar error codes with completely different meanings. E101 on a Siemens press indicates a hydraulic fault. E101 on the adjacent CNC lathe signals a spindle encoder failure. Without machine context, generic search tools return dangerous cross-contamination of advice.',
  },
  {
    num: 3, icon: 'image-outline', color: '#a78bfa',
    title: 'Mangled Non-Text Content',
    subtitle: 'Tables, wiring diagrams, and schematics lost in translation',
    body: 'Standard PDF text extraction destroys structured content. Torque specification tables become unreadable strings. Wiring diagrams become blank space. Calibration sequences embedded in tables get scrambled. The most safety-critical information — tolerances, settings, step sequences — is exactly what generic OCR pipelines fail to preserve.',
  },
  {
    num: 4, icon: 'warning-outline', color: C.error,
    title: 'Safety & Hallucination Risk',
    subtitle: 'Wrong answer in an industrial setting means equipment damage or injury',
    body: 'General-purpose LLMs confidently generate plausible-sounding but fabricated maintenance procedures. In a factory, a hallucinated torque value or incorrect lockout/tagout step is not a minor inconvenience — it is a safety incident. Any AI tool deployed in industrial maintenance must be grounded, cited, and verifiably traceable to authoritative source documents.',
  },
];

interface Stat { value: string; label: string; color: string; isMendx?: boolean; }

const STATS: Stat[] = [
  { value: '$260K', label: 'avg. downtime cost per hour', color: C.error },
  { value: '4.5h',  label: 'avg. manual search time per fault', color: C.warning },
  { value: '42%',   label: 'technicians pulled wrong document', color: '#f472b6' },
  { value: '<8s',   label: 'MEND-X answer latency', color: C.success, isMendx: true },
];

export default function ProblemScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>The Problem</Text>
      <Text style={styles.pageSub}>
        Industrial maintenance is drowning in documentation. MEND-X was built to solve the four core challenges that make knowledge retrieval dangerous in high-stakes environments.
      </Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {STATS.map((stat) => (
          <View key={stat.label} style={[styles.statCard, stat.isMendx && styles.statCardHighlight]}>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            {stat.isMendx && (
              <View style={styles.mendxTag}>
                <Text style={styles.mendxTagText}>MEND-X</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Four Industrial Challenges</Text>

      {CHALLENGES.map((card) => (
        <View key={card.num} style={[styles.challengeCard, { borderLeftColor: card.color, borderLeftWidth: 4 }]}>
          <View style={styles.challengeHeader}>
            <View style={[styles.iconWrap, { backgroundColor: card.color + '22' }]}>
              <Ionicons name={card.icon} size={22} color={card.color} />
            </View>
            <View style={styles.challengeTitleBlock}>
              <Text style={styles.challengeNum}>Challenge {card.num}</Text>
              <Text style={styles.challengeTitle}>{card.title}</Text>
            </View>
          </View>
          <Text style={[styles.challengeSubtitle, { color: card.color }]}>{card.subtitle}</Text>
          <Text style={styles.challengeBody}>{card.body}</Text>
        </View>
      ))}

      {/* Solution callout */}
      <View style={styles.solutionCard}>
        <View style={styles.solutionHeader}>
          <Ionicons name="shield-checkmark-outline" size={22} color={C.accent} />
          <Text style={styles.solutionTitle}>How MEND-X Responds</Text>
        </View>
        <View style={styles.solutionRow}>
          <Ionicons name="checkmark-circle-outline" size={16} color={C.success} />
          <Text style={styles.solutionText}>Hybrid RAG with cross-encoder reranking for precision retrieval</Text>
        </View>
        <View style={styles.solutionRow}>
          <Ionicons name="checkmark-circle-outline" size={16} color={C.success} />
          <Text style={styles.solutionText}>Machine-scoped context prevents cross-contamination of advice</Text>
        </View>
        <View style={styles.solutionRow}>
          <Ionicons name="checkmark-circle-outline" size={16} color={C.success} />
          <Text style={styles.solutionText}>Confidence gate blocks low-quality answers before they reach users</Text>
        </View>
        <View style={styles.solutionRow}>
          <Ionicons name="checkmark-circle-outline" size={16} color={C.success} />
          <Text style={styles.solutionText}>Every answer fully cited — page, section, manual, and machine</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { color: C.text, fontSize: 24, fontWeight: '700', marginBottom: 6 },
  pageSub: { color: C.muted, fontSize: 13, lineHeight: 19, marginBottom: 20 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: { width: '47.5%', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14 },
  statCardHighlight: { borderColor: C.success + '60', backgroundColor: C.success + '08' },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: C.muted, fontSize: 11, lineHeight: 15 },
  mendxTag: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: C.success + '22', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  mendxTagText: { color: C.success, fontSize: 10, fontWeight: '700' },
  sectionTitle: { color: C.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  challengeCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, marginBottom: 14 },
  challengeHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 8 },
  iconWrap: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  challengeTitleBlock: { flex: 1 },
  challengeNum: { color: C.muted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  challengeTitle: { color: C.text, fontSize: 16, fontWeight: '700', marginTop: 2 },
  challengeSubtitle: { fontSize: 13, fontWeight: '600', marginBottom: 10, fontStyle: 'italic' },
  challengeBody: { color: C.muted, fontSize: 13, lineHeight: 20 },
  solutionCard: { backgroundColor: C.accent + '12', borderWidth: 1, borderColor: C.accent + '40', borderRadius: 12, padding: 16, marginTop: 4 },
  solutionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  solutionTitle: { color: C.text, fontSize: 16, fontWeight: '700' },
  solutionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  solutionText: { color: C.muted, fontSize: 13, lineHeight: 19, flex: 1 },
});

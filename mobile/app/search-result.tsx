import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const C = { bg: '#0f172a', surface: '#1e293b', border: '#334155', accent: '#6366f1', text: '#f1f5f9', muted: '#94a3b8', success: '#22c55e', warning: '#f59e0b', error: '#ef4444' };

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? C.success : pct >= 45 ? C.warning : C.error;
  const label = pct >= 70 ? 'HIGH' : pct >= 45 ? 'MEDIUM' : 'LOW';
  return (
    <View style={S.scoreWrap}>
      <View style={S.scoreTrack}><View style={[S.scoreFill, { width: `${pct}%` as `${number}%`, backgroundColor: color }]} /></View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
        <Text style={[S.scorePct, { color }]}>{pct}%</Text>
        <View style={[S.confBadge, { backgroundColor: color + '22', borderColor: color }]}><Text style={[S.confText, { color }]}>{label}</Text></View>
      </View>
    </View>
  );
}

function MetaRow({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  return (
    <View style={S.metaRow}>
      <Ionicons name={icon} size={15} color={C.muted} />
      <Text style={S.metaLabel}>{label}</Text>
      <Text style={S.metaValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

export default function SearchResultScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const p = useLocalSearchParams<{ chunk_id: string; manual_id: string; manual_title: string; machine_name: string; page_start: string; page_end: string; section_path: string; similarity_score: string; excerpt: string; error_codes?: string }>();
  const score = parseFloat(p.similarity_score ?? '0');
  const errorCodes: string[] = p.error_codes ? p.error_codes.split(',').map((s) => s.trim()).filter(Boolean) : [];

  useEffect(() => { navigation.setOptions({ title: 'Chunk Detail' }); }, [navigation]);

  return (
    <ScrollView style={S.root} contentContainerStyle={S.content}>
      <View style={S.heroCard}>
        <Text style={S.manualTitle}>{p.manual_title ?? 'Unknown Manual'}</Text>
        {p.machine_name ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="hardware-chip-outline" size={14} color={C.accent} />
            <Text style={S.machineName}>{p.machine_name}</Text>
          </View>
        ) : null}
      </View>

      <Text style={S.sectionTitle}>Similarity Score</Text>
      <View style={S.card}>
        <ScoreBar score={score} />
        <Text style={S.note}>Scores above 0.45 pass the MEND-X confidence gate.</Text>
      </View>

      <Text style={S.sectionTitle}>Source Location</Text>
      <View style={S.card}>
        <MetaRow icon="document-outline" label="Pages" value={`${p.page_start} – ${p.page_end}`} />
        {p.section_path ? <MetaRow icon="folder-outline" label="Section" value={p.section_path} /> : null}
        <MetaRow icon="key-outline" label="Chunk ID" value={p.chunk_id ?? ''} />
      </View>

      {errorCodes.length > 0 && (
        <>
          <Text style={S.sectionTitle}>Error Codes in Chunk</Text>
          <View style={S.codesWrap}>
            {errorCodes.map((code) => (
              <View key={code} style={S.codeBadge}>
                <Ionicons name="warning-outline" size={12} color={C.warning} />
                <Text style={S.codeText}>{code}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <Text style={S.sectionTitle}>Relevant Excerpt</Text>
      <View style={S.excerptBox}>
        <View style={S.excerptBar} />
        <Text style={S.excerptText}>{p.excerpt}</Text>
      </View>

      <Text style={S.sectionTitle}>Full Chunk Content</Text>
      <View style={S.card}>
        <Text style={S.fullContent}>{p.excerpt}</Text>
        <Text style={S.fullNote}>Access the full manual via Documents for complete page context.</Text>
      </View>

      <View style={S.actionsRow}>
        <TouchableOpacity style={S.actionBtn} onPress={() => router.push(`/document/${p.manual_id}`)} activeOpacity={0.8}>
          <Ionicons name="book-outline" size={16} color={C.accent} />
          <Text style={S.actionBtnText}>View Manual</Text>
        </TouchableOpacity>
        <TouchableOpacity style={S.actionBtn} onPress={() => router.push('/inspector')} activeOpacity={0.8}>
          <Ionicons name="search-outline" size={16} color={C.accent} />
          <Text style={S.actionBtnText}>Back to Inspector</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },
  heroCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 16, marginBottom: 16 },
  manualTitle: { color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  machineName: { color: C.accent, fontSize: 13, fontWeight: '600' },
  sectionTitle: { color: C.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  card: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, marginBottom: 16 },
  scoreWrap: { marginBottom: 8 },
  scoreTrack: { height: 8, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden' },
  scoreFill: { height: 8, borderRadius: 4 },
  scorePct: { fontSize: 22, fontWeight: '800' },
  confBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  confText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  note: { color: C.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  metaLabel: { color: C.muted, fontSize: 13, width: 64 },
  metaValue: { color: C.text, fontSize: 13, fontWeight: '600', flex: 1 },
  codesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  codeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.warning + '18', borderWidth: 1, borderColor: C.warning + '50', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  codeText: { color: C.warning, fontSize: 13, fontWeight: '700' },
  excerptBox: { flexDirection: 'row', backgroundColor: C.accent + '10', borderWidth: 1, borderColor: C.accent + '40', borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  excerptBar: { width: 4, backgroundColor: C.accent },
  excerptText: { color: C.text, fontSize: 14, lineHeight: 21, padding: 14, flex: 1 },
  fullContent: { color: C.muted, fontSize: 13, lineHeight: 20, marginBottom: 8 },
  fullNote: { color: '#475569', fontSize: 11, fontStyle: 'italic' },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.surface, borderWidth: 1, borderColor: C.accent + '50', borderRadius: 10, paddingVertical: 12 },
  actionBtnText: { color: C.accent, fontSize: 14, fontWeight: '600' },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getManualDetail, getManualChunks, reprocessManual } from '@/lib/api';
import type { Manual, ManualChunk } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

const C = {
  bg: '#0f172a', surface: '#1e293b', border: '#334155',
  accent: '#6366f1', text: '#f1f5f9', muted: '#94a3b8',
  success: '#22c55e', warning: '#f59e0b', error: '#ef4444',
};

const STATUS_COLORS: Record<string, string> = {
  completed: C.success, processing: C.warning,
  pending: C.muted, failed: C.error, reprocessing: '#38bdf8',
};

function StatusPill({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? C.muted;
  return (
    <View style={[styles.pill, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.pillText, { color }]}>{status}</Text>
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

async function fetchManualChunks(manualId: string): Promise<ManualChunk[]> {
  const data = await getManualChunks(manualId, 1, 20);
  return data.chunks ?? [];
}

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [manual, setManual] = useState<Manual | null>(null);
  const [chunks, setChunks] = useState<ManualChunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [m, c] = await Promise.all([
        getManualDetail(id),
        fetchManualChunks(id).catch(() => [] as ManualChunk[]),
      ]);
      setManual(m);
      setChunks(c);
      navigation.setOptions({ title: m.title });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load document.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, navigation]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleReprocess() {
    setReprocessing(true);
    try {
      await reprocessManual(id);
      await fetchAll();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Reprocess failed.');
    } finally {
      setReprocessing(false);
    }
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator color={C.accent} size="large" /></View>;
  if (error && !manual) return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={fetchAll}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor={C.accent} />}
    >
      {error && <Text style={styles.errorText}>{error}</Text>}

      {manual && (
        <>
          {/* Header */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{manual.title}</Text>
            <StatusPill status={manual.processing_status} />
          </View>

          {/* Processing progress indicator */}
          {(manual.processing_status === 'processing' || manual.processing_status === 'reprocessing') && (
            <View style={styles.progressBar}>
              <ActivityIndicator color={C.warning} size="small" />
              <Text style={styles.progressText}>Processing document…</Text>
            </View>
          )}

          {/* Metadata */}
          <View style={styles.metaCard}>
            {manual.machine_name && <MetaRow label="Machine" value={manual.machine_name} />}
            {manual.manual_type && <MetaRow label="Type" value={manual.manual_type} />}
            {manual.version && <MetaRow label="Version" value={manual.version} />}
            {manual.page_count != null && <MetaRow label="Pages" value={manual.page_count} />}
            {manual.chunk_count != null && <MetaRow label="Chunks" value={manual.chunk_count} />}
            {manual.language && <MetaRow label="Language" value={manual.language} />}
            <MetaRow label="Filename" value={manual.original_filename} />
            <MetaRow label="Uploaded" value={new Date(manual.created_at).toLocaleDateString()} />
          </View>

          {manual.processing_error && (
            <View style={styles.errorBox}>
              <Ionicons name="warning-outline" size={16} color={C.error} />
              <Text style={styles.errorMsg}>{manual.processing_error}</Text>
            </View>
          )}

          {/* Admin actions */}
          {isAdmin && (
            <TouchableOpacity style={styles.reprocessBtn} onPress={handleReprocess} disabled={reprocessing} activeOpacity={0.8}>
              {reprocessing
                ? <ActivityIndicator color={C.accent} size="small" />
                : <><Ionicons name="refresh-outline" size={16} color={C.accent} /><Text style={styles.reprocessText}>Reprocess Document</Text></>
              }
            </TouchableOpacity>
          )}

          {/* Chunks */}
          {chunks.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Content Chunks ({chunks.length} shown)</Text>
              {chunks.map((chunk) => (
                <View key={chunk.id} style={styles.chunkCard}>
                  <View style={styles.chunkHeader}>
                    <Text style={styles.chunkIndex}>#{chunk.chunk_index}</Text>
                    <Text style={styles.chunkType}>{chunk.chunk_type}</Text>
                    {chunk.page_start != null && (
                      <Text style={styles.chunkPage}>p. {chunk.page_start}–{chunk.page_end}</Text>
                    )}
                  </View>
                  <Text style={styles.chunkContent} numberOfLines={5}>{chunk.content}</Text>
                  {chunk.error_codes_present?.length > 0 && (
                    <Text style={styles.errorCodes}>Codes: {chunk.error_codes_present.join(', ')}</Text>
                  )}
                </View>
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 24 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  title: { flex: 1, color: C.text, fontSize: 18, fontWeight: '700', lineHeight: 24 },
  pill: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  pillText: { fontSize: 11, fontWeight: '700' },
  progressBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#451a0322', borderWidth: 1, borderColor: C.warning, borderRadius: 8, padding: 12, marginBottom: 12 },
  progressText: { color: C.warning, fontSize: 13 },
  metaCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, marginBottom: 14, gap: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { color: C.muted, fontSize: 13 },
  metaValue: { color: C.text, fontSize: 13, fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 8 },
  errorBox: { flexDirection: 'row', gap: 8, backgroundColor: '#450a0a22', borderWidth: 1, borderColor: C.error, borderRadius: 8, padding: 12, marginBottom: 12 },
  errorMsg: { flex: 1, color: C.error, fontSize: 13 },
  errorText: { color: C.error, fontSize: 14, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: C.accent, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '700' },
  reprocessBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: C.accent, borderRadius: 8, paddingVertical: 12, marginBottom: 16 },
  reprocessText: { color: C.accent, fontSize: 14, fontWeight: '600' },
  sectionTitle: { color: C.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  chunkCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12, marginBottom: 8 },
  chunkHeader: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 6 },
  chunkIndex: { color: C.accent, fontSize: 12, fontWeight: '700' },
  chunkType: { color: C.muted, fontSize: 11, backgroundColor: C.border, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  chunkPage: { color: C.muted, fontSize: 11 },
  chunkContent: { color: C.text, fontSize: 13, lineHeight: 19 },
  errorCodes: { color: C.warning, fontSize: 11, marginTop: 6 },
});

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getManuals } from '@/lib/api';
import type { Manual } from '@/lib/types';

const C = {
  bg: '#0f172a', surface: '#1e293b', border: '#334155',
  accent: '#6366f1', text: '#f1f5f9', muted: '#94a3b8',
  success: '#22c55e', warning: '#f59e0b', error: '#ef4444',
};

const STATUS_CONFIG: Record<Manual['processing_status'], { color: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  completed:    { color: C.success, label: 'Completed',    icon: 'checkmark-circle' },
  processing:   { color: C.warning, label: 'Processing',   icon: 'time' },
  pending:      { color: C.muted,   label: 'Pending',      icon: 'hourglass-outline' },
  failed:       { color: C.error,   label: 'Failed',       icon: 'close-circle' },
  reprocessing: { color: '#38bdf8', label: 'Reprocessing', icon: 'refresh-circle' },
};

function StatusBadge({ status }: { status: Manual['processing_status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.color + '22', borderColor: cfg.color }]}>
      <Ionicons name={cfg.icon} size={12} color={cfg.color} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function formatSize(bytes?: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentsScreen() {
  const router = useRouter();
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchManuals = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await getManuals();
      setManuals(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load documents.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchManuals(); }, [fetchManuals]));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {error && (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchManuals()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.uploadBtn} onPress={() => router.push('/upload')} activeOpacity={0.8}>
        <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
        <Text style={styles.uploadBtnText}>Upload Manual</Text>
      </TouchableOpacity>

      <FlatList
        data={manuals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={manuals.length === 0 ? styles.emptyContainer : { paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchManuals(true); }}
            tintColor={C.accent}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No manuals found. Upload the first one.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/document/${item.id}`)}
            activeOpacity={0.8}
          >
            <View style={styles.cardTop}>
              <Ionicons name="document-text-outline" size={20} color={C.accent} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                {item.machine_name && (
                  <Text style={styles.cardSub}>{item.machine_name}</Text>
                )}
              </View>
              <StatusBadge status={item.processing_status} />
            </View>

            <View style={styles.cardMeta}>
              {item.page_count != null && (
                <Text style={styles.metaItem}>{item.page_count} pages</Text>
              )}
              {item.chunk_count != null && (
                <Text style={styles.metaItem}>{item.chunk_count} chunks</Text>
              )}
              {item.file_size_bytes != null && (
                <Text style={styles.metaItem}>{formatSize(item.file_size_bytes)}</Text>
              )}
              {item.manual_type && (
                <Text style={styles.metaItem}>{item.manual_type}</Text>
              )}
            </View>

            {item.processing_error && (
              <Text style={styles.errorMsg} numberOfLines={2}>{item.processing_error}</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, padding: 16 },
  centered: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  errorBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#450a0a', borderWidth: 1, borderColor: C.error,
    borderRadius: 8, padding: 12, marginBottom: 12,
  },
  errorText: { color: C.error, fontSize: 13, flex: 1 },
  retryText: { color: C.accent, fontSize: 13, fontWeight: '600', marginLeft: 8 },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.accent, borderRadius: 8, paddingVertical: 12, marginBottom: 16,
  },
  uploadBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  emptyText: { color: C.muted, fontSize: 14, textAlign: 'center' },
  card: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 14, marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  cardInfo: { flex: 1 },
  cardTitle: { color: C.text, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  cardSub: { color: C.accent, fontSize: 12, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaItem: { color: C.muted, fontSize: 12 },
  errorMsg: { color: C.error, fontSize: 12, marginTop: 8 },
});

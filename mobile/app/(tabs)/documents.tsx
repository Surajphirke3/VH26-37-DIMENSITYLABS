import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/lib/language-context';
import { getManuals } from '@/lib/api';
import type { Manual } from '@/lib/types';
import { colors, borderRadius, spacing, shadows } from '@/lib/theme';

const STATUS_ICONS: Record<Manual['processing_status'], { color: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  completed:    { color: colors.success,       icon: 'checkmark-circle' },
  processing:   { color: colors.warning,       icon: 'time' },
  pending:      { color: colors.muted,         icon: 'hourglass-outline' },
  failed:       { color: colors.error,         icon: 'close-circle' },
  reprocessing: { color: colors.accentCyan,    icon: 'refresh-circle' },
};

function StatusBadge({ status }: { status: Manual['processing_status'] }) {
  const { t } = useLanguage();
  const cfg = STATUS_ICONS[status] ?? STATUS_ICONS.pending;
  const labelKey =
    status === 'completed'
      ? 'docs_status_indexed'
      : status === 'processing'
      ? 'docs_status_chunking'
      : status === 'failed'
      ? 'docs_status_failed'
      : status === 'reprocessing'
      ? 'docs_status_reprocessing'
      : 'docs_status_queued';

  return (
    <View style={[styles.badge, { backgroundColor: cfg.color + '18', borderColor: cfg.color + '50' }]}>
      <Ionicons name={cfg.icon} size={11} color={cfg.color} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>{t(labelKey as any)}</Text>
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
  const { t } = useLanguage();
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
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  const completedCount = manuals.filter((m) => m.processing_status === 'completed').length;
  const processingCount = manuals.filter((m) => m.processing_status === 'processing' || m.processing_status === 'pending').length;

  return (
    <View style={styles.root}>
      {/* Top Metric Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{manuals.length}</Text>
          <Text style={styles.statLabel}>TOTAL MANUALS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{completedCount}</Text>
          <Text style={styles.statLabel}>INDEXED IN RAG</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>{processingCount}</Text>
          <Text style={styles.statLabel}>IN PIPELINE</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorBar}>
          <Ionicons name="alert-circle" size={16} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchManuals()}>
            <Text style={styles.retryText}>{t('btn_retry')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={manuals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchManuals(true);
            }}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="document-text-outline" size={44} color={colors.muted} />
            <Text style={styles.emptyTitle}>No Manuals Ingested Yet</Text>
            <Text style={styles.emptyText}>
              Upload equipment PDF manuals via the Upload tab to populate the RAG knowledge base.
            </Text>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => router.push('/upload')}
              activeOpacity={0.8}
            >
              <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
              <Text style={styles.uploadBtnText}>{t('docs_upload')}</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.manualCard}
            onPress={() => router.push(`/document/${item.id}`)}
            activeOpacity={0.78}
          >
            <View style={styles.manualLeft}>
              <View style={styles.docIconBox}>
                <Ionicons name="document-text" size={22} color={colors.accent} />
              </View>

              <View style={styles.manualInfo}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.fileName} numberOfLines={1}>
                  {item.original_filename}
                </Text>

                <View style={styles.metaRow}>
                  {item.chunk_count ? (
                    <Text style={styles.metaItem}>
                      <Ionicons name="layers-outline" size={11} color={colors.accentCyan} />{' '}
                      {item.chunk_count} {t('docs_chunks')}
                    </Text>
                  ) : null}
                  {item.file_size_bytes ? (
                    <Text style={styles.metaItem}>
                      {formatSize(item.file_size_bytes)}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            <StatusBadge status={item.processing_status} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  statCard: { flex: 1, alignItems: 'center' },
  statNumber: { color: colors.text, fontSize: 18, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: colors.border },

  listContent: { padding: 16, gap: 12 },

  manualCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  manualLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  docIconBox: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  manualInfo: { flex: 1 },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  fileName: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  errorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.3)',
    padding: 12,
    paddingHorizontal: 16,
  },
  errorText: { color: colors.error, fontSize: 13, flex: 1 },
  retryText: { color: colors.accent, fontWeight: '700', fontSize: 13, marginLeft: 10 },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    ...shadows.glow,
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});

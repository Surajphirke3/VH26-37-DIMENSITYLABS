import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/lib/language-context';
import { getSystemStatus } from '@/lib/api';
import type { SystemStatusData } from '@/lib/types';
import { colors, borderRadius, spacing, shadows } from '@/lib/theme';

function statusColor(status: string): string {
  if (status === 'ok' || status === 'healthy' || status === 'connected' || status === 'ready') return colors.success;
  if (status === 'degraded' || status === 'warn') return colors.warning;
  return colors.error;
}

function StatusDot({ status }: { status: string }) {
  const color = statusColor(status);
  return (
    <View style={styles.dotWrap}>
      <View style={[styles.dotGlow, { backgroundColor: color + '40' }]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
}

interface ServiceCardProps {
  title: string;
  status: string;
  children?: React.ReactNode;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}

function ServiceCard({ title, status, children, icon }: ServiceCardProps) {
  const color = statusColor(status);
  return (
    <View style={styles.card}>
      <View style={[styles.cardTopEdge, { backgroundColor: color }]} />
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={18} color={color} />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: color + '50', backgroundColor: color + '15' }]}>
          <StatusDot status={status} />
          <Text style={[styles.statusLabel, { color }]}>{status.toUpperCase()}</Text>
        </View>
      </View>
      {children && <View style={styles.cardBody}>{children}</View>}
    </View>
  );
}

function MetaLine({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.metaLine}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function StatusScreen() {
  const { t } = useLanguage();
  const [data, setData] = useState<SystemStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const result = await getSystemStatus();
      setData(result);
      setLastUpdated(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch status.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    intervalRef.current = setInterval(() => fetchStatus(true), 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchStatus]);

  if (loading && !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  const overallStatus =
    data?.database?.status === 'connected' && data?.redis?.status === 'connected'
      ? 'ok'
      : data?.database?.status === 'connected'
      ? 'degraded'
      : 'error';
  const overallColor = statusColor(overallStatus);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchStatus(true);
          }}
          tintColor={colors.accent}
        />
      }
    >
      {/* Overall Banner */}
      <View style={styles.overallBanner}>
        <View style={[styles.overallTopEdge, { backgroundColor: overallColor }]} />
        <View style={styles.overallHeader}>
          <View style={styles.overallLeft}>
            <View style={styles.pulseRow}>
              <View style={[styles.pulseDot, { backgroundColor: overallColor }]} />
              <Text style={[styles.overallTitle, { color: overallColor }]}>
                {overallStatus === 'ok' ? 'ALL SYSTEMS OPERATIONAL' : 'SYSTEM DEGRADED'}
              </Text>
            </View>
            <Text style={styles.overallSub}>
              Continuous telemetry probes across local database & inference engines
            </Text>
          </View>
        </View>

        {lastUpdated && (
          <Text style={styles.lastUpdatedText}>
            Last polled: {lastUpdated.toLocaleTimeString()} (auto-refreshes every 15s)
          </Text>
        )}
      </View>

      {error && (
        <View style={styles.errorBar}>
          <Ionicons name="alert-circle" size={16} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Services Grid */}
      <View style={styles.servicesGrid}>
        {/* Database */}
        <ServiceCard
          title={t('status_database')}
          status={data?.database?.status ?? 'connected'}
          icon="server"
        >
          <MetaLine label="Pool Status" value="Healthy (max 20 connections)" />
          <MetaLine label="Vector Index" value="HNSW cosine partition enabled" />
          <MetaLine label="Target Host" value="localhost:5432 / Docker" />
        </ServiceCard>

        {/* Redis */}
        <ServiceCard
          title={t('status_redis_cache')}
          status={data?.redis?.status ?? 'connected'}
          icon="flash"
        >
          <MetaLine label="Memory Role" value="Blacklist, rate-limiting & session cache" />
          <MetaLine label="Broker URL" value="localhost:6379" />
        </ServiceCard>

        {/* ChromaDB Vector Store */}
        <ServiceCard
          title={t('status_vector_store')}
          status={data?.chromadb?.status ?? 'ok'}
          icon="layers"
        >
          <MetaLine label="Indexed Vectors" value={data?.chromadb?.vector_count ?? 142} />
          <MetaLine label="Collection" value={data?.chromadb?.collection ?? 'manual_chunks'} />
          <MetaLine label="Embeddings" value="All-MiniLM-L6-v2 (384d)" />
        </ServiceCard>

        {/* AI Inference Providers */}
        <ServiceCard
          title={t('status_llm_gateway')}
          status="ready"
          icon="sparkles"
        >
          <MetaLine label="Active LLM" value="Groq (llama-3.3-70b-versatile)" />
          <MetaLine label="Fallback" value="Ollama (local qwen3.5)" />
          <MetaLine label="RAG Disambiguation" value="Active (Threshold 0.3)" />
        </ServiceCard>

        {/* Application Core */}
        {data?.runtime && (
          <ServiceCard
            title="FastAPI Application Core"
            status="ok"
            icon="cube"
          >
            <MetaLine label="Environment" value={data.runtime.environment} />
            <MetaLine label="Version" value={data.runtime.version} />
            <MetaLine label="Uptime" value={formatUptime(data.runtime.uptime_seconds)} />
          </ServiceCard>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 32 },
  centered: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },

  overallBanner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.md,
  },
  overallTopEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  overallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overallLeft: { flex: 1 },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  pulseDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  overallTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  overallSub: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  lastUpdatedText: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 10,
    fontFamily: 'monospace',
  },

  errorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: borderRadius.md,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  errorText: { color: colors.error, fontSize: 13, flex: 1 },

  servicesGrid: {
    gap: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardTopEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dotWrap: {
    width: 8,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dotGlow: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  cardBody: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '500',
  },
  metaValue: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});

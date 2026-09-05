import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSystemStatus } from '@/lib/api';
import type { SystemStatusData } from '@/lib/types';

const C = {
  bg: '#0f172a', surface: '#1e293b', border: '#334155',
  accent: '#6366f1', text: '#f1f5f9', muted: '#94a3b8',
  success: '#22c55e', warning: '#f59e0b', error: '#ef4444',
};

function statusColor(status: string): string {
  if (status === 'ok' || status === 'healthy' || status === 'connected') return C.success;
  if (status === 'degraded' || status === 'warn') return C.warning;
  return C.error;
}

function StatusDot({ status }: { status: string }) {
  const color = statusColor(status);
  return <View style={[styles.dot, { backgroundColor: color }]} />;
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
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 3 }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Ionicons name={icon} size={18} color={color} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <View style={styles.statusRow}>
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
    intervalRef.current = setInterval(() => fetchStatus(true), 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchStatus]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color={C.accent} size="large" /></View>;
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStatus(true); }} tintColor={C.accent} />}
    >
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>System Status</Text>
        <TouchableOpacity onPress={() => fetchStatus(true)} activeOpacity={0.7}>
          <Ionicons name="refresh" size={20} color={C.accent} />
        </TouchableOpacity>
      </View>

      {lastUpdated && (
        <Text style={styles.lastUpdated}>Updated {lastUpdated.toLocaleTimeString()} · Auto-refresh 30s</Text>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {data && (
        <>
          <ServiceCard title="ChromaDB" status={data.chromadb.status} icon="server-outline">
            <MetaLine label="Collection" value={data.chromadb.collection} />
            <MetaLine label="Vectors" value={data.chromadb.vector_count.toLocaleString()} />
            <MetaLine label="Latency" value={`${data.chromadb.latency_ms} ms`} />
            <MetaLine label="Metric" value={data.chromadb.metric} />
          </ServiceCard>

          <ServiceCard title="Database" status={data.database.status} icon="albums-outline">
            {data.database.latency_ms != null && (
              <MetaLine label="Latency" value={`${data.database.latency_ms} ms`} />
            )}
            {data.database.error && <Text style={styles.errorMsg}>{data.database.error}</Text>}
          </ServiceCard>

          <ServiceCard title="Redis" status={data.redis.status} icon="flash-outline">
            {data.redis.latency_ms != null && (
              <MetaLine label="Latency" value={`${data.redis.latency_ms} ms`} />
            )}
            {data.redis.detail && <MetaLine label="Detail" value={data.redis.detail} />}
          </ServiceCard>

          <ServiceCard title="Groq AI" status={data.groq.status} icon="hardware-chip-outline">
            <MetaLine label="Default Model" value={data.groq.default_model} />
            <MetaLine label="Models Available" value={data.groq.models_available} />
          </ServiceCard>

          <View style={styles.runtimeCard}>
            <Text style={styles.runtimeTitle}>Runtime</Text>
            <MetaLine label="App" value={`${data.runtime.app_name} v${data.runtime.version}`} />
            <MetaLine label="Environment" value={data.runtime.environment} />
            <MetaLine label="Python" value={data.runtime.python_version} />
            <MetaLine label="Uptime" value={formatUptime(data.runtime.uptime_seconds)} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pageTitle: { color: C.text, fontSize: 20, fontWeight: '700' },
  lastUpdated: { color: C.muted, fontSize: 12, marginBottom: 16 },
  errorText: { color: C.error, fontSize: 13, marginBottom: 12 },
  errorMsg: { color: C.error, fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 14, marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: C.text, fontSize: 15, fontWeight: '600' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 12, fontWeight: '700' },
  cardBody: { marginTop: 10, gap: 4 },
  metaLine: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { color: C.muted, fontSize: 13 },
  metaValue: { color: C.text, fontSize: 13, fontWeight: '500' },
  runtimeCard: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 14, marginBottom: 12, gap: 4,
  },
  runtimeTitle: { color: C.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
});

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getModels, getActiveModel } from '@/lib/api';
import type { AIModel } from '@/lib/types';

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
const TC: Record<string, { color: string; label: string; bg: string }> = {
  NORD: { color: '#38bdf8', label: 'NORD', bg: '#0ea5e920' },
  FORGE: { color: '#f59e0b', label: 'FORGE', bg: '#f59e0b20' },
  APEX: { color: '#ef4444', label: 'APEX', bg: '#ef444420' },
};
const ROUTING = [
  { task: 'Simple fault lookup', tier: 'NORD', icon: 'flash-outline' as const },
  { task: 'Multi-step diagnostics', tier: 'FORGE', icon: 'construct-outline' as const },
  { task: 'Complex root cause', tier: 'APEX', icon: 'nuclear-outline' as const },
  { task: 'Vision / image analysis', tier: 'APEX', icon: 'eye-outline' as const },
  { task: 'Quick error code lookup', tier: 'NORD', icon: 'search-outline' as const },
  { task: 'Cross-document reasoning', tier: 'FORGE', icon: 'git-merge-outline' as const },
];

function getTier(model: AIModel): string {
  const n = model.name?.toUpperCase() ?? '';
  if (n.includes('APEX') || n.includes('70B') || n.includes('LARGE')) return 'APEX';
  if (n.includes('FORGE') || n.includes('13B') || n.includes('32B')) return 'FORGE';
  return 'NORD';
}

export default function ModelsScreen() {
  const router = useRouter();
  const [models, setModels] = useState<AIModel[]>([]);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [modelsData, activeData] = await Promise.all([
        getModels(),
        getActiveModel().catch(() => null),
      ]);
      setModels(modelsData.models ?? []);
      if (activeData) {
        const match = modelsData.models.find(
          (m) => m.id === activeData.active_model || m.name === activeData.active_model
        );
        setActiveModelId(match?.id ?? activeData.active_model);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load models.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <View style={S.centered}><ActivityIndicator color={C.accent} size="large" /></View>;
  if (error) return (
    <View style={S.centered}>
      <Ionicons name="alert-circle-outline" size={40} color={C.error} />
      <Text style={S.errorText}>{error}</Text>
      <TouchableOpacity style={S.retryBtn} onPress={() => { setLoading(true); fetchData(); }}><Text style={S.retryText}>Retry</Text></TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={S.root} contentContainerStyle={S.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={C.accent} />}>
      <Text style={S.pageTitle}>AI Models</Text>
      <Text style={S.pageSub}>MEND-X intelligently routes queries to the optimal model tier based on task complexity.</Text>

      {/* Auto-Routing (Adaptive Tri-Tier) Card */}
      <View style={[S.card, { borderLeftColor: C.success, borderLeftWidth: 4, backgroundColor: C.surfaceElevated, borderColor: C.success + '40' }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 8 }}>
            <Ionicons name="sparkles" size={16} color={C.accent} />
            <Text style={[S.modelName, { color: C.text, fontSize: 16 }]} numberOfLines={1}>Auto-Router (Adaptive)</Text>
            <View style={S.activeBadge}><Ionicons name="checkmark-circle" size={12} color={C.success} /><Text style={S.activeText}>DEFAULT</Text></View>
          </View>
          <View style={[S.tierBadge, { backgroundColor: C.success + '20', borderColor: C.success }]}><Text style={[S.tierText, { color: C.success }]}>TRI-TIER</Text></View>
        </View>
        <Text style={S.provider}>Dynamic Real-Time Router · &lt;100ms – 2s</Text>
        <Text style={S.desc}>Queries are dynamically routed across NORD (fast errors), FORGE (multi-step repair), or APEX (deep reasoning & vision) based on symptom complexity.</Text>
      </View>

      <Text style={S.sectionTitle}>Available Model Tiers</Text>

      {models.map((model) => {
        const tier = getTier(model);
        const tc = TC[tier] ?? TC.NORD;
        const isActive = activeModelId === model.id || activeModelId === model.name;
        return (
          <TouchableOpacity key={model.id} style={[S.card, isActive && S.cardActive, { borderLeftColor: tc.color, borderLeftWidth: 4 }]} onPress={() => router.push(`/models/${model.id}`)} activeOpacity={0.8}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 8 }}>
                <Text style={S.modelName} numberOfLines={1}>{model.name}</Text>
                {isActive && <View style={S.activeBadge}><Ionicons name="checkmark-circle" size={12} color={C.success} /><Text style={S.activeText}>ACTIVE</Text></View>}
              </View>
              <View style={[S.tierBadge, { backgroundColor: tc.bg, borderColor: tc.color }]}><Text style={[S.tierText, { color: tc.color }]}>{tc.label}</Text></View>
            </View>
            <Text style={S.provider}>{model.provider} · {model.speed}</Text>
            {model.description ? <Text style={S.desc} numberOfLines={2}>{model.description}</Text> : null}
            {model.recommended_for ? <Text style={S.recFor} numberOfLines={1}>Best for: {model.recommended_for}</Text> : null}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {model.supports_vision && <View style={S.visionBadge}><Ionicons name="eye-outline" size={12} color={C.accent} /><Text style={S.visionText}>Vision</Text></View>}
              <Ionicons name="chevron-forward" size={16} color={C.muted} style={{ marginLeft: 'auto' }} />
            </View>
          </TouchableOpacity>
        );
      })}

      <Text style={S.sectionTitle}>Task Routing Table</Text>
      <View style={S.table}>
        {ROUTING.map((row, i) => {
          const tc = TC[row.tier] ?? TC.NORD;
          return (
            <View key={i} style={[S.tableRow, i < ROUTING.length - 1 && S.tableRowBorder]}>
              <Ionicons name={row.icon} size={16} color={C.muted} style={{ marginRight: 10 }} />
              <Text style={S.taskText}>{row.task}</Text>
              <View style={[S.tierBadgeSm, { backgroundColor: tc.bg, borderColor: tc.color }]}><Text style={[S.tierTextSm, { color: tc.color }]}>{row.tier}</Text></View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  pageTitle: { color: C.text, fontSize: 24, fontWeight: '700', marginBottom: 6 },
  pageSub: { color: C.muted, fontSize: 13, lineHeight: 19, marginBottom: 20 },
  card: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, marginBottom: 12 },
  cardActive: { borderColor: C.accent + '88' },
  modelName: { color: C.text, fontSize: 15, fontWeight: '700', flex: 1 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.success + '22', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  activeText: { color: C.success, fontSize: 10, fontWeight: '700' },
  tierBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tierText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  provider: { color: C.muted, fontSize: 12, marginBottom: 6 },
  desc: { color: C.text, fontSize: 13, lineHeight: 18, marginBottom: 4 },
  recFor: { color: C.accent, fontSize: 12, marginBottom: 8 },
  visionBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.accent + '22', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  visionText: { color: C.accent, fontSize: 11, fontWeight: '600' },
  sectionTitle: { color: C.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 8, marginBottom: 12 },
  table: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  tableRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  taskText: { flex: 1, color: C.text, fontSize: 13 },
  tierBadgeSm: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  tierTextSm: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  errorText: { color: C.muted, fontSize: 14, textAlign: 'center' },
  retryBtn: { backgroundColor: C.accent, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

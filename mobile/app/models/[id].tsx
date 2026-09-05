import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getModels, getActiveModel } from '@/lib/api';
import type { AIModel } from '@/lib/types';

import { colors } from '@/lib/theme';
import { DEFAULT_MODELS } from '@/constants/models';

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

function getTier(model: AIModel) {
  const n = model.name?.toUpperCase() ?? '';
  if (n.includes('APEX') || n.includes('70B') || n.includes('LARGE')) return { label: 'APEX', color: '#ef4444', bg: '#ef444420' };
  if (n.includes('FORGE') || n.includes('13B') || n.includes('32B')) return { label: 'FORGE', color: '#f59e0b', bg: '#f59e0b20' };
  return { label: 'NORD', color: '#38bdf8', bg: '#0ea5e920' };
}

function SpecRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={S.specRow}>
      <Text style={S.specLabel}>{label}</Text>
      <Text style={[S.specValue, accent && { color: C.accent }]}>{value}</Text>
    </View>
  );
}

export default function ModelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [model, setModel] = useState<AIModel | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [modelsData, activeData] = await Promise.all([
          getModels().catch(() => null),
          getActiveModel().catch(() => null),
        ]);
        const list = (modelsData?.models && modelsData.models.length > 0) ? modelsData.models : DEFAULT_MODELS;
        const decodedId = decodeURIComponent(id);
        const found = list.find((m) => m.id === id || m.id === decodedId || m.name === id || m.name === decodedId) ?? DEFAULT_MODELS[0];
        setModel(found);
        setIsActive(
          activeData?.active_model === id ||
          activeData?.active_model === decodedId ||
          activeData?.active_model === found?.name ||
          activeData?.active_model === found?.id
        );
        if (found) navigation.setOptions({ title: found.name });
      } catch (e: unknown) {
        const decodedId = decodeURIComponent(id);
        const found = DEFAULT_MODELS.find((m) => m.id === id || m.id === decodedId) ?? DEFAULT_MODELS[0];
        setModel(found);
        if (found) navigation.setOptions({ title: found.name });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, navigation]);

  if (loading) return <View style={S.centered}><ActivityIndicator color={C.accent} size="large" /></View>;
  if (error || !model) return (
    <View style={S.centered}>
      <Ionicons name="alert-circle-outline" size={40} color={C.error} />
      <Text style={S.errorText}>{error ?? 'Model not found.'}</Text>
    </View>
  );

  const tier = getTier(model);
  const roleDesc = tier.label === 'APEX'
    ? 'Handles complex diagnostics, root cause analysis, cross-document reasoning, and vision-based fault detection.'
    : tier.label === 'FORGE'
    ? 'Balances speed and accuracy for multi-step troubleshooting, cross-document correlation, and technical reasoning.'
    : 'Delivers fast, cost-efficient responses for simple fault lookups, error code definitions, and procedural queries.';

  return (
    <ScrollView style={S.root} contentContainerStyle={S.content}>
      <View style={[S.hero, { borderLeftColor: tier.color, borderLeftWidth: 4 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <Text style={S.heroName}>{model.name}</Text>
          <View style={[S.tierBadge, { backgroundColor: tier.bg, borderColor: tier.color }]}>
            <Text style={[S.tierText, { color: tier.color }]}>{tier.label}</Text>
          </View>
        </View>
        {isActive && (
          <View style={S.activeBadge}>
            <Ionicons name="checkmark-circle" size={14} color={C.success} />
            <Text style={S.activeText}>Currently Active Model</Text>
          </View>
        )}
        {model.description ? <Text style={S.heroDesc}>{model.description}</Text> : null}
      </View>

      {model.supports_vision && (
        <View style={S.visionBanner}>
          <Ionicons name="eye-outline" size={18} color={C.accent} />
          <Text style={S.visionText}>Supports vision / image analysis</Text>
        </View>
      )}

      <Text style={S.sectionTitle}>Specifications</Text>
      <View style={S.specCard}>
        <SpecRow label="Provider" value={model.provider} accent />
        <SpecRow label="Type" value={model.type} />
        <SpecRow label="Speed" value={model.speed} />
        {model.context_window != null && <SpecRow label="Context Window" value={`${model.context_window.toLocaleString()} tokens`} />}
        {model.max_tokens != null && <SpecRow label="Max Output" value={model.max_tokens.toLocaleString()} />}
        <SpecRow label="Vision" value={model.supports_vision ? 'Yes' : 'No'} />
      </View>

      {model.recommended_for && (
        <>
          <Text style={S.sectionTitle}>Recommended Use Cases</Text>
          <View style={S.recCard}>
            <Ionicons name="checkmark-circle-outline" size={18} color={C.success} style={{ marginTop: 1 }} />
            <Text style={S.recText}>{model.recommended_for}</Text>
          </View>
        </>
      )}

      <Text style={S.sectionTitle}>MEND-X Role</Text>
      <View style={S.contextCard}><Text style={S.contextText}>{roleDesc}</Text></View>
    </ScrollView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  hero: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 16, marginBottom: 12 },
  heroName: { color: C.text, fontSize: 20, fontWeight: '700', flex: 1, marginRight: 10 },
  tierBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  tierText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.success + '15', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 10, alignSelf: 'flex-start' },
  activeText: { color: C.success, fontSize: 13, fontWeight: '600' },
  heroDesc: { color: C.muted, fontSize: 14, lineHeight: 20 },
  visionBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.accent + '15', borderWidth: 1, borderColor: C.accent + '40', borderRadius: 10, padding: 12, marginBottom: 12 },
  visionText: { color: C.accent, fontSize: 13, fontWeight: '600' },
  sectionTitle: { color: C.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  specCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 13, borderBottomWidth: 1, borderBottomColor: C.border },
  specLabel: { color: C.muted, fontSize: 13 },
  specValue: { color: C.text, fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  recCard: { flexDirection: 'row', gap: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, marginBottom: 16 },
  recText: { color: C.text, fontSize: 14, lineHeight: 20, flex: 1 },
  contextCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14 },
  contextText: { color: C.muted, fontSize: 14, lineHeight: 21 },
  errorText: { color: C.muted, fontSize: 14, textAlign: 'center' },
});

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMachines, getModels, createConversation } from '@/lib/api';
import { getActiveModel } from '@/lib/api';
import type { Machine, AIModel } from '@/lib/types';

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

export default function NewChatScreen() {
  const router = useRouter();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [initialQuery, setInitialQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getMachines(),
      getModels(),
      getActiveModel().catch(() => null),
    ])
      .then(([ms, modelsData, activeData]) => {
        setMachines(ms);
        setModels(modelsData.models ?? []);
        if (activeData) {
          const match = modelsData.models.find(
            (m) => m.id === activeData.active_model || m.name === activeData.active_model
          );
          setSelectedModel(match?.id ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!selectedMachine) { setError('Please select a machine to continue.'); return; }
    setCreating(true); setError(null);
    try {
      const conv = await createConversation();
      router.replace(initialQuery.trim()
        ? { pathname: `/chat/${conv.conversation_id}`, params: { prefill: initialQuery.trim(), machineId: selectedMachine, modelId: selectedModel ?? '' } } as never
        : { pathname: `/chat/${conv.conversation_id}`, params: { machineId: selectedMachine, modelId: selectedModel ?? '' } } as never);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to create conversation.'); setCreating(false); }
  }

  if (loading) return <View style={S.centered}><ActivityIndicator color={C.accent} size="large" /></View>;

  return (
    <ScrollView style={S.root} contentContainerStyle={S.content} keyboardShouldPersistTaps="handled">
      <Text style={S.pageTitle}>New Conversation</Text>
      <Text style={S.pageSub}>Select a machine to scope the session, then optionally enter an opening query.</Text>

      {machines.slice(0, 5).length > 0 && (
        <>
          <Text style={S.label}>Quick Select</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.chipRow} contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
            {machines.slice(0, 5).map((m) => (
              <TouchableOpacity key={m.id} style={[S.chip, selectedMachine === m.id && S.chipActive]} onPress={() => setSelectedMachine(selectedMachine === m.id ? null : m.id)} activeOpacity={0.75}>
                <Ionicons name="hardware-chip-outline" size={14} color={selectedMachine === m.id ? '#fff' : C.muted} />
                <Text style={[S.chipText, selectedMachine === m.id && S.chipTextActive]}>{m.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      <Text style={S.label}>Select Machine <Text style={{ color: C.error }}>*</Text></Text>
      {machines.length === 0
        ? <Text style={S.note}>No machines configured.</Text>
        : <View style={S.listCard}>
          {machines.map((m, i) => {
            const sel = selectedMachine === m.id;
            return (
              <TouchableOpacity key={m.id} style={[S.machineRow, i < machines.length - 1 && S.rowBorder, sel && S.machineRowSel]} onPress={() => setSelectedMachine(sel ? null : m.id)} activeOpacity={0.8}>
                <View style={[S.radio, sel && S.radioActive]}>{sel && <View style={S.radioInner} />}</View>
                <View style={{ flex: 1 }}>
                  <Text style={[S.machineName, sel && { color: C.accent }]}>{m.name}</Text>
                  {m.manufacturer ? <Text style={S.machineSub}>{m.manufacturer}{m.category ? ` · ${m.category}` : ''}</Text> : null}
                </View>
                {sel && <Ionicons name="checkmark-circle" size={18} color={C.accent} />}
              </TouchableOpacity>
            );
          })}
        </View>}

      {models.length > 0 && (
        <>
          <Text style={S.label}>AI Model <Text style={S.optional}>(optional)</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.chipRow} contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
            <TouchableOpacity style={[S.chip, !selectedModel && S.chipActive]} onPress={() => setSelectedModel(null)}>
              <Text style={[S.chipText, !selectedModel && S.chipTextActive]}>Auto</Text>
            </TouchableOpacity>
            {models.map((mdl) => (
              <TouchableOpacity key={mdl.id} style={[S.chip, selectedModel === mdl.id && S.chipActive]} onPress={() => setSelectedModel(selectedModel === mdl.id ? null : mdl.id)}>
                <Text style={[S.chipText, selectedModel === mdl.id && S.chipTextActive]} numberOfLines={1}>{mdl.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      <Text style={S.label}>Opening Question <Text style={S.optional}>(optional)</Text></Text>
      <TextInput style={S.queryInput} value={initialQuery} onChangeText={setInitialQuery} placeholder="E.g. E101 hydraulic fault on press line…" placeholderTextColor={C.muted} multiline maxLength={500} />

      {error && <View style={S.errorBox}><Ionicons name="alert-circle-outline" size={16} color={C.error} /><Text style={S.errorText}>{error}</Text></View>}

      <TouchableOpacity style={[S.createBtn, (!selectedMachine || creating) && S.createBtnOff]} onPress={handleCreate} disabled={!selectedMachine || creating} activeOpacity={0.85}>
        {creating ? <ActivityIndicator color="#fff" size="small" /> : <><Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" /><Text style={S.createBtnText}>Start Conversation</Text></>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  pageTitle: { color: C.text, fontSize: 24, fontWeight: '700', marginBottom: 6 },
  pageSub: { color: C.muted, fontSize: 13, lineHeight: 19, marginBottom: 22 },
  label: { color: C.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  optional: { color: C.muted, textTransform: 'none', letterSpacing: 0, fontWeight: '400' },
  chipRow: { marginBottom: 20, maxHeight: 42 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  chipActive: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { color: C.muted, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  listCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  machineRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  machineRowSel: { backgroundColor: C.accent + '10' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: C.accent },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.accent },
  machineName: { color: C.text, fontSize: 14, fontWeight: '600' },
  machineSub: { color: C.muted, fontSize: 12, marginTop: 2 },
  queryInput: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 14, color: C.text, fontSize: 14, minHeight: 90, textAlignVertical: 'top', marginBottom: 20 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.error + '15', borderWidth: 1, borderColor: C.error + '40', borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { color: C.error, fontSize: 13, flex: 1 },
  createBtn: { backgroundColor: C.accent, borderRadius: 12, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  createBtnOff: { opacity: 0.5 },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  note: { color: C.muted, fontSize: 13, marginBottom: 20 },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMachines, createMachine, deactivateMachine, getManuals, deleteManual } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Machine, Manual } from '@/lib/types';

const C = {
  bg: '#0f172a', surface: '#1e293b', border: '#334155',
  accent: '#6366f1', text: '#f1f5f9', muted: '#94a3b8',
  success: '#22c55e', error: '#ef4444', warning: '#f59e0b',
};

const CATEGORIES = ['CNC', 'Hydraulic', 'Pneumatic', 'Electrical', 'Mechanical', 'Other'];

type TabKey = 'machines' | 'manuals';

export default function AdminScreen() {
  const { user: authUser } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<TabKey>('machines');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [loadingManuals, setLoadingManuals] = useState(true);

  // Create machine form
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [category, setCategory] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isAdmin = authUser?.role === 'admin' || authUser?.role === 'manager';

  useEffect(() => {
    if (!isAdmin) { router.replace('/(tabs)'); return; }
    fetchMachines();
    fetchManuals();
  }, [isAdmin]);

  const fetchMachines = useCallback(async () => {
    setLoadingMachines(true);
    try { setMachines(await getMachines()); } catch { /* swallow */ }
    finally { setLoadingMachines(false); }
  }, []);

  const fetchManuals = useCallback(async () => {
    setLoadingManuals(true);
    try { setManuals(await getManuals()); } catch { /* swallow */ }
    finally { setLoadingManuals(false); }
  }, []);

  async function handleCreateMachine() {
    if (!name.trim()) { setFormError('Machine name is required.'); return; }
    setFormError(null);
    setCreating(true);
    try {
      await createMachine({ name: name.trim(), model: model.trim() || undefined, manufacturer: manufacturer.trim() || undefined, category: category || undefined });
      setName(''); setModel(''); setManufacturer(''); setCategory('');
      await fetchMachines();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to create machine.');
    } finally {
      setCreating(false);
    }
  }

  function confirmDeactivate(machine: Machine) {
    Alert.alert('Deactivate Machine', `Remove "${machine.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Deactivate', style: 'destructive', onPress: async () => {
        try { await deactivateMachine(machine.id); await fetchMachines(); }
        catch (e: unknown) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
      }},
    ]);
  }

  function confirmDeleteManual(manual: Manual) {
    Alert.alert('Delete Manual', `Delete "${manual.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteManual(manual.id); await fetchManuals(); }
        catch (e: unknown) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
      }},
    ]);
  }

  return (
    <View style={styles.root}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['machines', 'manuals'] as TabKey[]).map((t) => (
          <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'machines' ? 'Machines' : 'Manuals'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'machines' ? (
        <ScrollView style={styles.pane} contentContainerStyle={styles.paneContent}>
          {/* Create form */}
          <Text style={styles.sectionLabel}>Add Machine</Text>
          <View style={styles.formCard}>
            {formError && <Text style={styles.formError}>{formError}</Text>}
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Machine Name *" placeholderTextColor={C.muted} />
            <TextInput style={styles.input} value={model} onChangeText={setModel} placeholder="Model" placeholderTextColor={C.muted} />
            <TextInput style={styles.input} value={manufacturer} onChangeText={setManufacturer} placeholder="Manufacturer" placeholderTextColor={C.muted} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipContent}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipActive]} onPress={() => setCategory(category === c ? '' : c)}>
                  <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.createBtn, creating && styles.createBtnDisabled]} onPress={handleCreateMachine} disabled={creating} activeOpacity={0.8}>
              {creating ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.createBtnText}>Create Machine</Text>}
            </TouchableOpacity>
          </View>

          {/* Machine list */}
          <Text style={styles.sectionLabel}>Machines ({machines.length})</Text>
          {loadingMachines
            ? <ActivityIndicator color={C.accent} />
            : machines.map((m) => (
              <View key={m.id} style={styles.listCard}>
                <View style={styles.listInfo}>
                  <Text style={styles.listTitle}>{m.name}</Text>
                  <Text style={styles.listSub}>{[m.manufacturer, m.model, m.category].filter(Boolean).join(' · ')}</Text>
                </View>
                <TouchableOpacity onPress={() => confirmDeactivate(m)}>
                  <Ionicons name="trash-outline" size={18} color={C.error} />
                </TouchableOpacity>
              </View>
            ))
          }
        </ScrollView>
      ) : (
        <ScrollView style={styles.pane} contentContainerStyle={styles.paneContent}>
          <TouchableOpacity style={styles.uploadLink} onPress={() => router.push('/upload')}>
            <Ionicons name="cloud-upload-outline" size={16} color={C.accent} />
            <Text style={styles.uploadLinkText}>Upload New Manual</Text>
          </TouchableOpacity>
          <Text style={styles.sectionLabel}>Manuals ({manuals.length})</Text>
          {loadingManuals
            ? <ActivityIndicator color={C.accent} />
            : manuals.map((m) => (
              <View key={m.id} style={styles.listCard}>
                <View style={styles.listInfo}>
                  <Text style={styles.listTitle} numberOfLines={1}>{m.title}</Text>
                  <Text style={styles.listSub}>{m.processing_status}{m.machine_name ? ` · ${m.machine_name}` : ''}</Text>
                </View>
                <TouchableOpacity onPress={() => confirmDeleteManual(m)}>
                  <Ionicons name="trash-outline" size={18} color={C.error} />
                </TouchableOpacity>
              </View>
            ))
          }
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  tabRow: { flexDirection: 'row', backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: C.accent },
  tabText: { color: C.muted, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: C.accent },
  pane: { flex: 1 },
  paneContent: { padding: 16, paddingBottom: 40 },
  sectionLabel: { color: C.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 8 },
  formCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, gap: 10, marginBottom: 20 },
  formError: { color: C.error, fontSize: 13 },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: C.text, fontSize: 14 },
  chipRow: { maxHeight: 40 },
  chipContent: { gap: 8 },
  chip: { borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  chipActive: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { color: C.muted, fontSize: 13 },
  chipTextActive: { color: '#fff' },
  createBtn: { backgroundColor: C.accent, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  createBtnDisabled: { opacity: 0.6 },
  createBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 14, marginBottom: 8, gap: 12 },
  listInfo: { flex: 1 },
  listTitle: { color: C.text, fontSize: 14, fontWeight: '600' },
  listSub: { color: C.muted, fontSize: 12, marginTop: 2 },
  uploadLink: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: C.accent, borderRadius: 8, paddingVertical: 12, justifyContent: 'center', marginBottom: 16 },
  uploadLinkText: { color: C.accent, fontSize: 14, fontWeight: '600' },
});

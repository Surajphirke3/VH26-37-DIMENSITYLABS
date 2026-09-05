import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMachines, createMachine, deactivateMachine, getManuals, deleteManual, getUsers } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Machine, Manual, User } from '@/lib/types';

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
  error: colors.error,
  warning: colors.warning,
};

const CATEGORIES = ['CNC', 'Hydraulic', 'Pneumatic', 'Electrical', 'Mechanical', 'Other'];

type TabKey = 'machines' | 'manuals' | 'users';

export default function AdminScreen() {
  const { user: authUser } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<TabKey>('machines');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [loadingManuals, setLoadingManuals] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

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
    fetchUsers();
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

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      setUsers(await getUsers());
    } catch { /* swallow */ }
    finally { setLoadingUsers(false); }
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
        <TouchableOpacity style={[styles.tabBtn, tab === 'machines' && styles.tabBtnActive]} onPress={() => setTab('machines')} activeOpacity={0.8}>
          <Text style={[styles.tabText, tab === 'machines' && styles.tabTextActive]}>Fleet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'manuals' && styles.tabBtnActive]} onPress={() => setTab('manuals')} activeOpacity={0.8}>
          <Text style={[styles.tabText, tab === 'manuals' && styles.tabTextActive]}>Manuals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'users' && styles.tabBtnActive]} onPress={() => setTab('users')} activeOpacity={0.8}>
          <Text style={[styles.tabText, tab === 'users' && styles.tabTextActive]}>Team ({users.length})</Text>
        </TouchableOpacity>
      </View>

      {tab === 'machines' ? (
        <ScrollView style={styles.pane} contentContainerStyle={styles.paneContent} keyboardShouldPersistTaps="handled">
          {/* Create Machine Form */}
          <Text style={styles.sectionLabel}>Add New Machine</Text>
          <View style={styles.formCard}>
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            <TextInput style={styles.input} placeholder="Machine Name *" placeholderTextColor={C.muted} value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Model (optional)" placeholderTextColor={C.muted} value={model} onChangeText={setModel} />
            <TextInput style={styles.input} placeholder="Manufacturer (optional)" placeholderTextColor={C.muted} value={manufacturer} onChangeText={setManufacturer} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipContent}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat} style={[styles.chip, category === cat && styles.chipActive]} onPress={() => setCategory(category === cat ? '' : cat)} activeOpacity={0.8}>
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
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
      ) : tab === 'manuals' ? (
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
      ) : (
        <ScrollView style={styles.pane} contentContainerStyle={styles.paneContent}>
          <Text style={styles.sectionLabel}>Authorized Team & Operators ({users.length})</Text>
          {loadingUsers
            ? <ActivityIndicator color={C.accent} />
            : users.map((u) => (
              <View key={u.id} style={styles.listCard}>
                <View style={[styles.avatarMini, { backgroundColor: u.role === 'admin' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)' }]}>
                  <Text style={[styles.avatarMiniText, { color: u.role === 'admin' ? C.accent : C.success }]}>
                    {(u.full_name || u.email)[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.listInfo}>
                  <Text style={styles.listTitle}>{u.full_name || u.email}</Text>
                  <Text style={styles.listSub}>{u.email} · {u.is_active ? 'Active' : 'Disabled'}</Text>
                </View>
                <View style={[styles.roleTag, { borderColor: u.role === 'admin' ? C.accent : C.success }]}>
                  <Text style={[styles.roleTagText, { color: u.role === 'admin' ? C.accent : C.success }]}>
                    {u.role.toUpperCase()}
                  </Text>
                </View>
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
  avatarMini: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarMiniText: { fontSize: 14, fontWeight: '700' },
  roleTag: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  roleTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});

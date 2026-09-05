import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { uploadManual, getMachines } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Machine } from '@/lib/types';
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
  accentAi: colors.accentAi,
};

const MANUAL_TYPES = ['service', 'operator', 'parts', 'installation', 'schematic', 'troubleshooting'];

interface PickedFile {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export default function UploadScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  const [file, setFile] = useState<PickedFile | null>(null);
  const [title, setTitle] = useState('');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [manualType, setManualType] = useState('service');
  const [version, setVersion] = useState('');
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { getMachines().then(setMachines).catch(() => {}); }, []);

  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setFile({ uri: asset.uri, name: asset.name, size: asset.size, mimeType: asset.mimeType });
        if (!title) setTitle(asset.name.replace(/\.pdf$/i, ''));
      }
    } catch {
      setError('Failed to pick document.');
    }
  }

  function formatSize(bytes?: number) {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  async function handleUpload() {
    if (!isManagerOrAdmin) {
      setError('Manual upload is restricted to Managers & Administrators. Please sign in with an Admin account.');
      return;
    }
    if (!file) { setError('Please select a PDF file.'); return; }
    setError(null);
    setUploading(true);
    setStage('Validating binary magic bytes…');
    try {
      setStage('Transmitting PDF to ingestion pipeline…');
      const manual = await uploadManual({
        file: { uri: file.uri, name: file.name, type: file.mimeType ?? 'application/pdf' },
        title: title.trim() || undefined,
        machine_id: selectedMachine ?? undefined,
        manual_type: manualType,
        version: version.trim() || undefined,
      });
      setStage('Vector chunking & embedding…');
      Alert.alert(
        'Upload Successful',
        `Manual "${title || file.name}" uploaded successfully!\nPipeline Job ID: ${manual.ingestion_job_id}`,
        [
          { text: 'View in Library', onPress: () => router.replace(`/document/${manual.manual_id}`) },
          { text: 'Upload Another', onPress: () => { setFile(null); setTitle(''); setStage(null); } },
        ]
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed. Please check network connection.');
    } finally {
      setUploading(false);
      setStage(null);
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Role Banner for Technicians */}
      {!isManagerOrAdmin && (
        <View style={styles.roleWarningCard}>
          <Ionicons name="shield-outline" size={18} color={C.warning} />
          <View style={{ flex: 1 }}>
            <Text style={styles.roleWarningTitle}>Manager / Administrator Access Required</Text>
            <Text style={styles.roleWarningText}>
              You are signed in as {user?.role || 'Technician'}. Technical manual ingestion and vector indexing require Administrator privileges (admin@mechind.com).
            </Text>
          </View>
        </View>
      )}

      {/* File picker */}
      <Text style={styles.sectionLabel}>Document (PDF Only)</Text>
      <TouchableOpacity style={[styles.dropZone, file && styles.dropZoneActive]} onPress={pickDocument} activeOpacity={0.8}>
        {file ? (
          <View style={styles.fileInfo}>
            <Ionicons name="document" size={28} color={C.accent} />
            <View style={styles.fileText}>
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              <Text style={styles.fileSize}>{formatSize(file.size)}</Text>
            </View>
            <TouchableOpacity onPress={() => setFile(null)}><Ionicons name="close-circle" size={20} color={C.muted} /></TouchableOpacity>
          </View>
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={36} color={C.muted} />
            <Text style={styles.dropText}>Tap to select PDF</Text>
            <Text style={styles.dropHint}>PDF files up to 100MB</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.sectionLabel}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Hydraulic System Service Manual" placeholderTextColor={C.muted} />

      {/* Machine */}
      <Text style={styles.sectionLabel}>Machine (Optional)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipContent}>
        <TouchableOpacity style={[styles.chip, !selectedMachine && styles.chipActive]} onPress={() => setSelectedMachine(null)}>
          <Text style={[styles.chipText, !selectedMachine && styles.chipTextActive]}>None</Text>
        </TouchableOpacity>
        {machines.map((m) => (
          <TouchableOpacity key={m.id} style={[styles.chip, selectedMachine === m.id && styles.chipActive]} onPress={() => setSelectedMachine(m.id)}>
            <Text style={[styles.chipText, selectedMachine === m.id && styles.chipTextActive]}>{m.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Manual Type */}
      <Text style={styles.sectionLabel}>Manual Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipContent}>
        {MANUAL_TYPES.map((t) => (
          <TouchableOpacity key={t} style={[styles.chip, manualType === t && styles.chipActive]} onPress={() => setManualType(t)}>
            <Text style={[styles.chipText, manualType === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Version */}
      <Text style={styles.sectionLabel}>Version (Optional)</Text>
      <TextInput style={styles.input} value={version} onChangeText={setVersion} placeholder="e.g. 2.1.0" placeholderTextColor={C.muted} />

      {error && <Text style={styles.errorText}>{error}</Text>}
      {stage && (
        <View style={styles.progressRow}>
          <ActivityIndicator color={C.accentAi} size="small" />
          <Text style={styles.progressText}>{stage}</Text>
        </View>
      )}

      <TouchableOpacity style={[styles.uploadBtn, (!file || uploading || !isManagerOrAdmin) && styles.uploadBtnDisabled]} onPress={handleUpload} disabled={!file || uploading || !isManagerOrAdmin} activeOpacity={0.8}>
        {uploading ? <ActivityIndicator color="#fff" size="small" /> : <><Ionicons name="cloud-upload-outline" size={18} color="#fff" /><Text style={styles.uploadBtnText}>Upload Manual</Text></>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },
  roleWarningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  roleWarningTitle: {
    color: C.warning,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  roleWarningText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  sectionLabel: { color: C.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 },
  dropZone: { borderWidth: 2, borderColor: C.border, borderStyle: 'dashed', borderRadius: 14, padding: 32, alignItems: 'center', gap: 8, backgroundColor: C.surface },
  dropZoneActive: { borderColor: C.accent, borderStyle: 'solid' },
  dropText: { color: C.text, fontSize: 15, fontWeight: '600' },
  dropHint: { color: C.muted, fontSize: 12 },
  fileInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  fileText: { flex: 1 },
  fileName: { color: C.text, fontSize: 14, fontWeight: '600' },
  fileSize: { color: C.muted, fontSize: 12, marginTop: 2 },
  input: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 15 },
  chipRow: { maxHeight: 44 },
  chipContent: { gap: 8, paddingRight: 8 },
  chip: { borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { color: C.muted, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  errorText: { color: C.error, fontSize: 13, marginTop: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  progressText: { color: C.success, fontSize: 13 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.accent, borderRadius: 10, paddingVertical: 14, marginTop: 20 },
  uploadBtnDisabled: { opacity: 0.5 },
  uploadBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

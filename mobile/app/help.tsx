import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_BASE_URL, APP_NAME } from '@/constants/config';

const C = { bg: '#0f172a', surface: '#1e293b', border: '#334155', accent: '#6366f1', text: '#f1f5f9', muted: '#94a3b8', success: '#22c55e', warning: '#f59e0b', error: '#ef4444' };

const QUICK_START = [
  { num: 1, icon: 'log-in-outline' as const, title: 'Login', desc: 'Sign in with your MEND-X credentials. Contact your administrator if you do not have an account.' },
  { num: 2, icon: 'hardware-chip-outline' as const, title: 'Select Machine', desc: 'Choose the specific machine you are troubleshooting to scope all answers to the correct manuals.' },
  { num: 3, icon: 'chatbubble-ellipses-outline' as const, title: 'Ask Your Question', desc: 'Describe the fault, error code, or symptom. MEND-X will retrieve and cite the relevant procedure.' },
];
const DEMO_QUERIES = [
  'E101 hydraulic pressure fault on press line', 'Spindle won\'t start after emergency stop reset',
  'Preventive maintenance schedule for conveyor motor', 'Calibration procedure for load cell sensor',
];
const TIPS = [
  { icon: 'hardware-chip-outline' as const, tip: 'Always select a specific machine — it dramatically improves answer precision.' },
  { icon: 'code-outline' as const, tip: 'Include the exact error code (e.g. "E404", "F21") to search directly for it.' },
  { icon: 'git-branch-outline' as const, tip: 'Describe symptoms, not just codes: "motor overheating after 20 min run time" retrieves better results.' },
  { icon: 'eye-outline' as const, tip: 'Upload a photo of the control panel — APEX-tier models can read it visually.' },
  { icon: 'bookmark-outline' as const, tip: 'Cross-reference citations with the physical manual for safety-critical steps.' },
];
const ABOUT = [
  { label: 'App', value: `${APP_NAME} Mobile` },
  { label: 'Version', value: '1.0.0' },
  { label: 'Team', value: 'DIMENSITY LABS VH26-37' },
  { label: 'Tagline', value: 'From Failure to Function', accent: true },
];

export default function HelpScreen() {
  const router = useRouter();
  return (
    <ScrollView style={S.root} contentContainerStyle={S.content}>
      <Text style={S.pageTitle}>Help & Documentation</Text>

      <Text style={S.sectionTitle}>Quick Start</Text>
      {QUICK_START.map((step, i) => (
        <View key={step.num} style={S.stepCard}>
          <View style={S.stepLeft}>
            <View style={S.stepNumCircle}><Text style={S.stepNumText}>{step.num}</Text></View>
            {i < QUICK_START.length - 1 && <View style={S.stepLine} />}
          </View>
          <View style={S.stepBody}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Ionicons name={step.icon} size={15} color={C.accent} /><Text style={S.stepTitle}>{step.title}</Text>
            </View>
            <Text style={S.stepDesc}>{step.desc}</Text>
          </View>
        </View>
      ))}

      <Text style={S.sectionTitle}>Demo Queries</Text>
      <View style={S.chipWrap}>
        {DEMO_QUERIES.map((q) => (
          <TouchableOpacity key={q} style={S.demoChip} onPress={() => router.push({ pathname: '/(tabs)', params: { prefill: q } } as never)} activeOpacity={0.7}>
            <Ionicons name="flash-outline" size={13} color={C.accent} />
            <Text style={S.demoChipText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={S.sectionTitle}>API Configuration</Text>
      <View style={S.card}>
        <Text style={S.apiLabel}>Current API URL</Text>
        <Text style={S.apiValue} selectable>{API_BASE_URL}</Text>
        <Text style={S.apiHint}>Set EXPO_PUBLIC_API_URL in your .env file. Rebuild after changing.</Text>
      </View>

      <Text style={S.sectionTitle}>Tips for Best Results</Text>
      <View style={S.tipsCard}>
        {TIPS.map((t, i) => (
          <View key={i} style={[S.tipRow, i < TIPS.length - 1 && S.tipBorder]}>
            <View style={S.tipIcon}><Ionicons name={t.icon} size={15} color={C.accent} /></View>
            <Text style={S.tipText}>{t.tip}</Text>
          </View>
        ))}
      </View>

      <Text style={S.sectionTitle}>About</Text>
      <View style={S.aboutCard}>
        {ABOUT.map((row, i) => (
          <View key={row.label} style={[S.aboutRow, i < ABOUT.length - 1 && S.aboutBorder]}>
            <Text style={S.aboutLabel}>{row.label}</Text>
            <Text style={[S.aboutValue, row.accent && { color: C.accent }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={S.docsLink} onPress={() => Linking.openURL(`${API_BASE_URL}/docs`)} activeOpacity={0.7}>
        <Ionicons name="open-outline" size={16} color={C.accent} />
        <Text style={S.docsLinkText}>Open API Documentation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { color: C.text, fontSize: 24, fontWeight: '700', marginBottom: 20 },
  sectionTitle: { color: C.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12, marginTop: 4 },
  stepCard: { flexDirection: 'row', marginBottom: 4 },
  stepLeft: { alignItems: 'center', width: 36, marginRight: 12 },
  stepNumCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  stepLine: { flex: 1, width: 2, backgroundColor: C.border, marginTop: 4, marginBottom: 4 },
  stepBody: { flex: 1, paddingBottom: 16 },
  stepTitle: { color: C.text, fontSize: 15, fontWeight: '700' },
  stepDesc: { color: C.muted, fontSize: 13, lineHeight: 19 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  demoChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.accent + '18', borderWidth: 1, borderColor: C.accent + '50', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  demoChipText: { color: C.accent, fontSize: 13, fontWeight: '500', flexShrink: 1 },
  card: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, marginBottom: 20 },
  apiLabel: { color: C.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  apiValue: { color: C.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  apiHint: { color: C.muted, fontSize: 12, lineHeight: 18 },
  tipsCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12 },
  tipBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  tipIcon: { width: 26, height: 26, borderRadius: 7, backgroundColor: C.accent + '20', justifyContent: 'center', alignItems: 'center' },
  tipText: { color: C.muted, fontSize: 13, lineHeight: 18, flex: 1 },
  aboutCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 13 },
  aboutBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  aboutLabel: { color: C.muted, fontSize: 13 },
  aboutValue: { color: C.text, fontSize: 13, fontWeight: '600' },
  docsLink: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 14 },
  docsLinkText: { color: C.accent, fontSize: 14, fontWeight: '600' },
});

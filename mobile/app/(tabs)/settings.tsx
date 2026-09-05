import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { API_BASE_URL } from '@/constants/config';

const C = {
  bg: '#0f172a', surface: '#1e293b', border: '#334155',
  accent: '#6366f1', text: '#f1f5f9', muted: '#94a3b8',
  error: '#ef4444', success: '#22c55e',
};

const ROLE_COLORS: Record<string, string> = {
  admin: '#ef4444', manager: '#f59e0b', technician: '#22c55e',
};

function Row({ icon, label, value, danger }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string; value?: string; danger?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color={danger ? C.error : C.accent} />
      <View style={styles.rowInfo}>
        <Text style={[styles.rowLabel, danger && { color: C.error }]}>{label}</Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const roleColor = ROLE_COLORS[user?.role ?? 'technician'] ?? C.muted;
  const appVersion = '1.0.0';

  function handleLogout() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>
            {(user?.full_name ?? user?.email ?? 'U')[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.full_name ?? 'Unknown User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleColor + '22', borderColor: roleColor }]}>
            <Text style={[styles.roleText, { color: roleColor }]}>
              {user?.role?.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Account Section */}
      <Text style={styles.sectionLabel}>Account</Text>
      <View style={styles.section}>
        <Row icon="person-outline" label="Full Name" value={user?.full_name ?? '—'} />
        <View style={styles.divider} />
        <Row icon="mail-outline" label="Email" value={user?.email} />
        <View style={styles.divider} />
        <Row
          icon="shield-checkmark-outline"
          label="Account Status"
          value={user?.is_active ? 'Active' : 'Inactive'}
        />
      </View>

      {/* API Config */}
      <Text style={styles.sectionLabel}>Configuration</Text>
      <View style={styles.section}>
        <Row icon="server-outline" label="API Endpoint" value={API_BASE_URL} />
      </View>

      {/* App Info */}
      <Text style={styles.sectionLabel}>Application</Text>
      <View style={styles.section}>
        <Row icon="information-circle-outline" label="Version" value={`v${appVersion}`} />
        <View style={styles.divider} />
        <Row icon="code-slash-outline" label="Platform" value="Expo Router v3" />
        <View style={styles.divider} />
        <Row icon="business-outline" label="Made By" value="Dimensity Labs" />
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading
          ? <ActivityIndicator color={C.error} size="small" />
          : <>
              <Ionicons name="log-out-outline" size={20} color={C.error} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, padding: 16, marginBottom: 24,
  },
  avatarBox: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  userInfo: { flex: 1, gap: 2 },
  userName: { color: C.text, fontSize: 17, fontWeight: '700' },
  userEmail: { color: C.muted, fontSize: 13 },
  roleBadge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  roleText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  sectionLabel: {
    color: C.muted, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
  },
  section: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, marginBottom: 20,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  rowInfo: { flex: 1 },
  rowLabel: { color: C.text, fontSize: 14, fontWeight: '500' },
  rowValue: { color: C.muted, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: C.border },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1, borderColor: C.error, borderRadius: 10,
    paddingVertical: 14, backgroundColor: '#450a0a22',
  },
  logoutText: { color: C.error, fontSize: 15, fontWeight: '700' },
});

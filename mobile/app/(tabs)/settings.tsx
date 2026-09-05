import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { API_BASE_URL } from '@/constants/config';
import { colors, roleColors, borderRadius, spacing, shadows } from '@/lib/theme';

function Row({
  icon,
  label,
  value,
  danger,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  danger?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIconBox, danger && { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
        <Ionicons name={icon} size={16} color={danger ? colors.error : colors.accent} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowLabel, danger && { color: colors.error }]}>{label}</Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const role = user?.role ?? 'technician';
  const roleStyle = roleColors[role] ?? roleColors.technician;
  const appVersion = '3.0.0';

  function handleLogout() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to end your diagnostic session?',
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
      {/* User Card with Cyber Highlight */}
      <View style={styles.userCard}>
        <View style={[styles.userTopEdge, { backgroundColor: roleStyle.main }]} />
        <View style={[styles.avatarBox, { shadowColor: roleStyle.main }]}>
          <Text style={styles.avatarText}>
            {(user?.full_name ?? user?.email ?? 'U')[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.full_name ?? 'Operator'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg, borderColor: roleStyle.border }]}>
            <Text style={[styles.roleText, { color: roleStyle.main }]}>
              {role.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Account Section */}
      <Text style={styles.sectionLabel}>Account Profile</Text>
      <View style={styles.section}>
        <Row icon="person-outline" label="Full Name" value={user?.full_name ?? '—'} />
        <View style={styles.divider} />
        <Row icon="mail-outline" label="Email Address" value={user?.email} />
        <View style={styles.divider} />
        <Row
          icon="shield-checkmark-outline"
          label="Account Status"
          value={user?.is_active ? 'Active & Authorized' : 'Suspended'}
        />
      </View>

      {/* API Config */}
      <Text style={styles.sectionLabel}>Backend Telemetry & Connectivity</Text>
      <View style={styles.section}>
        <Row icon="server-outline" label="Active Gateway" value={API_BASE_URL} />
        <View style={styles.divider} />
        <Row icon="shield-outline" label="Authentication" value="JWT / OAuth2 Bearer" />
      </View>

      {/* App Info */}
      <Text style={styles.sectionLabel}>System Information</Text>
      <View style={styles.section}>
        <Row icon="hardware-chip-outline" label="Platform Version" value={`v${appVersion}`} />
        <View style={styles.divider} />
        <Row icon="layers-outline" label="Architecture" value="React Native Expo + FastAPI" />
        <View style={styles.divider} />
        <Row icon="business-outline" label="Organization" value="DIMENSITY LABS [VH26-37]" />
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.error} size="small" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={styles.logoutText}>Terminate Session</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40 },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.md,
  },
  userTopEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  avatarBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  avatarText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  userInfo: { flex: 1, gap: 2 },
  userName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  userEmail: {
    color: colors.muted,
    fontSize: 12,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 2,
  },
  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 14,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  rowIconBox: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowInfo: { flex: 1 },
  rowLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  rowValue: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: borderRadius.md,
    paddingVertical: 13,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginTop: 4,
  },
  logoutText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '700',
  },
});

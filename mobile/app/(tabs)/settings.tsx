import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
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
  const { language, autoDetect, setLanguage, setAutoDetect, t, languages, activeLanguageInfo } = useLanguage();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const role = user?.role ?? 'technician';
  const roleStyle = roleColors[role] ?? roleColors.technician;
  const appVersion = '3.0.0';

  function handleLogout() {
    Alert.alert(
      t('settings_sign_out'),
      t('settings_sign_out_confirm'),
      [
        { text: t('btn_cancel'), style: 'cancel' },
        {
          text: t('settings_sign_out'),
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
      <Text style={styles.sectionLabel}>{t('settings_account_profile')}</Text>
      <View style={styles.section}>
        <Row icon="person-outline" label={t('settings_full_name')} value={user?.full_name ?? '—'} />
        <View style={styles.divider} />
        <Row icon="mail-outline" label={t('settings_email')} value={user?.email} />
        <View style={styles.divider} />
        <Row
          icon="shield-checkmark-outline"
          label={t('settings_account_status')}
          value={user?.is_active ? 'Active & Authorized' : 'Suspended'}
        />
      </View>

      {/* Multilingual Configuration Section */}
      <Text style={styles.sectionLabel}>{t('settings_multilingual_config')}</Text>
      <View style={styles.section}>
        {/* Preferred Language Picker Row */}
        <TouchableOpacity
          style={styles.langPickerRow}
          onPress={() => setIsLangModalOpen(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.rowIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Ionicons name="language-outline" size={16} color={colors.warning} />
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>{t('settings_preferred_language')}</Text>
            <View style={styles.langValueBox}>
              <Text style={styles.langFlag}>{activeLanguageInfo.flag}</Text>
              <Text style={styles.langNative}>{activeLanguageInfo.nativeName}</Text>
              <Text style={styles.langSub}>({activeLanguageInfo.name})</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Auto-detect Input Query Language Switch */}
        <View style={styles.switchRow}>
          <View style={[styles.rowIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="sparkles-outline" size={16} color={colors.success} />
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>{t('settings_autodetect_language')}</Text>
            <Text style={styles.rowSubtext}>{t('settings_autodetect_desc')}</Text>
          </View>
          <Switch
            value={autoDetect}
            onValueChange={setAutoDetect}
            trackColor={{ false: colors.border, true: colors.warning }}
            thumbColor={autoDetect ? '#ffffff' : colors.muted}
          />
        </View>
      </View>

      {/* Backend Telemetry & Connectivity */}
      <Text style={styles.sectionLabel}>{t('settings_telemetry')}</Text>
      <View style={styles.section}>
        <Row icon="server-outline" label="Active Gateway" value={API_BASE_URL} />
        <View style={styles.divider} />
        <Row icon="shield-outline" label="Authentication" value="JWT / OAuth2 Bearer" />
      </View>

      {/* System Information */}
      <Text style={styles.sectionLabel}>{t('settings_system_info')}</Text>
      <View style={styles.section}>
        <Row icon="hardware-chip-outline" label="Platform Version" value={`v${appVersion}`} />
        <View style={styles.divider} />
        <Row icon="layers-outline" label="Architecture" value="React Native Expo + FastAPI" />
        <View style={styles.divider} />
        <Row icon="business-outline" label="Organization" value="DIMENSITY LABS [VH26-37]" />
      </View>

      {/* System Modules & Explorers */}
      <Text style={styles.sectionLabel}>{t('settings_modules_architecture')}</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.navRow} onPress={() => router.push('/architecture')} activeOpacity={0.7}>
          <Ionicons name="git-network-outline" size={18} color={colors.accentCyan} />
          <Text style={styles.navRowText}>System Architecture (8-Stage RAG)</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.navRow} onPress={() => router.push('/models')} activeOpacity={0.7}>
          <Ionicons name="hardware-chip-outline" size={18} color={colors.accent} />
          <Text style={styles.navRowText}>AI Models Matrix (Tri-Tier)</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.navRow} onPress={() => router.push('/workflow')} activeOpacity={0.7}>
          <Ionicons name="git-merge-outline" size={18} color={colors.accentViolet} />
          <Text style={styles.navRowText}>Diagnostic Workflow & Flowchart</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.navRow} onPress={() => router.push('/inspector')} activeOpacity={0.7}>
          <Ionicons name="speedometer-outline" size={18} color={colors.warning} />
          <Text style={styles.navRowText}>RAG Inspector & Benchmark Probes</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.navRow} onPress={() => router.push('/problem')} activeOpacity={0.7}>
          <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
          <Text style={styles.navRowText}>Industrial Problem & Downtime</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.navRow} onPress={() => router.push('/help')} activeOpacity={0.7}>
          <Ionicons name="book-outline" size={18} color={colors.accentAi} />
          <Text style={styles.navRowText}>Help & Diagnostic Guide</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </TouchableOpacity>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.navRow} onPress={() => router.push('/admin')} activeOpacity={0.7}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} />
              <Text style={[styles.navRowText, { color: colors.accent }]}>{t('settings_admin_console')}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.accent} />
            </TouchableOpacity>
          </>
        )}
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
            <Text style={styles.logoutText}>{t('settings_sign_out')}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Language Selection Modal */}
      <Modal
        visible={isLangModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLangModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="language-outline" size={20} color={colors.warning} />
                <Text style={styles.modalTitle}>{t('settings_select_language')}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsLangModalOpen(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              {t('settings_multilingual_desc')}
            </Text>

            <ScrollView style={styles.langList} showsVerticalScrollIndicator={false}>
              {languages.map((item) => {
                const isSelected = item.code === language;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.langOptionCard,
                      isSelected && styles.langOptionCardActive,
                    ]}
                    onPress={async () => {
                      await setLanguage(item.code);
                      setIsLangModalOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.langOptionLeft}>
                      <Text style={styles.langOptionFlag}>{item.flag}</Text>
                      <View>
                        <View style={styles.langOptionNameRow}>
                          <Text style={[styles.langOptionNative, isSelected && { color: colors.warning }]}>
                            {item.nativeName}
                          </Text>
                          <Text style={styles.langOptionCode}>[{item.code.toUpperCase()}]</Text>
                        </View>
                        <Text style={styles.langOptionRegion}>
                          {item.name} • {item.region}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.warning} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  navRowText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },

  // Multilingual Configuration Styles
  langPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  langValueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  langFlag: {
    fontSize: 14,
  },
  langNative: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: '700',
  },
  langSub: {
    color: colors.muted,
    fontSize: 11,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  rowSubtext: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '80%',
    padding: spacing.lg,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 17,
  },
  langList: {
    maxHeight: 400,
  },
  langOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 12,
    marginBottom: 8,
  },
  langOptionCardActive: {
    borderColor: colors.warning,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  langOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  langOptionFlag: {
    fontSize: 22,
  },
  langOptionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langOptionNative: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  langOptionCode: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  langOptionRegion: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});

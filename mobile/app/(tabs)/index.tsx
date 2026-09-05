import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { listConversations, createConversation, type ConversationItem } from '@/lib/api';
import { colors, roleColors, borderRadius, spacing, shadows } from '@/lib/theme';
import ConfidenceBadge from '@/components/common/ConfidenceBadge';

interface QuickAction {
  label: string;
  sub: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  route?: string;
  action?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'New Diagnostic',
    sub: 'AI Machine Triage',
    icon: 'chatbubble-ellipses',
    color: colors.accent,
    action: 'new-chat',
  },
  {
    label: 'Search Manuals',
    sub: 'Semantic RAG',
    icon: 'search',
    color: colors.accentCyan,
    route: '/(tabs)/search',
  },
  {
    label: 'Upload Manual',
    sub: 'PDF Ingestion',
    icon: 'cloud-upload',
    color: colors.accentAi,
    route: '/upload',
  },
  {
    label: 'System Status',
    sub: 'Cluster Probes',
    icon: 'pulse',
    color: colors.accentViolet,
    route: '/(tabs)/status',
  },
];

const COMMON_FAULT_PROBES = [
  {
    title: 'Spindle Overheat & Thermal Drift',
    machine: 'HAAS VF-2 CNC Mill',
    code: 'Alarm 102',
    tag: 'Thermal',
    tagColor: colors.error,
  },
  {
    title: 'PROFINET Bus Timeout',
    machine: 'Fanuc 0i-MF Controller',
    code: 'Event 0x80',
    tag: 'Bus Fault',
    tagColor: colors.warning,
  },
  {
    title: 'Axis 3 Resolver Feedback Drift',
    machine: 'KUKA KR6 Industrial Robot',
    code: 'KRC4 1024',
    tag: 'Kinematics',
    tagColor: colors.accentCyan,
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await listConversations();
      setConversations(data.slice(0, 5));
    } catch {
      // Ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  async function handleAction(action: QuickAction) {
    if (action.action === 'new-chat') {
      try {
        const conv = await createConversation();
        router.push(`/chat/${conv.conversation_id}`);
      } catch {
        // Handle error
      }
    } else if (action.route) {
      router.push(action.route as never);
    }
  }

  async function handleProbe(probe: typeof COMMON_FAULT_PROBES[0]) {
    try {
      const conv = await createConversation();
      router.push(`/chat/${conv.conversation_id}?prompt=${encodeURIComponent(probe.title + ' on ' + probe.machine)}`);
    } catch {
      // Fallback
    }
  }

  const role = user?.role ?? 'technician';
  const roleStyle = roleColors[role] ?? roleColors.technician;
  const displayName = user?.full_name ?? user?.email?.split('@')[0] ?? 'Operator';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchConversations();
          }}
          tintColor={colors.accent}
        />
      }
    >
      {/* Top Welcome Banner */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeTopEdge} />
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeLeft}>
            <View style={styles.statusIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.statusText}>SYSTEM OPERATIONAL</Text>
            </View>
            <Text style={styles.greetingText}>Welcome back,</Text>
            <Text style={styles.userNameText}>{displayName}</Text>
          </View>

          <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg, borderColor: roleStyle.border }]}>
            <Text style={[styles.roleText, { color: roleStyle.main }]}>
              {role.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Operations Console</Text>
        <Text style={styles.sectionSub}>Select an automated workflow</Text>
      </View>

      <View style={styles.grid}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionCard}
            onPress={() => handleAction(action)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionTopEdge, { backgroundColor: action.color }]} />
            <View style={[styles.iconWrap, { backgroundColor: action.color + '1a' }]}>
              <Ionicons name={action.icon} size={22} color={action.color} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
            <Text style={styles.actionSub}>{action.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Common Fault Probes (Aligned with Web UI) */}
      <View style={styles.sectionHeader}>
        <View style={styles.probeTitleRow}>
          <Ionicons name="flash-outline" size={16} color={colors.warning} />
          <Text style={styles.sectionTitle}>Diagnostic Probes</Text>
        </View>
        <Text style={styles.sectionSub}>Quick simulated fault triage</Text>
      </View>

      <View style={styles.probeList}>
        {COMMON_FAULT_PROBES.map((probe, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.probeCard}
            onPress={() => handleProbe(probe)}
            activeOpacity={0.78}
          >
            <View style={styles.probeHeader}>
              <Text style={styles.probeTitle} numberOfLines={1}>
                {probe.title}
              </Text>
              <View style={[styles.probeTag, { borderColor: probe.tagColor + '55', backgroundColor: probe.tagColor + '18' }]}>
                <Text style={[styles.probeTagText, { color: probe.tagColor }]}>{probe.tag}</Text>
              </View>
            </View>

            <View style={styles.probeMeta}>
              <Text style={styles.probeMachine}>{probe.machine}</Text>
              <Text style={styles.probeCode}>{probe.code}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Sessions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        <Text style={styles.sectionSub}>Active machine diagnostics</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} size="small" />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="chatbubbles-outline" size={32} color={colors.muted} />
          <Text style={styles.emptyTitle}>No active sessions</Text>
          <Text style={styles.emptySub}>Start a new triage session above</Text>
        </View>
      ) : (
        <View style={styles.sessionList}>
          {conversations.map((conv) => (
            <TouchableOpacity
              key={conv.conversation_id}
              style={styles.sessionCard}
              onPress={() => router.push(`/chat/${conv.conversation_id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.sessionLeft}>
                <View style={styles.sessionIconBox}>
                  <Ionicons name="hardware-chip-outline" size={18} color={colors.accent} />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle} numberOfLines={1}>
                    {conv.title || 'Diagnostic Session'}
                  </Text>
                  <Text style={styles.sessionMachine}>
                    {conv.machine_name || 'Generic Equipment'}
                  </Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 32 },

  welcomeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  welcomeTopEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accent,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeLeft: { flex: 1 },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.success,
  },
  statusText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  greetingText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  userNameText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  sectionHeader: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  sectionSub: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  probeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: spacing.xl,
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.sm,
  },
  actionTopEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  actionSub: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },

  probeList: {
    gap: 10,
    marginBottom: spacing.xl,
  },
  probeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.sm,
  },
  probeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  probeTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  probeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  probeTagText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  probeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  probeMachine: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  probeCode: {
    color: colors.muted,
    fontSize: 11,
    fontFamily: 'monospace',
  },

  sessionList: {
    gap: 10,
  },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  sessionIconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionInfo: { flex: 1 },
  sessionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  sessionMachine: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 1,
  },

  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  emptySub: {
    color: colors.muted,
    fontSize: 12,
  },
  centered: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});

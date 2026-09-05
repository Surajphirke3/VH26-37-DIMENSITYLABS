import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { listConversations, createConversation, type ConversationItem } from '@/lib/api';

const C = {
  bg: '#0f172a', surface: '#1e293b', border: '#334155',
  accent: '#6366f1', text: '#f1f5f9', muted: '#94a3b8',
};

const ROLE_COLORS: Record<string, string> = {
  admin: '#ef4444', manager: '#f59e0b', technician: '#22c55e',
};

interface QuickAction {
  label: string; icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string; route?: string; action?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'New Session', icon: 'chatbubble-ellipses-outline', color: '#6366f1', action: 'new-chat' },
  { label: 'Search KB', icon: 'search-outline', color: '#38bdf8', route: '/(tabs)/search' },
  { label: 'Upload Manual', icon: 'cloud-upload-outline', color: '#22c55e', route: '/upload' },
  { label: 'View Machines', icon: 'hardware-chip-outline', color: '#f59e0b', route: '/admin' },
  { label: 'System Status', icon: 'pulse-outline', color: '#a78bfa', route: '/(tabs)/status' },
  { label: 'Admin Panel', icon: 'shield-checkmark-outline', color: '#ef4444', route: '/admin' },
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
    } catch { /* swallow */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  async function handleAction(action: QuickAction) {
    if (action.action === 'new-chat') {
      try {
        const conv = await createConversation();
        router.push(`/chat/${conv.conversation_id}`);
      } catch { /* TODO: toast */ }
    } else if (action.route) {
      router.push(action.route as never);
    }
  }

  const roleColor = ROLE_COLORS[user?.role ?? 'technician'] ?? C.muted;
  const displayName = user?.full_name ?? user?.email ?? 'User';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(); }} tintColor={C.accent} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{displayName}</Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: roleColor + '22', borderColor: roleColor }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.card}
            onPress={() => handleAction(action)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, { backgroundColor: action.color + '22' }]}>
              <Ionicons name={action.icon} size={24} color={action.color} />
            </View>
            <Text style={styles.cardLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Conversations */}
      <Text style={styles.sectionTitle}>Recent Conversations</Text>
      {loading ? (
        <ActivityIndicator color={C.accent} style={{ marginTop: 16 }} />
      ) : conversations.length === 0 ? (
        <Text style={styles.empty}>No conversations yet. Start a new session.</Text>
      ) : (
        conversations.map((conv) => (
          <TouchableOpacity
            key={conv.conversation_id}
            style={styles.convRow}
            onPress={() => router.push(`/chat/${conv.conversation_id}`)}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-outline" size={18} color={C.accent} />
            <View style={styles.convInfo}>
              <Text style={styles.convTitle} numberOfLines={1}>{conv.title}</Text>
              {conv.machine_name ? <Text style={styles.convMeta}>{conv.machine_name}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { color: C.muted, fontSize: 13 },
  name: { color: C.text, fontSize: 22, fontWeight: '700', marginTop: 2 },
  roleBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  roleText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  sectionTitle: { color: C.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  card: {
    width: '30.5%', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 14, alignItems: 'center', gap: 8,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardLabel: { color: C.text, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  convRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 14, marginBottom: 8,
  },
  convInfo: { flex: 1 },
  convTitle: { color: C.text, fontSize: 14, fontWeight: '600' },
  convMeta: { color: C.muted, fontSize: 12, marginTop: 2 },
  empty: { color: C.muted, fontSize: 14, textAlign: 'center', marginTop: 16 },
});

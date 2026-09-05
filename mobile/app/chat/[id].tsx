import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getConversationMessages,
  sendMessage,
  getMachines,
  disambiguate,
  type ConversationMessage,
} from '@/lib/api';
import type { Message, Machine, DisambiguationOption } from '@/lib/types';

const C = {
  bg: '#0f172a', surface: '#1e293b', border: '#334155',
  accent: '#6366f1', text: '#f1f5f9', muted: '#94a3b8',
  success: '#22c55e', error: '#ef4444', warning: '#f59e0b',
};

function toMessage(m: ConversationMessage): Message {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    response: m.response ?? undefined,
    timestamp: m.created_at,
  };
}

function UserBubble({ message }: { message: Message }) {
  return (
    <View style={styles.userBubbleWrap}>
      <View style={styles.userBubble}>
        <Text style={styles.userBubbleText}>{message.content}</Text>
      </View>
    </View>
  );
}

function AssistantBubble({ message }: { message: Message }) {
  const resp = message.response;
  return (
    <View style={styles.asstBubbleWrap}>
      <View style={styles.asstBubble}>
        {resp ? (
          <>
            <Text style={styles.asstSummary}>{resp.summary}</Text>
            {resp.corrective_steps?.length > 0 && (
              <View style={styles.stepsBlock}>
                {resp.corrective_steps.map((step) => (
                  <View key={step.step_number} style={styles.step}>
                    <View style={styles.stepNum}><Text style={styles.stepNumText}>{step.step_number}</Text></View>
                    <Text style={styles.stepAction}>{step.action}</Text>
                  </View>
                ))}
              </View>
            )}
            {resp.confidence_level && (
              <Text style={styles.confidence}>Confidence: {resp.confidence_level}</Text>
            )}
          </>
        ) : (
          <Text style={styles.asstSummary}>{message.content}</Text>
        )}
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [disambigOptions, setDisambigOptions] = useState<DisambiguationOption[]>([]);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const [showDisambig, setShowDisambig] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => { navigation.setOptions({ title: 'Conversation' }); }, [navigation]);

  useEffect(() => {
    Promise.all([
      getConversationMessages(id).then((data) => {
        setMessages(data.messages.map(toMessage));
        if (data.machine_id) setSelectedMachine(data.machine_id);
      }).catch(() => {}),
      getMachines().then(setMachines).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [id]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    const optimistic: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await sendMessage(
        id,
        text,
        selectedMachine ?? undefined
      );

      const assistantMsg: Message = {
        id: response.message_id ?? Date.now().toString() + '-asst',
        role: 'assistant',
        content: response.summary,
        response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev.filter((m) => m.id !== optimistic.id), optimistic, assistantMsg]);

      if (response.answer_type === 'disambiguation_required') {
        setDisambigOptions(response.disambiguation_options ?? []);
        setPendingQuery(text);
        setShowDisambig(true);
      }
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Failed to send.';
      const errMessage: Message = {
        id: Date.now().toString() + '-err',
        role: 'assistant',
        content: errMsg,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMessage]);
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  async function handleDisambiguate(machineId: string) {
    setShowDisambig(false);
    setSending(true);
    try {
      const machine = machines.find((m) => m.id === machineId);
      const resp = await disambiguate(id, machineId, machine?.name);
      const msg: Message = {
        id: resp.message_id ?? Date.now().toString(),
        role: 'assistant',
        content: resp.summary,
        response: resp,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
      setSelectedMachine(machineId);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Disambiguation failed.';
      setMessages((prev) => [...prev, {
        id: Date.now().toString() + '-err',
        role: 'assistant',
        content: errMsg,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
      setPendingQuery(null);
    }
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator color={C.accent} size="large" /></View>;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.machineStrip} contentContainerStyle={styles.machineStripContent}>
        <TouchableOpacity style={[styles.mChip, !selectedMachine && styles.mChipActive]} onPress={() => setSelectedMachine(null)}>
          <Text style={[styles.mChipText, !selectedMachine && styles.mChipTextActive]}>All</Text>
        </TouchableOpacity>
        {machines.map((m) => (
          <TouchableOpacity key={m.id} style={[styles.mChip, selectedMachine === m.id && styles.mChipActive]} onPress={() => setSelectedMachine(m.id)}>
            <Text style={[styles.mChipText, selectedMachine === m.id && styles.mChipTextActive]}>{m.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={<Text style={styles.emptyText}>Ask a question about your equipment.</Text>}
        renderItem={({ item }) =>
          item.role === 'user' ? <UserBubble message={item} /> : <AssistantBubble message={item} />
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Describe the fault or ask a question…"
          placeholderTextColor={C.muted}
          multiline
          maxLength={2000}
          editable={!sending}
        />
        <TouchableOpacity style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]} onPress={handleSend} disabled={!input.trim() || sending}>
          {sending ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="send" size={18} color="#fff" />}
        </TouchableOpacity>
      </View>

      <Modal visible={showDisambig} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Machine</Text>
            <Text style={styles.modalSub}>Multiple machines match. Please select one:</Text>
            {disambigOptions.map((opt) => (
              <TouchableOpacity key={opt.machine_id} style={styles.disambigOption} onPress={() => handleDisambiguate(opt.machine_id)}>
                <Text style={styles.disambigName}>{opt.machine_name}</Text>
                <Text style={styles.disambigSnippet} numberOfLines={2}>{opt.snippet}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDisambig(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  centered: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  machineStrip: { backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, maxHeight: 44 },
  machineStripContent: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  mChip: { borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  mChipActive: { backgroundColor: C.accent, borderColor: C.accent },
  mChipText: { color: C.muted, fontSize: 12, fontWeight: '500' },
  mChipTextActive: { color: '#fff' },
  listContent: { padding: 16, paddingBottom: 8, flexGrow: 1 },
  emptyText: { color: C.muted, textAlign: 'center', marginTop: 40, fontSize: 14 },
  userBubbleWrap: { alignItems: 'flex-end', marginBottom: 10 },
  userBubble: { backgroundColor: C.accent, borderRadius: 14, borderBottomRightRadius: 4, padding: 12, maxWidth: '78%' },
  userBubbleText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  asstBubbleWrap: { alignItems: 'flex-start', marginBottom: 10 },
  asstBubble: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, borderBottomLeftRadius: 4, padding: 12, maxWidth: '88%' },
  asstSummary: { color: C.text, fontSize: 14, lineHeight: 20 },
  stepsBlock: { marginTop: 10, gap: 6 },
  step: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  stepNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  stepAction: { flex: 1, color: C.text, fontSize: 13, lineHeight: 18 },
  confidence: { color: C.muted, fontSize: 11, marginTop: 8 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.surface },
  input: { flex: 1, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: C.text, fontSize: 14, maxHeight: 120 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 12 },
  modalTitle: { color: C.text, fontSize: 18, fontWeight: '700' },
  modalSub: { color: C.muted, fontSize: 13 },
  disambigOption: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 14 },
  disambigName: { color: C.text, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  disambigSnippet: { color: C.muted, fontSize: 13 },
  cancelBtn: { paddingVertical: 14, alignItems: 'center' },
  cancelText: { color: C.muted, fontSize: 15 },
});

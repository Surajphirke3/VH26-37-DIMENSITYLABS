import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
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
import { useLanguage } from '@/lib/language-context';
import { colors, borderRadius, spacing, shadows } from '@/lib/theme';
import ConfidenceBadge from '@/components/common/ConfidenceBadge';

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

function AssistantBubble({
  message,
  onSelectSuggestion,
}: {
  message: Message;
  onSelectSuggestion?: (s: string) => void;
}) {
  const resp = message.response;
  const { t } = useLanguage();

  return (
    <View style={styles.asstBubbleWrap}>
      <View style={styles.asstBubble}>
        {/* Top AI Indicator Bar */}
        <View style={styles.aiTagRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={12} color={colors.accentAi} />
              <Text style={styles.aiBadgeText}>MEND - X AI</Text>
            </View>
            {resp?.language_detected && resp.language_detected.toLowerCase() !== 'en' && (
              <View style={styles.langDetectedBadge}>
                <Ionicons name="language-outline" size={11} color={colors.warning} />
                <Text style={styles.langDetectedText}>
                  LANG: {resp.language_name || resp.language_detected.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          {resp?.confidence_level && (
            <ConfidenceBadge level={resp.confidence_level as any} score={resp.evidence_score} />
          )}
        </View>

        {resp ? (
          <>
            {resp.error_meaning && (
              <View style={styles.errorMeaningBox}>
                <Ionicons name="information-circle" size={14} color={colors.accentCyan} />
                <Text style={styles.errorMeaningText}>{resp.error_meaning}</Text>
              </View>
            )}

            <Text style={styles.asstSummary}>{resp.summary}</Text>

            {resp.corrective_steps && resp.corrective_steps.length > 0 && (
              <View style={styles.stepsBlock}>
                <Text style={styles.stepsTitle}>{t('chat_corrective_steps')}</Text>
                {resp.corrective_steps.map((step) => (
                  <View key={step.step_number} style={styles.step}>
                    <View style={styles.stepNum}>
                      <Text style={styles.stepNumText}>{step.step_number}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stepAction}>{step.action}</Text>
                      {step.warning && (
                        <View style={styles.stepWarning}>
                          <Ionicons name="warning" size={12} color={colors.warning} />
                          <Text style={styles.stepWarningText}>{step.warning}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {resp.probable_causes && resp.probable_causes.length > 0 && (
              <View style={styles.metaBox}>
                <Text style={styles.metaTitle}>{t('chat_probable_causes')}</Text>
                <Text style={styles.metaContent}>{resp.probable_causes.map((c) => `• ${c}`).join('\n')}</Text>
              </View>
            )}

            {resp.citations && resp.citations.length > 0 && (
              <View style={styles.citationsBox}>
                <Text style={styles.metaTitle}>{t('chat_verified_citations')}</Text>
                {resp.citations.slice(0, 3).map((cit, idx) => (
                  <View key={cit.citation_id || idx} style={styles.citationItem}>
                    <Ionicons name="book-outline" size={12} color={colors.accent} />
                    <Text style={styles.citationText} numberOfLines={1}>
                      {cit.manual_name} ({t('chat_page')} {cit.page_start}–{cit.page_end})
                    </Text>
                    <Text style={styles.citationScore}>
                      {Math.round(cit.relevance_score * 100)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {resp.follow_up_suggestions && resp.follow_up_suggestions.length > 0 && (
              <View style={styles.suggestionsRow}>
                {resp.follow_up_suggestions.slice(0, 3).map((sugg, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.suggestionChip}
                    onPress={() => onSelectSuggestion?.(sugg)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="arrow-redo-outline" size={11} color={colors.accentCyan} />
                    <Text style={styles.suggestionText} numberOfLines={1}>{sugg}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
  const { id, prompt } = useLocalSearchParams<{ id: string; prompt?: string }>();
  const navigation = useNavigation();
  const { language, autoDetect, t, activeLanguageInfo } = useLanguage();
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

  useEffect(() => {
    navigation.setOptions({
      title: t('chat_title'),
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
    });
  }, [navigation, t]);

  useEffect(() => {
    Promise.all([
      getConversationMessages(id)
        .then((data) => {
          setMessages(data.messages.map(toMessage));
          if (data.machine_id) setSelectedMachine(data.machine_id);
        })
        .catch(() => {}),
      getMachines().then(setMachines).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [id]);

  // If prompt was passed via route params, prefill or auto-send
  useEffect(() => {
    if (prompt && !input) {
      setInput(decodeURIComponent(prompt));
    }
  }, [prompt]);

  async function handleSend(overrideQuery?: string) {
    const textToSend = overrideQuery || input;
    if (!textToSend.trim() || sending) return;
    const query = textToSend.trim();
    if (!overrideQuery) setInput('');
    setSending(true);

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      // If user selected a specific language and disabled auto-detect, inject directive
      let backendQuery = query;
      if (!autoDetect && language !== 'en') {
        backendQuery = `${query}\n\n[Respond in ${activeLanguageInfo.name} (${activeLanguageInfo.nativeName})]`;
      }

      const resp = await sendMessage(id, backendQuery, selectedMachine ?? undefined);
      if (resp.disambiguation_options && resp.disambiguation_options.length > 0) {
        setDisambigOptions(resp.disambiguation_options);
        setPendingQuery(query);
        setShowDisambig(true);
      } else {
        const asstMsg: Message = {
          id: resp.message_id || `asst-${Date.now()}`,
          role: 'assistant',
          content: resp.summary,
          response: resp,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, asstMsg]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Diagnostic request failed';
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Diagnostics Alert: ${msg}. Please ensure backend services are reachable.`,
        response: {
          answer_type: 'error',
          summary: `Request failed: ${msg}`,
          probable_causes: [],
          corrective_steps: [],
          citations: [],
          follow_up_suggestions: ['Retry diagnostics', 'Check system telemetry'],
        },
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  }

  async function handleDisambiguate(machineId: string) {
    setShowDisambig(false);
    setSelectedMachine(machineId);
    setSending(true);
    try {
      const resp = await disambiguate(id, machineId);
      const asstMsg: Message = {
        id: resp.message_id || `asst-${Date.now()}`,
        role: 'assistant',
        content: resp.summary,
        response: resp,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, asstMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Disambiguation request failed';
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Disambiguation Error: ${msg}`,
        response: {
          answer_type: 'error',
          summary: msg,
          probable_causes: [],
          corrective_steps: [],
          citations: [],
          follow_up_suggestions: [],
        },
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
      setPendingQuery(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {/* Machine Context Selector Strip */}
      <View style={styles.machineStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.machineStripContent}
        >
          <TouchableOpacity
            style={[
              styles.mChip,
              !selectedMachine && styles.mChipActive,
            ]}
            onPress={() => setSelectedMachine(null)}
          >
            <Text style={[styles.mChipText, !selectedMachine && styles.mChipTextActive]}>
              All Equipment
            </Text>
          </TouchableOpacity>

          {machines.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.mChip,
                selectedMachine === m.id && styles.mChipActive,
              ]}
              onPress={() => setSelectedMachine(m.id)}
            >
              <Text style={[styles.mChipText, selectedMachine === m.id && styles.mChipTextActive]}>
                {m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages Stream */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="hardware-chip-outline" size={32} color={colors.accent} />
            </View>
            <Text style={styles.emptyTitle}>{t('chat_empty_title')}</Text>
            <Text style={styles.emptyText}>{t('chat_empty_subtitle')}</Text>
          </View>
        }
        renderItem={({ item }) =>
          item.role === 'user' ? (
            <UserBubble message={item} />
          ) : (
            <AssistantBubble
              message={item}
              onSelectSuggestion={(sugg) => handleSend(sugg)}
            />
          )
        }
      />

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={t('chat_input_placeholder')}
          placeholderTextColor={colors.muted}
          multiline
          maxLength={2000}
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!input.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="arrow-up" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Disambiguation Modal */}
      <Modal visible={showDisambig} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('chat_select_machine')}</Text>
            <Text style={styles.modalSub}>{t('chat_select_machine_desc')}</Text>
            {disambigOptions.map((opt) => (
              <TouchableOpacity
                key={opt.machine_id}
                style={styles.disambigOption}
                onPress={() => handleDisambiguate(opt.machine_id)}
              >
                <Text style={styles.disambigName}>{opt.machine_name}</Text>
                <Text style={styles.disambigSnippet} numberOfLines={2}>
                  {opt.snippet}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDisambig(false)}>
              <Text style={styles.cancelText}>{t('btn_cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },

  machineStrip: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    maxHeight: 50,
  },
  machineStripContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  mChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.surfaceElevated,
  },
  mChipActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  mChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  mChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  listContent: {
    padding: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...shadows.glow,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },

  userBubbleWrap: {
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  userBubble: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    borderBottomRightRadius: 4,
    padding: 14,
    maxWidth: '82%',
    ...shadows.sm,
  },
  userBubbleText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  asstBubbleWrap: {
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  asstBubble: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: 4,
    padding: 16,
    maxWidth: '92%',
    ...shadows.sm,
  },
  aiTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  aiBadgeText: {
    color: colors.accentAi,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  langDetectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  langDetectedText: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  asstSummary: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },

  stepsBlock: {
    marginTop: 14,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  stepsTitle: {
    color: colors.accentViolet,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  step: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  stepNumText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  stepAction: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },

  metaBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaTitle: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaContent: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },

  errorMeaningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: colors.accentCyan,
    padding: 10,
    borderRadius: borderRadius.xs,
    marginBottom: 10,
  },
  errorMeaningText: {
    flex: 1,
    color: colors.accentCyan,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },

  stepWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  stepWarningText: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '600',
  },

  citationsBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  citationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  citationText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 11,
  },
  citationScore: {
    color: colors.accentAi,
    fontSize: 10,
    fontWeight: '700',
  },

  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  suggestionText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    maxHeight: 120,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glow,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surfaceOverlay,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  modalSub: {
    color: colors.muted,
    fontSize: 13,
  },
  disambigOption: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 14,
  },
  disambigName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  disambigSnippet: {
    color: colors.muted,
    fontSize: 12,
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.muted,
    fontSize: 15,
  },
});

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchKnowledgeBase, getMachines } from '@/lib/api';
import type { SearchResultItem, Machine } from '@/lib/types';
import { useFocusEffect } from 'expo-router';
import { colors, borderRadius, spacing, shadows } from '@/lib/theme';

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 75 ? colors.success : pct >= 50 ? colors.warning : colors.muted;
  const bg = pct >= 75 ? 'rgba(16, 185, 129, 0.12)' : pct >= 50 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(113, 113, 122, 0.12)';
  return (
    <View style={[styles.scoreBadge, { borderColor: color, backgroundColor: bg }]}>
      <Text style={[styles.scoreText, { color }]}>{pct}% MATCH</Text>
    </View>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useFocusEffect(useCallback(() => {
    getMachines().then(setMachines).catch(() => {});
  }, []));

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await searchKnowledgeBase(
        query.trim(),
        selectedMachine ?? undefined,
        20
      );
      setResults(data.items);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Search failed.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      {/* Search Header Container */}
      <View style={styles.topSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.accent} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search manuals, fault codes, specs…"
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Machine Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[styles.chip, !selectedMachine && styles.chipActive]}
            onPress={() => setSelectedMachine(null)}
          >
            <Text style={[styles.chipText, !selectedMachine && styles.chipTextActive]}>
              All Machines
            </Text>
          </TouchableOpacity>
          {machines.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.chip, selectedMachine === m.id && styles.chipActive]}
              onPress={() => setSelectedMachine(selectedMachine === m.id ? null : m.id)}
            >
              <Text style={[styles.chipText, selectedMachine === m.id && styles.chipTextActive]}>
                {m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.searchBtn, (!query.trim() || loading) && styles.searchBtnDisabled]}
          onPress={handleSearch}
          disabled={!query.trim() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={styles.btnRow}>
              <Text style={styles.searchBtnText}>Run Semantic Query</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Results List */}
      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item, index) => `${item.chunk_id}-${index}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          searched && !loading ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="search-outline" size={40} color={colors.muted} />
              <Text style={styles.emptyTitle}>No matching documentation found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your search terms or selecting 'All Machines'.
              </Text>
            </View>
          ) : !searched ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="library-outline" size={40} color={colors.accentMuted} />
              <Text style={styles.emptyTitle}>Industrial Semantic RAG</Text>
              <Text style={styles.emptyText}>
                Retrieve exact technical procedures, torque specs, and wiring diagrams across all ingested manuals.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.resultCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.manualTitle} numberOfLines={1}>
                {item.manual_title}
              </Text>
              <ScoreBadge score={item.similarity_score} />
            </View>

            {item.section_path ? (
              <View style={styles.sectionPill}>
                <Ionicons name="bookmark-outline" size={12} color={colors.accentViolet} />
                <Text style={styles.sectionTitle} numberOfLines={1}>
                  {item.section_path}
                </Text>
              </View>
            ) : null}

            <Text style={styles.snippet} numberOfLines={4}>
              {item.excerpt}
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.pageText}>
                {item.page_start ? `Page ${item.page_start}` : 'Document Chunk'}
              </Text>
              <Text style={styles.sourceText}>{item.machine_name || item.manual_title}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topSection: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 10,
  },

  filterRow: { maxHeight: 38 },
  filterContent: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  chipActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  searchBtn: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  searchBtnDisabled: {
    opacity: 0.5,
  },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  searchBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    padding: 12,
  },
  errorText: { color: colors.error, fontSize: 13, flex: 1 },

  listContent: { padding: 16, gap: 12 },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  manualTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  scoreBadge: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  sectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginBottom: 8,
  },
  sectionTitle: {
    color: colors.accentViolet,
    fontSize: 11,
    fontWeight: '600',
  },

  snippet: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  pageText: {
    color: colors.accentCyan,
    fontSize: 11,
    fontWeight: '600',
  },
  sourceText: {
    color: colors.muted,
    fontSize: 11,
  },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

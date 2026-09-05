import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { searchKnowledgeBase, getMachines } from '@/lib/api';
import type { SearchResultItem, Machine } from '@/lib/types';

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
  warning: colors.warning,
  error: colors.error,
};

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? C.success : pct >= 45 ? C.warning : C.error;
  return <View style={[S.scoreBadge, { borderColor: color }]}><Text style={[S.scoreText, { color }]}>{pct}%</Text></View>;
}

export default function InspectorScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useFocusEffect(useCallback(() => { getMachines().then(setMachines).catch(() => {}); }, []));

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true); setError(null); setSearched(true);
    try {
      const data = await searchKnowledgeBase(
        query.trim(),
        selectedMachine ?? undefined,
        30
      );
      setResults(data.items);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Search failed.'); setResults([]); }
    finally { setLoading(false); }
  }

  function navigateToResult(item: SearchResultItem) {
    router.push({ pathname: '/search-result', params: {
      chunk_id: item.chunk_id, manual_id: item.manual_id, manual_title: item.manual_title,
      machine_name: item.machine_name ?? '', page_start: String(item.page_start),
      page_end: String(item.page_end), section_path: item.section_path ?? '',
      similarity_score: String(item.similarity_score), excerpt: item.excerpt,
    }});
  }

  const EmptyComp = searched && !loading
    ? <Text style={S.emptyText}>No chunks found. Try a broader search term.</Text>
    : !searched ? <Text style={S.emptyText}>Enter any text to inspect matching knowledge base chunks. Min similarity is 0.0.</Text>
    : null;

  return (
    <View style={S.root}>
      <View style={S.searchBar}>
        <Ionicons name="search-outline" size={18} color={C.muted} style={{ marginRight: 8 }} />
        <TextInput style={S.input} value={query} onChangeText={setQuery} placeholder="Search chunks by text content…" placeholderTextColor={C.muted} returnKeyType="search" onSubmitEditing={handleSearch} />
        {query.length > 0 && <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}><Ionicons name="close-circle" size={18} color={C.muted} /></TouchableOpacity>}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.filterRow} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
        <TouchableOpacity style={[S.chip, !selectedMachine && S.chipActive]} onPress={() => setSelectedMachine(null)}>
          <Text style={[S.chipText, !selectedMachine && S.chipTextActive]}>All Machines</Text>
        </TouchableOpacity>
        {machines.map((m) => (
          <TouchableOpacity key={m.id} style={[S.chip, selectedMachine === m.id && S.chipActive]} onPress={() => setSelectedMachine(selectedMachine === m.id ? null : m.id)}>
            <Text style={[S.chipText, selectedMachine === m.id && S.chipTextActive]}>{m.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={S.searchBtn} onPress={handleSearch} disabled={loading || !query.trim()} activeOpacity={0.8}>
        {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={S.searchBtnText}>Inspect Chunks</Text>}
      </TouchableOpacity>

      {error && (
        <View style={S.errorRow}>
          <Ionicons name="alert-circle-outline" size={16} color={C.error} />
          <Text style={S.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleSearch}><Text style={S.retryInline}>Retry</Text></TouchableOpacity>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.chunk_id}
        style={S.list}
        contentContainerStyle={results.length === 0 ? S.emptyContainer : { paddingBottom: 24 }}
        ListHeaderComponent={searched && !loading && results.length > 0 ? <Text style={S.resultCount}>{results.length} chunk{results.length !== 1 ? 's' : ''} found</Text> : null}
        ListEmptyComponent={EmptyComp}
        renderItem={({ item }) => (
          <TouchableOpacity style={S.resultCard} onPress={() => navigateToResult(item)} activeOpacity={0.8}>
            <View style={S.resultHeader}>
              <View style={S.resultMeta}>
                <Text style={S.manualTitle} numberOfLines={1}>{item.manual_title}</Text>
                {item.machine_name ? <Text style={S.machineName}>{item.machine_name}</Text> : null}
              </View>
              <ScoreBadge score={item.similarity_score} />
            </View>
            <Text style={S.excerpt} numberOfLines={3}>{item.excerpt}</Text>
            <View style={S.resultFooter}>
              <Text style={S.pageInfo}>pp. {item.page_start}–{item.page_end}</Text>
              {item.section_path ? <Text style={S.sectionPath} numberOfLines={1}>{item.section_path}</Text> : null}
              <Ionicons name="chevron-forward" size={14} color={C.muted} style={{ marginLeft: 'auto' }} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, padding: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 },
  input: { flex: 1, color: C.text, fontSize: 15, paddingVertical: 12 },
  filterRow: { marginBottom: 12, maxHeight: 40 },
  chip: { borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { color: C.muted, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  searchBtn: { backgroundColor: C.accent, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 14 },
  searchBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  errorText: { color: C.error, fontSize: 13, flex: 1 },
  retryInline: { color: C.accent, fontSize: 13, fontWeight: '600' },
  resultCount: { color: C.muted, fontSize: 12, marginBottom: 10 },
  list: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  emptyText: { color: C.muted, fontSize: 14, textAlign: 'center', lineHeight: 21 },
  resultCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 14, marginBottom: 10 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  resultMeta: { flex: 1, marginRight: 8 },
  manualTitle: { color: C.text, fontSize: 14, fontWeight: '600' },
  machineName: { color: C.accent, fontSize: 12, marginTop: 2 },
  scoreBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  scoreText: { fontSize: 12, fontWeight: '700' },
  excerpt: { color: C.muted, fontSize: 13, lineHeight: 18, marginBottom: 8 },
  resultFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pageInfo: { color: '#64748b', fontSize: 11, fontWeight: '600' },
  sectionPath: { color: '#64748b', fontSize: 11, flex: 1 },
});

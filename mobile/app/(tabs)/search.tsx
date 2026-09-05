import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchKnowledgeBase, getMachines } from '@/lib/api';
import type { SearchResultItem, Machine } from '@/lib/types';
import { useFocusEffect } from 'expo-router';

const C = {
  bg: '#0f172a', surface: '#1e293b', border: '#334155',
  accent: '#6366f1', text: '#f1f5f9', muted: '#94a3b8',
  success: '#22c55e', error: '#ef4444',
};

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? C.success : pct >= 60 ? '#f59e0b' : C.muted;
  return (
    <View style={[styles.scoreBadge, { borderColor: color }]}>
      <Text style={[styles.scoreText, { color }]}>{pct}%</Text>
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
    setLoading(true); setError(null); setSearched(true);
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
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={C.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search knowledge base…"
          placeholderTextColor={C.muted}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Ionicons name="close-circle" size={18} color={C.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Machine filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        <TouchableOpacity
          style={[styles.chip, !selectedMachine && styles.chipActive]}
          onPress={() => setSelectedMachine(null)}
        >
          <Text style={[styles.chipText, !selectedMachine && styles.chipTextActive]}>All Machines</Text>
        </TouchableOpacity>
        {machines.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.chip, selectedMachine === m.id && styles.chipActive]}
            onPress={() => setSelectedMachine(selectedMachine === m.id ? null : m.id)}
          >
            <Text style={[styles.chipText, selectedMachine === m.id && styles.chipTextActive]}>{m.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading} activeOpacity={0.8}>
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.searchBtnText}>Search</Text>}
      </TouchableOpacity>

      {/* Error */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.chunk_id}
        style={styles.list}
        contentContainerStyle={results.length === 0 ? styles.emptyContainer : { paddingBottom: 24 }}
        ListEmptyComponent={
          searched && !loading
            ? <Text style={styles.emptyText}>No results found. Try a different query.</Text>
            : !searched ? <Text style={styles.emptyText}>Enter a query to search the knowledge base.</Text>
            : null
        }
        renderItem={({ item }) => (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.resultMeta}>
                <Text style={styles.manualTitle} numberOfLines={1}>{item.manual_title}</Text>
                {item.machine_name && <Text style={styles.machineName}>{item.machine_name}</Text>}
              </View>
              <ScoreBadge score={item.similarity_score} />
            </View>
            <Text style={styles.excerpt} numberOfLines={4}>{item.excerpt}</Text>
            <Text style={styles.pageInfo}>
              pp. {item.page_start}–{item.page_end}
              {item.section_path ? ` · ${item.section_path}` : ''}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, padding: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 12, marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, color: C.text, fontSize: 15, paddingVertical: 12 },
  filterRow: { marginBottom: 12, maxHeight: 40 },
  filterContent: { gap: 8, paddingRight: 8 },
  chip: { borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { color: C.muted, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  searchBtn: { backgroundColor: C.accent, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 16 },
  searchBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  errorText: { color: C.error, fontSize: 13, marginBottom: 12 },
  list: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: C.muted, fontSize: 14, textAlign: 'center' },
  resultCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 14, marginBottom: 10 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  resultMeta: { flex: 1, marginRight: 8 },
  manualTitle: { color: C.text, fontSize: 14, fontWeight: '600' },
  machineName: { color: C.accent, fontSize: 12, marginTop: 2 },
  scoreBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  scoreText: { fontSize: 12, fontWeight: '700' },
  excerpt: { color: C.muted, fontSize: 13, lineHeight: 19, marginBottom: 6 },
  pageInfo: { color: '#64748b', fontSize: 11 },
});

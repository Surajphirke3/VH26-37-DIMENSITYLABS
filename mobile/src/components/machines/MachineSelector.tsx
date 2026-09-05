import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Machine } from "@/lib/types";
import { colors, typography, spacing, borderRadius, shadows } from "@/lib/theme";

interface MachineSelectorProps {
  machines: Machine[];
  selected: Machine | null;
  onChange: (machine: Machine | null) => void;
  placeholder?: string;
}

export default function MachineSelector({
  machines,
  selected,
  onChange,
  placeholder = "Select machine…",
}: MachineSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? machines.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.model?.toLowerCase().includes(query.toLowerCase()) ||
          m.manufacturer?.toLowerCase().includes(query.toLowerCase())
      )
    : machines;

  const handleSelect = (machine: Machine) => {
    onChange(machine);
    setOpen(false);
    setQuery("");
  };

  const handleClear = () => {
    onChange(null);
  };

  return (
    <>
      <TouchableOpacity style={styles.pill} onPress={() => setOpen(true)} activeOpacity={0.8}>
        {selected ? (
          <>
            <Ionicons name="hardware-chip-outline" size={14} color={colors.accent} />
            <Text style={styles.pillText} numberOfLines={1}>{selected.name}</Text>
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="close-circle" size={16} color={colors.muted} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.pillPlaceholder}>{placeholder}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.muted} />
          </>
        )}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <SafeAreaView style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Select Machine</Text>
              <TouchableOpacity onPress={() => { setOpen(false); setQuery(""); }}>
                <Ionicons name="close" size={22} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={16} color={colors.muted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search machines…"
                placeholderTextColor={colors.muted}
                autoFocus
                selectionColor={colors.accent}
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(m) => m.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.option} onPress={() => handleSelect(item)} activeOpacity={0.78}>
                  <Text style={styles.optionName}>{item.name}</Text>
                  {item.manufacturer || item.model ? (
                    <Text style={styles.optionSub}>
                      {[item.manufacturer, item.model].filter(Boolean).join(" · ")}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignSelf: "flex-start", maxWidth: "100%" },
  pillText: { fontSize: typography.size.sm, color: colors.text, fontWeight: typography.weight.medium, maxWidth: 180 },
  pillPlaceholder: { fontSize: typography.size.sm, color: colors.muted },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, borderTopWidth: 1, borderColor: colors.border, maxHeight: "70%", ...shadows.lg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.text },
  searchWrap: { flexDirection: "row", alignItems: "center", margin: spacing.md, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.sm },
  searchIcon: { marginRight: spacing.xs },
  searchInput: { flex: 1, paddingVertical: spacing.sm + 2, fontSize: typography.size.base, color: colors.text },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  option: { paddingVertical: spacing.md },
  optionName: { fontSize: typography.size.base, fontWeight: typography.weight.medium, color: colors.text },
  optionSub: { fontSize: typography.size.sm, color: colors.muted, marginTop: 2 },
  sep: { height: 1, backgroundColor: colors.border },
});

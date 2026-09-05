import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
} from "react-native";
import { colors, borderRadius, typography, spacing } from "@/lib/theme";

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  error,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : focused
    ? colors.accent
    : colors.border;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          { borderColor },
          focused && styles.inputFocused,
          multiline && styles.multiline,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        selectionColor={colors.accent}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: typography.size.base,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceOverlay,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
    paddingTop: spacing.sm + 4,
  },
  error: {
    fontSize: typography.size.xs,
    color: colors.error,
    marginTop: 2,
  },
});

import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, borderRadius, spacing, shadows } from "@/lib/theme";

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Ask about a machine issue…",
}: MessageInputProps) {
  const [text, setText] = useState("");

  const canSend = text.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    const trimmed = text.trim();
    setText("");
    onSend(trimmed);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          multiline
          maxLength={2000}
          scrollEnabled
          returnKeyType="default"
          editable={!disabled}
          selectionColor={colors.accent}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, canSend && styles.sendBtnActive]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-up"
            size={18}
            color={canSend ? "#ffffff" : colors.muted}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.text,
    maxHeight: 96,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sendBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    ...shadows.glow,
  },
});

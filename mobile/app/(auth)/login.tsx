import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/lib/auth-context';
import { API_BASE_URL } from '@/constants/config';

const C = {
  bg: '#0f172a', surface: '#1e293b', border: '#334155',
  accent: '#6366f1', text: '#f1f5f9', muted: '#94a3b8', error: '#ef4444',
  success: '#10b981', cardChip: '#334155',
};

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('tech@mechind.com');
  const [password, setPassword] = useState('Tech@123');
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError ?? error;

  async function handleLogin() {
    setLocalError(null);
    clearError();
    if (!email.trim()) { setLocalError('Email is required.'); return; }
    if (!password) { setLocalError('Password is required.'); return; }
    try {
      await login(email.trim().toLowerCase(), password);
    } catch {
      // Error is set in auth context — no additional handling needed
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>MX</Text>
          </View>
          <Text style={styles.appName}>MEND-X</Text>
          <Text style={styles.tagline}>Industrial Knowledge Platform</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSub}>
            Use your company credentials to access the system.
          </Text>

          {displayError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@company.com"
              placeholderTextColor={C.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!isLoading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={C.muted}
              secureTextEntry
              textContentType="password"
              editable={!isLoading}
              onSubmitEditing={handleLogin}
              returnKeyType="go"
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.btnText}>Sign In</Text>
            }
          </TouchableOpacity>

          {/* Quick Demo Credentials */}
          <View style={styles.quickFillContainer}>
            <Text style={styles.quickFillLabel}>DEMO ACCOUNTS:</Text>
            <View style={styles.quickFillRow}>
              <TouchableOpacity
                style={[styles.chip, email === 'tech@mechind.com' && styles.chipActive]}
                onPress={() => { setEmail('tech@mechind.com'); setPassword('Tech@123'); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, email === 'tech@mechind.com' && styles.chipTextActive]}>
                  Technician
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, email === 'admin@mechind.com' && styles.chipActive]}
                onPress={() => { setEmail('admin@mechind.com'); setPassword('Admin@123'); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, email === 'admin@mechind.com' && styles.chipTextActive]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.serverBox}>
            <Text style={styles.serverText}>API: {API_BASE_URL}</Text>
          </View>

          <Text style={styles.hint}>
            Contact your administrator if you need access.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brand: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  logoText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  appName: { color: C.text, fontSize: 28, fontWeight: '800', letterSpacing: 2 },
  tagline: { color: C.muted, fontSize: 13, marginTop: 4 },
  card: {
    backgroundColor: C.surface, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, padding: 24,
  },
  cardTitle: { color: C.text, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  cardSub: { color: C.muted, fontSize: 13, marginBottom: 20, lineHeight: 18 },
  errorBox: {
    backgroundColor: '#450a0a', borderWidth: 1, borderColor: C.error,
    borderRadius: 8, padding: 12, marginBottom: 16,
  },
  errorText: { color: C.error, fontSize: 13 },
  field: { marginBottom: 16 },
  label: { color: C.muted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12,
    color: C.text, fontSize: 15,
  },
  btn: {
    backgroundColor: C.accent, borderRadius: 8, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  quickFillContainer: { marginTop: 18 },
  quickFillLabel: { color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  quickFillRow: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    paddingVertical: 10, borderRadius: 8, alignItems: 'center',
  },
  chipActive: { borderColor: C.accent, backgroundColor: '#1e1b4b' },
  chipText: { color: C.muted, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#a5b4fc', fontWeight: '700' },
  serverBox: {
    marginTop: 16, padding: 8, backgroundColor: C.bg, borderRadius: 6,
    borderWidth: 1, borderColor: C.border, alignItems: 'center',
  },
  serverText: { color: C.muted, fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  hint: { color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 14 },
});

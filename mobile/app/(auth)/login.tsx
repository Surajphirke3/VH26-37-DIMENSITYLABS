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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { API_BASE_URL } from '@/constants/config';
import { colors, borderRadius, spacing, shadows } from '@/lib/theme';

type LoginMode = 'technician' | 'admin';

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuth();
  const [loginMode, setLoginMode] = useState<LoginMode>('technician');
  const [email, setEmail] = useState('tech@mechind.com');
  const [password, setPassword] = useState('Tech@123');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError ?? error;

  function switchMode(mode: LoginMode) {
    setLoginMode(mode);
    setLocalError(null);
    clearError();
    if (mode === 'admin') {
      setEmail('admin@mechind.com');
      setPassword('Admin@123');
    } else {
      setEmail('tech@mechind.com');
      setPassword('Tech@123');
    }
  }

  async function handleLogin() {
    setLocalError(null);
    clearError();
    if (!email.trim()) { setLocalError('Email is required.'); return; }
    if (!password) { setLocalError('Password is required.'); return; }
    try {
      await login(email.trim().toLowerCase(), password);
    } catch {
      // Auth error is captured in context
    }
  }

  const activeAccent = loginMode === 'technician' ? colors.accentAi : colors.accent;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />

      {/* Top Ambient Cyber Glow Line matching Web Frontend */}
      <View
        style={[
          styles.ambientLine,
          { backgroundColor: activeAccent },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Section */}
        <View style={styles.brand}>
          <View style={[styles.logoBox, { shadowColor: colors.accent }]}>
            <Text style={styles.logoText}>MX</Text>
          </View>
          <Text style={styles.appName}>MEND - X</Text>
          <Text style={styles.tagline}>From Failure to Function</Text>
          <Text style={styles.subTagline}>Industrial Knowledge & Diagnostics Platform</Text>
        </View>

        {/* Role Preset Tabs */}
        <View style={styles.roleTabs}>
          <TouchableOpacity
            style={[
              styles.roleTab,
              loginMode === 'technician' && [styles.roleTabActive, { borderColor: colors.accentAi }],
            ]}
            onPress={() => switchMode('technician')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="construct-outline"
              size={16}
              color={loginMode === 'technician' ? colors.accentAi : colors.muted}
            />
            <Text
              style={[
                styles.roleTabText,
                loginMode === 'technician' && { color: colors.accentAi, fontWeight: '700' },
              ]}
            >
              Technician
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleTab,
              loginMode === 'admin' && [styles.roleTabActive, { borderColor: colors.accent }],
            ]}
            onPress={() => switchMode('admin')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={loginMode === 'admin' ? colors.accent : colors.muted}
            />
            <Text
              style={[
                styles.roleTabText,
                loginMode === 'admin' && { color: colors.accent, fontWeight: '700' },
              ]}
            >
              Admin
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cyber Card */}
        <View style={styles.card}>
          <View style={[styles.cardTopHighlight, { backgroundColor: activeAccent }]} />

          <Text style={styles.cardTitle}>
            {loginMode === 'technician' ? 'Field Technician Portal' : 'System Administration'}
          </Text>
          <Text style={styles.cardSub}>
            {loginMode === 'technician'
              ? 'Instant machine diagnostics, manual retrieval, and AI triage'
              : 'Full document ingestion, user management, and audit telemetry'}
          </Text>

          {displayError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}

          {/* Email Field */}
          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={colors.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="operator@company.com"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { paddingRight: 40 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                onSubmitEditing={handleLogin}
                returnKeyType="go"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[
              styles.btn,
              { backgroundColor: activeAccent },
              isLoading && styles.btnDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={styles.btnRow}>
                <Text style={styles.btnText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {/* API Connection Indicator */}
          <View style={styles.serverBox}>
            <View style={styles.serverDot} />
            <Text style={styles.serverText}>API: {API_BASE_URL}</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  ambientLine: {
    height: 3,
    width: '100%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4,
  },
  container: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  brand: { alignItems: 'center', marginBottom: 24 },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...shadows.glow,
  },
  logoText: { color: '#ffffff', fontSize: 24, fontWeight: '800', letterSpacing: 1 },
  appName: { color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: 3 },
  tagline: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 3 },
  subTagline: { color: colors.muted, fontSize: 11, marginTop: 2 },

  roleTabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 11,
  },
  roleTabActive: {
    backgroundColor: colors.surfaceElevated,
  },
  roleTabText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.md,
  },
  cardTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  cardTitle: { color: colors.text, fontSize: 19, fontWeight: '700', marginBottom: 4 },
  cardSub: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginBottom: 20 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: borderRadius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: colors.error, fontSize: 12, flex: 1, fontWeight: '500' },

  field: { marginBottom: 16 },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  inputWrap: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingLeft: 42,
    paddingRight: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },

  btn: {
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    ...shadows.glow,
  },
  btnDisabled: { opacity: 0.6 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },

  serverBox: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serverDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  serverText: {
    color: colors.muted,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

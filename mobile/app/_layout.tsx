// Root layout — auth gate + providers
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/lib/auth-context';

// ─── Auth Gate ────────────────────────────────────────────────────────────────
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not authenticated — send to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Already authenticated — send to main app
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  return <>{children}</>;
}

import { colors } from '@/lib/theme';

// ─── Stack Navigator ──────────────────────────────────────────────────────────
function RootStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        contentStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="chat/[id]"
        options={{ title: 'Conversation', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="document/[id]"
        options={{ title: 'Manual Detail', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="upload"
        options={{ title: 'Upload Manual', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="admin"
        options={{ title: 'Admin Panel', headerBackTitle: 'Back' }}
      />
    </Stack>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor={colors.background} />
        <AuthGate>
          <RootStack />
        </AuthGate>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

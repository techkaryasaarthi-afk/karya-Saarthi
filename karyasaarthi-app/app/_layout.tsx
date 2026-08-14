/**
 * Root Layout — The top-level layout for the entire app.
 * Handles: font loading, splash screen, auth hydration, React Query, and toast messages.
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/stores/authStore';
import { colors as staticColors, useAppTheme, ThemeColors } from '@/utils/theme';
import { useThemeStore } from '@/stores/themeStore';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import NetworkBanner from '@/components/common/NetworkBanner';
import useNotifications from '@/hooks/useNotifications';

import { initAnalytics } from '@/utils/analytics';

// Prevent splash screen from auto-hiding until we're ready
SplashScreen.preventAutoHideAsync();

// Initialize Crash Reporting and Analytics
initAnalytics();

// Create a React Query client with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AppShell() {
  const theme = useAppTheme();
  const { theme: themeMode } = useThemeStore();

  // Register for push notifications
  useNotifications();

  // Status bar style based on selected theme
  const statusBarStyle = themeMode === 'dark' ? 'light' : themeMode === 'light' ? 'dark' : 'auto';

  return (
    <>
      <StatusBar style={statusBarStyle} />
      <NetworkBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(customer)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(vendor)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(admin)" options={{ animation: 'fade' }} />
      </Stack>
      <Toast />
    </>
  );
}



export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  // Load Inter font family
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  // Hydrate auth state from SecureStore on app launch
  useEffect(() => {
    hydrate();
  }, []);

  // Hide splash screen when fonts are loaded and auth is hydrated
  const onLayoutReady = useCallback(async () => {
    if (fontsLoaded && isHydrated) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isHydrated]);

  if (!fontsLoaded || !isHydrated) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <View style={styles.container} onLayout={onLayoutReady}>
          <AppShell />
        </View>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: staticColors.background },
});

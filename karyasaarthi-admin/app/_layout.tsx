/**
 * Admin Root Layout — Font loading, auth guard, React Query, ErrorBoundary.
 * Only allows admin/super_admin/board_member/pillar_member roles.
 */

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/utils/theme';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import NetworkBanner from '@/components/common/NetworkBanner';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 2, refetchOnWindowFocus: false } },
});

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [fontsLoaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
  });

  useEffect(() => { hydrate(); }, []);

  const onLayoutReady = useCallback(async () => {
    if (fontsLoaded && isHydrated) await SplashScreen.hideAsync();
  }, [fontsLoaded, isHydrated]);

  if (!fontsLoaded || !isHydrated) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <View style={styles.container} onLayout={onLayoutReady}>
          <StatusBar style="light" />
          <NetworkBanner />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(admin)" options={{ animation: 'fade' }} />
          </Stack>
          <Toast />
        </View>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background } });

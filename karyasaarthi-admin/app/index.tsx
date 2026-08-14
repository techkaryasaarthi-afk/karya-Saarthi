/**
 * Admin Index — Splash screen with auth check + admin role guard.
 * Redirects non-admin users back to login with error message.
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAuthStore } from '@/stores/authStore';
import { ADMIN_ROLES } from '@/utils/constants';
import { colors, typography } from '@/utils/theme';

export default function AdminIndex() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }

    const userRole = user?.role?.toLowerCase();
    if (!userRole || !ADMIN_ROLES.includes(userRole as any)) {
      router.replace('/(auth)/login');
      return;
    }

    router.replace('/(admin)/dashboard');
  }, [isHydrated, isAuthenticated, user]);

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/icon.png')} style={styles.logo} contentFit="contain" />
      <Text style={styles.title}>Karyasaarthi Admin</Text>
      <ActivityIndicator size="large" color={colors.secondary} style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  logo: { width: 80, height: 80, borderRadius: 20 },
  title: { ...typography.headlineLg, color: colors.white, marginTop: 16 },
});

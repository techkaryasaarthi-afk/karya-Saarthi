/**
 * Index (Splash Router) — Redirects users based on auth state.
 * 
 * Flow:
 * - Not authenticated → Welcome screen
 * - Customer → Customer tabs
 * - Vendor → Vendor tabs
 * - Internal roles → Show "use admin app" message
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { ROLES } from '@/utils/constants';
import { colors } from '@/utils/theme';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated || !user) {
      router.replace('/(auth)/welcome');
      return;
    }

    // Route based on user role
    switch (user.role) {
      case ROLES.CUSTOMER:
        router.replace('/(customer)/home');
        break;
      case ROLES.VENDOR:
        router.replace('/(vendor)/dashboard');
        break;
      case ROLES.ADMIN:
      case ROLES.SUPER_ADMIN:
      case ROLES.BOARD_MEMBER:
      case ROLES.PILLAR_MEMBER:
        router.replace('/(admin)/dashboard');
        break;
      default:
        router.replace('/(auth)/welcome');
    }
  }, [isHydrated, isAuthenticated, user]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
});

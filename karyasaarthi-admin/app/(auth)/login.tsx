/**
 * Admin Login Screen — Secure, admin-only login with role validation.
 * Uses dark theme matching admin panel aesthetics.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { ADMIN_ROLES } from '@/utils/constants';
import { colors, spacing, typography, radius, shadows } from '@/utils/theme';

export default function AdminLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);

      const role = user.role?.toLowerCase();
      if (!role || !ADMIN_ROLES.includes(role as any)) {
        Toast.show({ type: 'error', text1: 'Access Denied', text2: 'You do not have admin privileges' });
        await useAuthStore.getState().logout();
        return;
      }

      router.replace('/(admin)/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      Toast.show({ type: 'error', text1: 'Login Failed', text2: msg });
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Image source={require('@/assets/icon.png')} style={styles.logo} contentFit="contain" />
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Karyasaarthi Management Console</Text>

          <View style={styles.formCard}>
            <Input label="Email" icon="mail-outline" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Input
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />
            <Button title="Login to Admin" onPress={handleLogin} loading={loading} variant="primary" size="lg" fullWidth style={{ marginTop: spacing.md }} />
          </View>

          <Text style={styles.footer}>Authorized Personnel Only</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.containerMargin },
  logo: { width: 72, height: 72, borderRadius: 18 },
  title: { ...typography.headlineLg, color: colors.white, marginTop: spacing.md },
  subtitle: { ...typography.bodyMd, color: 'rgba(255,255,255,0.6)', marginBottom: spacing.xl },
  formCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  footer: { ...typography.labelMd, color: 'rgba(255,255,255,0.3)', marginTop: spacing.xl },
});

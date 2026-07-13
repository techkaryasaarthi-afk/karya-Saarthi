/**
 * Forgot Password Screen — Email entry → reset link.
 * Mintlify: Clean white canvas, mint-green key icon, ink pill CTA.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { forgotPasswordApi } from '@/services/auth';
import { colors, spacing, typography, radius } from '@/utils/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      Toast.show({ type: 'error', text1: 'Please enter a valid email' });
      return;
    }
    setLoading(true);
    try {
      await forgotPasswordApi(email.trim().toLowerCase());
      Toast.show({ type: 'success', text1: 'Reset Link Sent', text2: 'Check your email inbox' });
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.ink} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="key-outline" size={36} color={colors.brandGreen} />
        </View>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        <Input
          label="Email Address"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={{ width: '100%', marginTop: spacing.xl }}
        />

        <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} variant="primary" size="lg" fullWidth style={{ marginTop: spacing.md }} />

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={{ marginTop: spacing.lg }}>
          <Text style={styles.backLink}>← Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  backBtn: { marginLeft: 16, marginTop: 8, width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.containerMargin, paddingTop: 40 },
  iconCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(0,212,164,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  title: { ...typography.headlineLg, color: colors.ink },
  subtitle: { ...typography.bodyMd, color: colors.steel, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22, paddingHorizontal: spacing.lg },
  backLink: { ...typography.labelLg, color: colors.ink },
});

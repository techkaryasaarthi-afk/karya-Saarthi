/**
 * Login Screen — Role-aware login with email/password.
 * Features: role selector pills, floating label inputs, remember me, forgot password link.
 * DESIGN.md: Atmospheric gradient hero header, mint-green accents, pill buttons.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';
import { ROLES } from '@/utils/constants';

type LoginRole = 'customer' | 'vendor';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const styles = useStyles(theme);

  const { login, isLoading, error, clearError } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState<LoginRole>(
    (params.role as LoginRole) || 'customer'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Email required', text2: 'Please enter your email address' });
      return;
    }
    if (!password) {
      Toast.show({ type: 'error', text1: 'Password required', text2: 'Please enter your password' });
      return;
    }

    try {
      clearError();
      const user = await login(email.trim().toLowerCase(), password, remember);

      if (user.role === ROLES.CUSTOMER) {
        router.replace('/(customer)/home');
      } else if (user.role === ROLES.VENDOR) {
        router.replace('/(vendor)/dashboard');
      } else {
        Alert.alert(
          'Admin Access',
          'Please use the Karya Saarthi Admin app for internal access. This app is for customers and vendors.',
          [{ text: 'OK' }]
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      Toast.show({ type: 'error', text1: 'Login Failed', text2: message });
    }
  }, [email, password, remember]);

  const roles: { key: LoginRole; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string }[] = [
    { key: 'customer', label: 'Customer', icon: 'person', desc: 'Get services done' },
    { key: 'vendor', label: 'Vendor', icon: 'briefcase', desc: 'Offer your services' },
  ];

  return (
    <View style={[styles.container, { paddingTop: 0 }]}>
      {/* ── Atmospheric gradient hero header ──────────────────────── */}
      <LinearGradient
        colors={[theme.heroDarkFrom, theme.heroDarkTo, '#1a4a3a']}
        style={[styles.topSection, { paddingTop: insets.top + 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={'rgba(255,255,255,0.9)'} />
        </TouchableOpacity>
        <View style={styles.heroLogoWrap}>
          <Image source={require('@/assets/icon.png')} style={styles.logo} contentFit="contain" />
        </View>
        <Text style={styles.heroTitle}>Welcome Back</Text>
        <Text style={styles.heroSubtitle}>Sign in to your account</Text>
      </LinearGradient>

      {/* ── Login form ────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formSection}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Role selector — card style */}
          <Text style={styles.sectionLabel}>Login as</Text>
          <View style={styles.roleSelector}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.key}
                onPress={() => setSelectedRole(role.key)}
                style={[styles.rolePill, selectedRole === role.key && styles.rolePillActive]}
              >
                <View style={[styles.roleIconWrap, selectedRole === role.key && styles.roleIconWrapActive]}>
                  <Ionicons
                    name={role.icon}
                    size={20}
                    color={selectedRole === role.key ? '#ffffff' : theme.stone}
                  />
                </View>
                <Text style={[styles.rolePillText, selectedRole === role.key && styles.rolePillTextActive]}>
                  {role.label}
                </Text>
                <Text style={[styles.roleDescText, selectedRole === role.key && styles.roleDescTextActive]}>
                  {role.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Inputs */}
          <Input
            label="Email Address"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />

          <Input
            label="Password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            autoComplete="password"
            textContentType="password"
          />

          {/* Remember + Forgot */}
          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.rememberRow} onPress={() => setRemember(!remember)}>
              <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
                {remember && <Ionicons name="checkmark" size={14} color={theme.white} />}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login CTA */}
          <Button
            title="Login"
            onPress={handleLogin}
            loading={isLoading}
            variant="primary"
            size="lg"
            fullWidth
            style={{ marginTop: spacing.xl }}
          />

          {/* Signup link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },

  // Atmospheric gradient hero header
  topSection: {
    alignItems: 'center',
    paddingBottom: 32,
    paddingHorizontal: spacing.containerMargin,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  backBtn: {
    position: 'absolute',
    left: spacing.containerMargin,
    top: 16,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroLogoWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logo: { width: 52, height: 52, borderRadius: radius.lg },
  heroTitle: { ...typography.headlineLg, color: '#ffffff', textAlign: 'center' },
  heroSubtitle: { ...typography.bodyMd, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 4 },

  // Form
  formSection: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.containerMargin, paddingTop: spacing.xl, paddingBottom: 40 },
  sectionLabel: { ...typography.microUppercase, color: theme.stone, letterSpacing: 0.5, marginBottom: spacing.sm },

  // Role cards — card style with icon
  roleSelector: { flexDirection: 'row', gap: 10, marginBottom: spacing.xl },
  rolePill: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: theme.hairline,
    backgroundColor: theme.white,
  },
  rolePillActive: {
    backgroundColor: 'rgba(0,212,164,0.06)',
    borderColor: theme.brandGreen,
  },
  roleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: theme.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconWrapActive: {
    backgroundColor: theme.brandGreen,
  },
  rolePillText: { ...typography.labelMd, color: theme.ink, fontWeight: '600', textAlign: 'center' },
  rolePillTextActive: { color: theme.ink, fontWeight: '700' },
  roleDescText: { ...typography.labelSm, color: theme.stone, textAlign: 'center', marginTop: 1 },
  roleDescTextActive: { color: theme.brandGreen },

  // Options row
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: -4 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 1.5,
    borderColor: theme.hairline, alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: theme.brandGreen, borderColor: theme.brandGreen },
  rememberText: { ...typography.bodyMd, color: theme.steel },
  forgotText: { ...typography.labelLg, color: theme.brandGreen },

  // Signup
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  signupText: { ...typography.bodyMd, color: theme.steel },
  signupLink: { ...typography.labelLg, color: theme.brandGreen, fontWeight: '700' },
});

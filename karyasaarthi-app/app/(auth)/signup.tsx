/**
 * Signup Screen — Multi-role registration with OTP email verification.
 * Connected to /api/auth/signup and /api/auth/send-signup-otp.
 * Mintlify: Flat white header, ink pill buttons, no shadows.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { signupApi, sendOtpApi } from '@/services/auth';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const styles = useStyles(theme);

  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (!fullname.trim()) return 'Full name is required';
    if (!email.trim() || !email.includes('@')) return 'Valid email is required';
    if (!phone.trim() || phone.length < 10) return 'Valid phone number is required';
    if (role === 'customer') {
      if (password.length < 8) return 'Password must be at least 8 characters';
      if (password !== confirmPassword) return 'Passwords do not match';
    }
    return null;
  };

  const handleSignup = useCallback(async () => {
    if (role === 'vendor') {
      router.push('/(auth)/vendor-apply');
      return;
    }

    const validationError = validate();
    if (validationError) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: validationError });
      return;
    }

    setLoading(true);
    try {
      await sendOtpApi(email.trim().toLowerCase());
      const queryParams = new URLSearchParams({
        email: email.trim().toLowerCase(),
        fullname: fullname.trim(),
        phone: phone.trim(),
        password,
        role,
        purpose: 'signup_verification',
      }).toString();
      router.push(`/(auth)/verify-otp?${queryParams}` as any);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setLoading(false);
    }
  }, [fullname, email, phone, password, confirmPassword, role]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Flat white header ─────────────────────────────────────── */}
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.ink} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.topTitle}>Create Account</Text>
          <Text style={styles.topSubtitle}>Join the Karya Saarthi family</Text>
        </View>
      </View>

      {/* ── Signup form ───────────────────────────────────────────── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formSection}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Role selector pills */}
          <View style={styles.roleRow}>
            {(['customer', 'vendor'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                onPress={() => setRole(r)}
              >
                <Ionicons
                  name={r === 'customer' ? 'person' : 'briefcase'}
                  size={14}
                  color={role === r ? theme.onPrimary : theme.stone}
                />
                <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                  {r === 'customer' ? 'Customer' : 'Vendor'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {role === 'vendor' && (
            <View style={styles.vendorInfoCard}>
              <Ionicons name="information-circle-outline" size={24} color={theme.primary} />
              <Text style={styles.vendorInfoText}>Vendor registrations require additional verification. You will be redirected to the application form.</Text>
            </View>
          )}

          <Input label="Full Name" icon="person-outline" value={fullname} onChangeText={setFullname} autoCapitalize="words" />
          <Input label="Email Address" icon="mail-outline" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Phone Number" icon="call-outline" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          
          {role === 'customer' && (
            <>
              <Input
                label="Password"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
              <Input
                label="Confirm Password"
                icon="lock-closed-outline"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </>
          )}

          <Button
            title={role === 'customer' ? "Send OTP & Continue" : "Continue to Application"}
            onPress={handleSignup}
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
            style={{ marginTop: spacing.md }}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.white },

  // Flat header
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.containerMargin,
    borderBottomWidth: 1,
    borderBottomColor: theme.hairline,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: theme.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerTextWrap: { flex: 1 },
  topTitle: { ...typography.headlineMd, color: theme.ink },
  topSubtitle: { ...typography.bodySm, color: theme.steel },

  // Form
  formSection: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.containerMargin, paddingTop: spacing.xl, paddingBottom: 40 },
  
  // Role pills
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
  roleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: radius.full, borderWidth: 1, borderColor: theme.hairline,
    backgroundColor: theme.white,
  },
  roleBtnActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  roleBtnText: { ...typography.labelMd, color: theme.stone },
  roleBtnTextActive: { color: theme.onPrimary, fontWeight: '600' },

  // Vendor Info
  vendorInfoCard: {
    backgroundColor: theme.surfaceContainer,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vendorInfoText: { ...typography.bodySm, color: theme.ink, flex: 1 },

  // Login link
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  loginText: { ...typography.bodyMd, color: theme.steel },
  loginLink: { ...typography.labelLg, color: theme.ink },
});

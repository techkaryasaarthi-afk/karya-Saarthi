/**
 * OTP Verification Screen — 6-digit OTP input with auto-submit.
 * Mintlify: Clean white canvas, mint-green filled OTP boxes, ink pill verify.
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Button from '@/components/ui/Button';
import { verifyOtpApi, signupApi, sendOtpApi } from '@/services/auth';
import { colors, spacing, typography, radius } from '@/utils/theme';

const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    email: string; fullname?: string; phone?: string;
    password?: string; role?: string; purpose?: string;
  }>();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < OTP_LENGTH - 1) { inputs.current[index + 1]?.focus(); }
    if (index === OTP_LENGTH - 1 && text) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === OTP_LENGTH) { handleVerify(fullOtp); }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) { inputs.current[index - 1]?.focus(); }
  };

  const handleVerify = useCallback(async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== OTP_LENGTH) { Toast.show({ type: 'error', text1: 'Enter complete OTP' }); return; }
    setLoading(true);
    try {
      await verifyOtpApi(params.email, code, params.purpose || 'signup_verification');
      if ((params.purpose === 'signup_verification' || !params.purpose) && params.fullname && params.phone && params.password) {
        await signupApi({ fullname: params.fullname, email: params.email, phone: params.phone, password: params.password, role: params.role || 'customer', email_verified: true });
        Toast.show({ type: 'success', text1: 'Account Created!', text2: 'Please login to continue' });
        router.replace('/(auth)/login');
      } else {
        Toast.show({ type: 'success', text1: 'OTP Verified!' });
        router.push('/(auth)/forgot-password');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid OTP';
      Toast.show({ type: 'error', text1: 'Verification Failed', text2: message });
    } finally { setLoading(false); }
  }, [otp, params]);

  const handleResend = async () => {
    setResending(true);
    try {
      await sendOtpApi(params.email, params.purpose || 'signup_verification');
      Toast.show({ type: 'success', text1: 'OTP Resent', text2: `Check ${params.email}` });
    } catch { Toast.show({ type: 'error', text1: 'Failed to resend OTP' }); }
    finally { setResending(false); }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.ink} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail-open-outline" size={36} color={colors.brandGreen} />
        </View>

        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.emailHighlight}>{params.email}</Text>
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputs.current[i] = ref; }}
              style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
              value={digit}
              onChangeText={(text) => handleChange(text.replace(/[^0-9]/g, ''), i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <Button title="Verify OTP" onPress={() => handleVerify()} loading={loading} variant="primary" size="lg" fullWidth style={{ marginTop: spacing.xl }} />

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't receive code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            <Text style={[styles.resendLink, resending && { opacity: 0.5 }]}>
              {resending ? 'Sending...' : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>
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
  subtitle: { ...typography.bodyMd, color: colors.steel, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  emailHighlight: { color: colors.brandGreen, fontWeight: '600' },
  otpRow: { flexDirection: 'row', gap: 10, marginTop: spacing.xl },
  otpInput: {
    width: 48, height: 56, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline,
    backgroundColor: colors.white, textAlign: 'center', fontSize: 22, fontWeight: '700', color: colors.ink,
  },
  otpInputFilled: { borderColor: colors.brandGreen, borderWidth: 2, backgroundColor: 'rgba(0,212,164,0.05)' },
  resendRow: { flexDirection: 'row', marginTop: spacing.lg },
  resendText: { ...typography.bodyMd, color: colors.steel },
  resendLink: { ...typography.labelLg, color: colors.brandGreen },
});

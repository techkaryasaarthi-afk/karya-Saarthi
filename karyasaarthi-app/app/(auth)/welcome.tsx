/**
 * Welcome Screen — First screen users see when opening the app.
 * Features: Karyasaarthi branding, tagline, role selection, login/signup CTAs.
 * Mintlify: Atmospheric hero gradient, flat surface cards, pill buttons.
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';
import { APP_INFO } from '@/utils/constants';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.container}>
      {/* ── Atmospheric hero gradient ──────────────────────────────── */}
      <LinearGradient
        colors={[theme.heroDarkFrom, theme.heroDarkTo, '#1a4a3a']}
        style={[styles.topSection, { paddingTop: insets.top + 20 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/icon.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        {/* App name & tagline */}
        <Text style={styles.appName}>{APP_INFO.NAME}</Text>
        <Text style={styles.tagline}>{APP_INFO.TAGLINE}</Text>

        {/* Stats row — frosted glass style */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8★</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Bottom card section ───────────────────────────────────── */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 20 }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.heading}>Get Started</Text>
          <Text style={styles.subtitle}>
            Your trusted partner for academic, technical & business services
          </Text>

          {/* Role selection cards — 2-column clean layout */}
          <View style={styles.roleCards}>
            <Card
              variant="elevated"
              onPress={() => router.push('/(auth)/login?role=customer' as any)}
              style={styles.roleCard}
            >
              <View style={[styles.roleIcon, { backgroundColor: theme.primary }]}>
                <Ionicons name="person" size={22} color={'#ffffff'} />
              </View>
              <Text style={styles.roleTitle}>Customer</Text>
              <Text style={styles.roleDesc}>Get services done</Text>
            </Card>

            <Card
              variant="elevated"
              onPress={() => router.push('/(auth)/vendor-apply')}
              style={styles.roleCard}
            >
              <View style={[styles.roleIcon, { backgroundColor: theme.brandGreen }]}>
                <Ionicons name="briefcase" size={22} color={'#000000'} />
              </View>
              <Text style={styles.roleTitle}>Vendor</Text>
              <Text style={styles.roleDesc}>Offer your services</Text>
            </Card>
          </View>

          {/* Main CTAs — Black pill + outlined pill */}
          <Button
            title="Login"
            onPress={() => router.push('/(auth)/login')}
            variant="primary"
            size="lg"
            fullWidth
            style={{ marginTop: spacing.lg }}
          />

          <Button
            title="Create Account"
            onPress={() => router.push('/(auth)/signup')}
            variant="secondary"
            size="lg"
            fullWidth
            style={{ marginTop: spacing.sm }}
          />

          {/* Explore link */}
          <Button
            title="Explore Karya Saarthi →"
            onPress={() => router.push('/(auth)/explore')}
            variant="ghost"
            size="md"
            style={{ marginTop: spacing.md, alignSelf: 'center' }}
          />
        </ScrollView>
      </View>
    </View>
  );
}

const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },

  // Atmospheric dark hero
  topSection: {
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  logoContainer: {
    width: 76,
    height: 76,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logo: { width: 56, height: 56, borderRadius: radius.lg },
  appName: {
    ...typography.displayLg,
    color: '#ffffff',
    textAlign: 'center',
  },
  tagline: {
    ...typography.bodyMd,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Frosted stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { ...typography.headlineSm, color: theme.brandGreen, fontWeight: '700' },
  statLabel: { ...typography.labelMd, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },

  // Bottom section
  bottomSection: {
    flex: 1,
    paddingHorizontal: spacing.containerMargin,
    marginTop: -16,
  },
  scrollContent: { paddingTop: spacing.xl },
  heading: { ...typography.headlineLg, color: theme.ink },
  subtitle: { ...typography.bodyMd, color: theme.steel, marginTop: 4 },

  // Role cards — 2-column
  roleCards: {
    flexDirection: 'row',
    gap: 12,
    marginTop: spacing.lg,
    justifyContent: 'center',
  },
  roleCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: 8,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: theme.hairline,
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  roleTitle: { ...typography.labelLg, color: theme.ink, textAlign: 'center', fontWeight: '700' },
  roleDesc: { ...typography.labelMd, color: theme.stone, textAlign: 'center', marginTop: 3 },
});

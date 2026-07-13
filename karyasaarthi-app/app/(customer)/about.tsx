/**
 * About Screen — Information about Karya Saarthi.
 * Mintlify: Flat UI, hairline borders, ink text.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';
import { APP_INFO } from '@/utils/constants';

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const s = useStyles(theme);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.ink} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>About Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.logoContainer}>
          <Image source={require('@/assets/icon.png')} style={s.logo} resizeMode="contain" />
          <Text style={s.appName}>{APP_INFO.NAME}</Text>
          <Text style={s.tagline}>{APP_INFO.TAGLINE}</Text>
          <Text style={s.version}>Version {APP_INFO.VERSION}</Text>
        </View>

        <Text style={s.sectionTitle}>Our Mission</Text>
        <Text style={s.paragraph}>
          Karya Saarthi is dedicated to bridging the gap between talent and opportunity. We aim to empower students, freelancers, and professionals by providing a seamless platform to collaborate, manage projects, and achieve their goals.
        </Text>

        <Text style={s.sectionTitle}>What We Do</Text>
        <Text style={s.paragraph}>
          Whether you need assistance with thesis writing, project reports, web development, or digital marketing, Karya Saarthi connects you with the right expertise. We handle the process from project creation to secure payment, ensuring quality and transparency at every step.
        </Text>
      </ScrollView>
    </View>
  );
}

const HP = spacing.containerMargin;
const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: HP, paddingVertical: spacing.md, backgroundColor: theme.white, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.headlineMd, color: theme.ink },
  content: { paddingHorizontal: HP, paddingTop: spacing.xl, paddingBottom: 60 },
  logoContainer: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { width: 120, height: 120, marginBottom: spacing.md },
  appName: { ...typography.displayMd, color: theme.ink, fontWeight: '700' },
  tagline: { ...typography.bodyMd, color: theme.primary, marginTop: 4, fontStyle: 'italic' },
  version: { ...typography.labelSm, color: theme.stone, marginTop: 8 },
  sectionTitle: { ...typography.headlineMd, color: theme.ink, marginBottom: 8, marginTop: spacing.md },
  paragraph: { ...typography.bodyMd, color: theme.steel, lineHeight: 24, marginBottom: spacing.md },
});

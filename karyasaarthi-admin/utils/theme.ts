/**
 * Design System Tokens — Mintlify-Inspired Design
 * Source of truth: DESIGN.md
 *
 * Clean, premium, developer-respected aesthetic:
 * Ink-black primary, Mintlify mint accent (#00d4a4), flat surfaces,
 * pill-shaped buttons, Inter typography, disciplined radius scale.
 *
 * All values optimised for mobile (React Native numeric units).
 */

export const lightColors = {
  // ── Primary (Ink Black) ──────────────────────────────────────────
  primary: '#0a0a0a',
  primaryDark: '#000000',
  primaryLight: '#1c1c1e',
  primaryContainer: '#3a3a3c',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#b3b3b3',

  // ── Brand Accent (Mintlify Mint Green) ───────────────────────────
  secondary: '#00d4a4',           // brand-green
  secondaryDark: '#00b48a',       // brand-green-deep
  secondaryContainer: '#7cebcb',  // brand-green-soft
  onSecondary: '#0a0a0a',         // ink on mint
  onSecondaryContainer: '#065F46',
  secondaryFixed: '#d1fae5',      // soft mint tint

  // ── Surface & Background ────────────────────────────────────────
  background: '#ffffff',          // canvas
  surface: '#ffffff',             // canvas
  surfaceContainer: '#f7f7f7',    // surface
  surfaceContainerHigh: '#ededed', // hairline-soft
  surfaceContainerLow: '#fafafa', // surface-soft
  surfaceDim: '#e5e5e5',          // hairline

  // ── Text ────────────────────────────────────────────────────────
  onBackground: '#0a0a0a',       // ink
  onSurface: '#0a0a0a',          // ink
  onSurfaceVariant: '#5a5a5c',   // steel
  outline: '#888888',            // stone
  outlineVariant: '#e5e5e5',     // hairline

  // ── Semantic ────────────────────────────────────────────────────
  success: '#059669',
  successLight: '#d1fae5',
  error: '#d45656',              // brand-error
  errorContainer: '#fee2e2',
  warning: '#c37d0d',           // brand-warn
  warningLight: '#fef3c7',
  info: '#3772cf',              // brand-tag
  infoLight: '#dbeafe',

  // ── Atmospheric Heroes ──────────────────────────────────────────
  heroSkyFrom: '#87a8c8',
  heroSkyTo: '#f5e9d8',
  heroDarkFrom: '#1a3d4a',
  heroDarkTo: '#2d5a4f',

  // ── Extended Text Scale ─────────────────────────────────────────
  ink: '#0a0a0a',
  charcoal: '#1c1c1e',
  slate: '#3a3a3c',
  steel: '#5a5a5c',
  stone: '#888888',
  muted: '#a8a8aa',
  onDark: '#ffffff',
  onDarkMuted: '#b3b3b3',

  // ── Utility ─────────────────────────────────────────────────────
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(10,10,10,0.5)',
  skeleton: '#ededed',
  divider: '#f7f7f7',
  inputBg: '#fafafa',
  inactive: '#a8a8aa',

  // ── Surface extras ──────────────────────────────────────────────
  surfaceCode: '#1c1c1e',
  hairline: '#e5e5e5',
  hairlineSoft: '#ededed',
  hairlineDark: '#1f1f1f',
  canvasDark: '#0a0a0a',

  // ── Brand accents ───────────────────────────────────────────────
  brandGreen: '#00d4a4',
  brandGreenDeep: '#00b48a',
  brandGreenSoft: '#7cebcb',
  brandTag: '#3772cf',
  brandAnnotate: '#1ba673',
  brandError: '#d45656',
};

export const darkColors = {
  ...lightColors,
  // ── Primary ──────────────────────────────────────────
  primary: '#ffffff',
  primaryDark: '#e0e0e0',
  primaryLight: '#b3b3b3',
  primaryContainer: '#a0a0a0',
  onPrimary: '#0a0a0a',
  onPrimaryContainer: '#3a3a3c',

  // ── Surface & Background ────────────────────────────────────────
  background: '#0a0a0a',
  surface: '#0a0a0a',
  surfaceContainer: '#1c1c1e',
  surfaceContainerHigh: '#2d2d2d',
  surfaceContainerLow: '#121212',
  surfaceDim: '#3a3a3c',

  // ── Text ────────────────────────────────────────────────────────
  onBackground: '#ffffff',
  onSurface: '#ffffff',
  onSurfaceVariant: '#a8a8aa',
  outline: '#888888',
  outlineVariant: '#3a3a3c',

  // ── Extended Text Scale ─────────────────────────────────────────
  ink: '#ffffff',
  charcoal: '#e0e0e0',
  slate: '#b3b3b3',
  steel: '#a8a8aa',
  stone: '#888888',
  muted: '#5a5a5c',
  onDark: '#0a0a0a',
  onDarkMuted: '#3a3a3c',

  // ── Utility ─────────────────────────────────────────────────────
  white: '#000000',
  black: '#ffffff',
  skeleton: '#2d2d2d',
  divider: '#1c1c1e',
  inputBg: '#121212',

  // ── Surface extras ──────────────────────────────────────────────
  surfaceCode: '#2d2d2d',
  hairline: '#3a3a3c',
  hairlineSoft: '#2d2d2d',
  hairlineDark: '#e5e5e5',
  canvasDark: '#ffffff',
};

// Aliased to prevent immediately breaking existing components
export const colors = lightColors;

import { useThemeStore } from '@/stores/themeStore';
import { useColorScheme } from 'react-native';

export function useAppTheme() {
  const { themeMode } = useThemeStore();
  const systemTheme = useColorScheme();
  
  const activeTheme = themeMode === 'system' ? (systemTheme || 'light') : themeMode;
  return activeTheme === 'dark' ? darkColors : lightColors;
}

export type ThemeColors = typeof lightColors;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  sectionSm: 48,
  section: 64,
  sectionLg: 96,
  hero: 120,
  containerMargin: 20,
  gutter: 16,
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

/**
 * Typography — Inter font family.
 * Mobile-scaled from DESIGN.md (web values ÷ ~1.5–2 for display sizes).
 * Weights: 400 Regular, 500 Medium, 600 SemiBold, 700 Bold for mobile readability.
 */
export const typography = {
  // Display — used sparingly on hero/marketing surfaces
  displayLg: { fontSize: 32, fontWeight: '700' as const, lineHeight: 38, letterSpacing: -0.8, fontFamily: 'Inter_700Bold' },

  // Headings
  headlineLg: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30, letterSpacing: -0.4, fontFamily: 'Inter_700Bold' },
  headlineMd: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26, letterSpacing: -0.2, fontFamily: 'Inter_600SemiBold' },
  headlineSm: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24, fontFamily: 'Inter_600SemiBold' },

  // Body
  bodyLg: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24, fontFamily: 'Inter_400Regular' },
  bodyMd: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21, fontFamily: 'Inter_400Regular' },
  bodySm: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18, fontFamily: 'Inter_400Regular' },

  // Medium-weight body
  bodyMdMedium: { fontSize: 14, fontWeight: '500' as const, lineHeight: 21, fontFamily: 'Inter_500Medium' },
  bodySmMedium: { fontSize: 14, fontWeight: '500' as const, lineHeight: 21, fontFamily: 'Inter_500Medium' },

  // Labels
  labelLg: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20, letterSpacing: 0.1, fontFamily: 'Inter_600SemiBold' },
  labelMd: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, fontFamily: 'Inter_500Medium' },
  labelSm: { fontSize: 10, fontWeight: '500' as const, lineHeight: 14, fontFamily: 'Inter_500Medium' },

  // Captions
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18, fontFamily: 'Inter_400Regular' },
  captionBold: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18, fontFamily: 'Inter_600SemiBold' },

  // Micro
  micro: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, fontFamily: 'Inter_500Medium' },
  microUppercase: { fontSize: 11, fontWeight: '600' as const, lineHeight: 15, letterSpacing: 0.5, fontFamily: 'Inter_600SemiBold' },

  // Button
  buttonMd: { fontSize: 14, fontWeight: '500' as const, lineHeight: 18, fontFamily: 'Inter_500Medium' },
} as const;

/**
 * Elevation — DESIGN.md's 5-tier system mapped to React Native shadows.
 * Predominantly flat; shadows used strategically.
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#0a0a0a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0a0a0a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0a0a0a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  brandGlow: {
    shadowColor: '#00d4a4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

/**
 * Animation timings — matches DESIGN.md recommendation of 150–200ms.
 */
export const animation = {
  fast: 150,
  normal: 200,
  slow: 350,
  spring: { damping: 18, stiffness: 180 },
} as const;

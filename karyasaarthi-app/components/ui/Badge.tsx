/**
 * Badge component — Mintlify design.
 * Maps to DESIGN.md badge tokens: discount, required, type, tag.
 * Uses disciplined radius scale (full for discount, sm for type/tag).
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { radius, spacing, useAppTheme } from '@/utils/theme';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'mint' | 'tag' | 'outline';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const variantRadius = {
  primary: radius.full,
  secondary: radius.sm,
  success: radius.sm,
  warning: radius.sm,
  error: radius.sm,
  info: radius.sm,
  neutral: radius.sm,
  mint: radius.full,
  tag: radius.sm,
};

export default function Badge({ text, variant = 'neutral', size = 'sm', style }: BadgeProps) {
  const theme = useAppTheme();
  
  const variantColors: Record<string, { bg: string, text: string, border?: string }> = {
    primary: { bg: theme.primary, text: theme.onPrimary },
    secondary: { bg: theme.surfaceContainer, text: theme.steel },
    success: { bg: theme.success + '20', text: theme.success },
    warning: { bg: theme.warning + '20', text: theme.warning },
    error: { bg: theme.error + '20', text: theme.error },
    info: { bg: theme.info + '20', text: theme.info },
    neutral: { bg: theme.surfaceContainer, text: theme.steel },
    mint: { bg: theme.brandGreen, text: theme.primary },
    tag: { bg: theme.brandTag + '15', text: theme.brandTag },
    outline: { bg: 'transparent', text: theme.stone, border: theme.hairline },
  };

  const colorScheme = variantColors[variant] || variantColors.neutral;
  return (
    <View
      style={[
        styles.base,
        size === 'md' && styles.md,
        { backgroundColor: colorScheme.bg, borderRadius: variantRadius[variant] || radius.sm },
        colorScheme.border ? { borderWidth: 1, borderColor: colorScheme.border } : null,
        style,
      ]}
    >
      <Text style={[styles.text, size === 'md' && styles.textMd, { color: colorScheme.text }]}>
        {text}
      </Text>
    </View>
  );
}

/** Small count badge (notification dot) */
export function CountBadge({ count, style }: { count: number; style?: ViewStyle }) {
  const theme = useAppTheme();
  if (count <= 0) return null;
  return (
    <View style={[styles.countBadge, { backgroundColor: theme.error }, style]}>
      <Text style={[styles.countText, { color: theme.primary }]}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  md: { paddingHorizontal: 12, paddingVertical: 4 },
  text: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  textMd: { fontSize: 13 },
  countBadge: {
    borderRadius: radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: { fontSize: 10, fontWeight: '700' },
});

/**
 * Badge component for status indicators, counts, and tags.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/utils/theme';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const variantColors = {
  primary: { bg: colors.primaryContainer, text: colors.onPrimary },
  secondary: { bg: colors.secondaryFixed, text: colors.secondaryDark },
  success: { bg: colors.successLight, text: '#065F46' },
  warning: { bg: colors.warningLight, text: '#92400E' },
  error: { bg: colors.errorContainer, text: '#991B1B' },
  info: { bg: colors.infoLight, text: '#1E40AF' },
  neutral: { bg: colors.surfaceContainerHigh, text: colors.onSurfaceVariant },
};

export default function Badge({ text, variant = 'neutral', size = 'sm', style }: BadgeProps) {
  const colorScheme = variantColors[variant];
  return (
    <View
      style={[
        styles.base,
        size === 'md' && styles.md,
        { backgroundColor: colorScheme.bg },
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
  if (count <= 0) return null;
  return (
    <View style={[styles.countBadge, style]}>
      <Text style={styles.countText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  md: { paddingHorizontal: 12, paddingVertical: 4 },
  text: { fontSize: 11, fontWeight: '600' },
  textMd: { fontSize: 13 },
  countBadge: {
    backgroundColor: colors.error,
    borderRadius: radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: { color: colors.white, fontSize: 10, fontWeight: '700' },
});

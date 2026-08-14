/**
 * Reusable Card component with elevation levels matching Stitch design system.
 * 16px border radius, subtle shadows, optional left accent border.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, shadows } from '@/utils/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat';
  accentColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
}

export default function Card({
  children,
  variant = 'elevated',
  accentColor,
  onPress,
  style,
  padding = spacing.md,
}: CardProps) {
  const cardStyle = [
    styles.base,
    { padding },
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'flat' && styles.flat,
    accentColor && { borderLeftWidth: 4, borderLeftColor: accentColor },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  elevated: {
    ...shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  flat: {
    backgroundColor: colors.surfaceContainerLow,
  },
});

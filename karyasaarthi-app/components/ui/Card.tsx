/**
 * Card component — Mintlify design with interactive micro-animations.
 * Predominantly flat (hairline border, no shadow).
 * Variants: base, feature, featured (mint glow), flat.
 * All cards use {rounded.lg} (12px) per DESIGN.md.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ThemeColors, radius, spacing, shadows, animation, useAppTheme } from '@/utils/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat' | 'featured';
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
  padding = spacing.xl,
}: CardProps) {
  const theme = useAppTheme();
  const styles = useStyles(theme);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, animation.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring);
  };

  const cardStyle = [
    styles.base,
    { padding },
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'flat' && styles.flat,
    variant === 'featured' && styles.featured,
    accentColor ? { borderLeftWidth: 3, borderLeftColor: accentColor } : undefined,
    style,
  ];

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            ...cardStyle,
            pressed && { backgroundColor: theme.surfaceContainerLow }
          ]}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const useStyles = (theme: ThemeColors) => StyleSheet.create({
  base: {
    borderRadius: radius.lg, // 12px — DESIGN.md card standard
    backgroundColor: theme.white,
    overflow: 'hidden',
  },
  elevated: {
    borderWidth: 1,
    borderColor: theme.hairline,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.hairline,
  },
  flat: {
    backgroundColor: theme.surfaceContainer, // #f7f7f7 — DESIGN.md surface
    borderWidth: 0,
  },
  featured: {
    borderWidth: 2,
    borderColor: theme.brandGreen,
    ...shadows.brandGlow,
  },
});

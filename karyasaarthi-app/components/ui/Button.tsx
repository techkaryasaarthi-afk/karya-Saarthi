/**
 * Reusable Button — Mintlify design system with Micro-Animations.
 * All buttons use pill shape ({rounded.full}) per DESIGN.md.
 * Variants: primary (ink), accent (mint), secondary (outlined), ghost, danger.
 */

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ThemeColors, radius, spacing, typography, animation, useAppTheme } from '@/utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const theme = useAppTheme();
  const styles = useStyles(theme);
  
  const isDisabled = disabled || loading;
  // Map 'outline' to 'secondary' for backward compat
  const v = variant === 'outline' ? 'secondary' : variant;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) scale.value = withSpring(0.96, animation.spring);
  };

  const handlePressOut = () => {
    if (!isDisabled) scale.value = withSpring(1, animation.spring);
  };

  return (
    <Animated.View style={[animatedStyle, fullWidth && styles.fullWidth]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          v === 'primary' && styles.primary,
          v === 'accent' && styles.accent,
          v === 'secondary' && styles.secondary,
          v === 'ghost' && styles.ghost,
          v === 'danger' && styles.danger,
          size === 'sm' && styles.size_sm,
          size === 'md' && styles.size_md,
          size === 'lg' && styles.size_lg,
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          pressed && v === 'ghost' && { backgroundColor: theme.surfaceContainerHigh },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={
              v === 'secondary' || v === 'ghost'
                ? theme.primary
                : v === 'accent'
                ? theme.onSecondary
                : theme.onPrimary
            }
          />
        ) : (
          <>
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            <Text
              style={[
                styles.text,
                v === 'primary' && styles.text_primary,
                v === 'accent' && styles.text_accent,
                v === 'secondary' && styles.text_secondary,
                v === 'ghost' && styles.text_ghost,
                v === 'danger' && styles.text_danger,
                size === 'sm' && styles.textSize_sm,
                size === 'md' && styles.textSize_md,
                size === 'lg' && styles.textSize_lg,
                icon ? { marginLeft: spacing.xs } : undefined,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const useStyles = (theme: ThemeColors) => StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full, // Pill shape — DESIGN.md mandate
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.45 },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },

  // ── Variants ────────────────────────────────────────────────────
  primary: {
    backgroundColor: theme.primary,    // Ink black
  },
  accent: {
    backgroundColor: theme.brandGreen, // Mintlify mint
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.hairline,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: theme.error,
  },

  // ── Sizes ───────────────────────────────────────────────────────
  size_sm: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 },
  size_md: { paddingVertical: 10, paddingHorizontal: 20, minHeight: 44 },
  size_lg: { paddingVertical: 14, paddingHorizontal: 28, minHeight: 52 },

  // ── Text ────────────────────────────────────────────────────────
  text: { ...typography.buttonMd },
  text_primary: { color: theme.onPrimary },
  text_accent: { color: theme.onSecondary },
  text_secondary: { color: theme.ink },
  text_ghost: { color: theme.ink },
  text_danger: { color: theme.onPrimary },

  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 14 },
  textSize_lg: { fontSize: 16 },
});

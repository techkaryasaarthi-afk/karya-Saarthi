/**
 * Reusable Button component with multiple variants.
 * Matches the Stitch design system — pill-shaped primary (amber), outline secondary (navy).
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, radius, spacing, typography, shadows } from '@/utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
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
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              styles[`text_${variant}`],
              styles[`textSize_${size}`],
              icon ? { marginLeft: spacing.sm } : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    ...shadows.sm,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  // Variants
  primary: { backgroundColor: colors.secondary },
  secondary: { backgroundColor: colors.primary },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
    ...shadows.none,
  },
  ghost: { backgroundColor: 'transparent', ...shadows.none },
  danger: { backgroundColor: colors.error },

  // Sizes
  size_sm: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 },
  size_md: { paddingVertical: 12, paddingHorizontal: 24, minHeight: 48 },
  size_lg: { paddingVertical: 16, paddingHorizontal: 32, minHeight: 56 },

  // Text
  text: { fontWeight: '600' },
  text_primary: { color: colors.white },
  text_secondary: { color: colors.white },
  text_outline: { color: colors.primary },
  text_ghost: { color: colors.primary },
  text_danger: { color: colors.white },

  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 17 },
});

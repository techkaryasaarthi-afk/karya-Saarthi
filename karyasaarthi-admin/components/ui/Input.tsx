/**
 * Text input with floating label, validation states, and icons.
 * Matches Stitch design — 16px radius, gray bg, navy focus border.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/utils/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: object;
}

export default function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  value,
  onFocus,
  onBlur,
  containerStyle,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: isFocused || value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 4] });
  const labelSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });

  const borderColor = error
    ? colors.error
    : isFocused
    ? colors.primary
    : colors.outlineVariant;

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => inputRef.current?.focus()}
        style={[styles.inputContainer, { borderColor }]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? colors.primary : colors.outline}
            style={styles.leftIcon}
          />
        )}
        <View style={styles.inputWrapper}>
          <Animated.Text
            style={[
              styles.label,
              {
                top: labelTop,
                fontSize: labelSize,
                color: error ? colors.error : isFocused ? colors.primary : colors.outline,
              },
            ]}
          >
            {label}
          </Animated.Text>
          <TextInput
            ref={inputRef}
            value={value}
            style={[styles.input, icon ? {} : { paddingLeft: 0 }]}
            placeholderTextColor={colors.outline}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
        </View>
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons
              name={rightIcon}
              size={20}
              color={colors.outline}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  leftIcon: { marginRight: spacing.sm },
  inputWrapper: { flex: 1, justifyContent: 'center', paddingTop: 8 },
  label: {
    position: 'absolute',
    left: 0,
    fontWeight: '500',
  },
  input: {
    fontSize: 15,
    color: colors.onSurface,
    paddingVertical: 8,
    paddingTop: 12,
  },
  rightIcon: { padding: 4 },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: spacing.md,
  },
});

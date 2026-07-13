/**
 * Text input with floating label — Mintlify design.
 * Focus state uses brand-green (mint) border per DESIGN.md text-input-focused.
 * Background: canvas white. Border: hairline gray. Rounded: md (8px).
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
import { ThemeColors, radius, spacing, typography, useAppTheme } from '@/utils/theme';

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
  const theme = useAppTheme();
  const styles = useStyles(theme);
  
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
    ? theme.brandError
    : isFocused
    ? theme.brandGreen // Mint green focus — DESIGN.md signature
    : theme.hairline;

  const borderWidth = isFocused ? 2 : 1;

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => inputRef.current?.focus()}
        style={[styles.inputContainer, { borderColor, borderWidth }]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? theme.brandGreen : theme.stone}
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
                color: error ? theme.brandError : isFocused ? theme.brandGreen : theme.stone,
              },
            ]}
          >
            {label}
          </Animated.Text>
          <TextInput
            ref={inputRef}
            value={value}
            style={[styles.input, icon ? {} : { paddingLeft: 0 }]}
            placeholderTextColor={theme.muted}
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
              color={theme.stone}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { marginBottom: spacing.md },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white, // canvas — DESIGN.md text-input
    borderRadius: radius.md,       // 8px — DESIGN.md
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  leftIcon: { marginRight: spacing.sm },
  inputWrapper: { flex: 1, justifyContent: 'center', paddingTop: 8 },
  label: {
    position: 'absolute',
    left: 0,
    fontFamily: 'Inter_500Medium',
  },
  input: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: theme.ink,
    paddingVertical: 8,
    paddingTop: 12,
  },
  rightIcon: { padding: 4 },
  errorText: {
    color: theme.brandError,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
    marginLeft: spacing.md,
  },
});

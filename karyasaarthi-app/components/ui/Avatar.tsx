/**
 * Avatar component — Mintlify design.
 * Initials fallback with consistent color generation.
 * Online status indicator uses brand-green (mint).
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius } from '@/utils/theme';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  showOnline?: boolean;
  style?: ViewStyle;
}

/** Extract initials from full name (max 2 chars) */
function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Generate a consistent color from a name string */
function nameToColor(name?: string): string {
  if (!name) return colors.primary;
  const avatarColors = [
    '#0a0a0a', '#1a3d4a', '#3772cf', '#00b48a',
    '#c37d0d', '#d45656', '#5a5a5c', '#2d5a4f',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function Avatar({ uri, name, size = 40, showOnline, style }: AvatarProps) {
  const initials = getInitials(name);
  const bgColor = nameToColor(name);
  const fontSize = size * 0.38;
  const onlineDotSize = Math.max(size * 0.28, 10);

  return (
    <View style={[{ width: size, height: size }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.initialsContainer,
            { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </View>
      )}
      {showOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: onlineDotSize,
              height: onlineDotSize,
              borderRadius: onlineDotSize / 2,
              borderWidth: size > 36 ? 2 : 1.5,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.skeleton },
  initialsContainer: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.white, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.brandGreen, // Mint green online indicator
    borderColor: colors.white,
  },
});

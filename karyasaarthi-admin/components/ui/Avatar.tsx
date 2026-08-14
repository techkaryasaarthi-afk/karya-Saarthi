/**
 * Avatar component with initials fallback and online status indicator.
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
  const avatarColors = ['#1B3A6B', '#7C3AED', '#0891B2', '#059669', '#DC2626', '#EA580C', '#4F46E5'];
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
  initials: { color: colors.white, fontWeight: '700' },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.success,
    borderColor: colors.white,
  },
});

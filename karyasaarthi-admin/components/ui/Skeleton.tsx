/**
 * Skeleton loading placeholder for content loading states.
 * Provides shimmer animation for a polished loading experience.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius } from '@/utils/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = radius.md,
  style,
}: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <Animated.View
      style={[
        { width: width as number, height, borderRadius, opacity },
        styles.skeleton,
        style,
      ]}
    />
  );
}

/** Pre-built skeleton patterns for common layouts */
export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width="40%" height={14} />
      <Skeleton width="100%" height={12} style={{ marginTop: 8 }} />
      <Skeleton width="70%" height={12} style={{ marginTop: 6 }} />
      <View style={styles.row}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={80} height={14} />
      </View>
    </View>
  );
}

export function ListItemSkeleton() {
  return (
    <View style={styles.listItem}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="90%" height={12} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: { backgroundColor: colors.skeleton },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

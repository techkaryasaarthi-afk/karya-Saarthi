/**
 * Network Status Banner — Shows when the device goes offline.
 * Automatically hides when connectivity is restored.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors, typography, useAppTheme } from '@/utils/theme';

export default function NetworkBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-50));
  const theme = useAppTheme();
  const styles = useStyles(theme);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);
      setIsOffline(offline);
      Animated.timing(slideAnim, {
        toValue: offline ? 0 : -50,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
    return () => unsubscribe();
  }, [slideAnim]);

  if (!isOffline) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <Ionicons name="cloud-offline" size={16} color={theme.white} />
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
}

const useStyles = (theme: ThemeColors) => StyleSheet.create({
  banner: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: theme.canvasDark,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 8, paddingTop: 40, zIndex: 999,
  },
  text: { ...typography.labelMd, color: theme.white },
});

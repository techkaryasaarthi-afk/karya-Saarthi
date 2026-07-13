/**
 * Vendor Tab Layout — Bottom tabs for vendor experience.
 * 5 tabs: Dashboard, Projects, Earnings, Chat, Profile
 * Mintlify: Clean white tab bar, ink active, stone inactive.
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/utils/theme';

export default function VendorLayout() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.ink,
        tabBarInactiveTintColor: theme.stone,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', fontFamily: 'Inter_500Medium', marginTop: -2 },
        tabBarStyle: {
          backgroundColor: theme.white,
          borderTopWidth: 1,
          borderTopColor: theme.hairline,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
          ...Platform.select({ android: { elevation: 0 } }),
        },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'speedometer' : 'speedometer-outline'} size={22} color={color} /> }} />
      <Tabs.Screen name="projects" options={{ title: 'Projects', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'folder' : 'folder-outline'} size={22} color={color} /> }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={22} color={color} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} /> }} />
      <Tabs.Screen name="application-status" options={{ href: null }} />
      <Tabs.Screen name="chat-thread" options={{ href: null }} />
    </Tabs>
  );
}

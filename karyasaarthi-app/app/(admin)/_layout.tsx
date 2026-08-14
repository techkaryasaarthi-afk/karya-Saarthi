/**
 * Admin Tab Layout — Bottom tab navigation for the admin panel.
 * Styled per DESIGN.md: brandGreen accent, flat surfaces, Inter typography.
 * Tabs: Dashboard, Chat, Projects, Services, More
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/utils/theme';

const TAB_ICON_SIZE = 22;

export default function AdminLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.brandGreen,
        tabBarInactiveTintColor: theme.steel,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.hairline,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="grid" size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => <Ionicons name="briefcase" size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color }) => <Ionicons name="construct" size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <Ionicons name="ellipsis-horizontal" size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      {/* Hidden tabs (accessible via More or navigation) */}
      <Tabs.Screen name="users" options={{ href: null }} />
      <Tabs.Screen name="meetings" options={{ href: null }} />
      <Tabs.Screen name="leaves" options={{ href: null }} />
      <Tabs.Screen name="attendance" options={{ href: null }} />
      <Tabs.Screen name="announcements" options={{ href: null }} />
      <Tabs.Screen name="blogs" options={{ href: null }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="invoices" options={{ href: null }} />
      <Tabs.Screen name="vendors" options={{ href: null }} />
      <Tabs.Screen name="vendor-pipeline" options={{ href: null }} />
      <Tabs.Screen name="vendor-application-detail" options={{ href: null }} />
      <Tabs.Screen name="project-detail" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      
      {/* Advanced Panels */}
      <Tabs.Screen name="operations" options={{ href: null }} />
      <Tabs.Screen name="digital" options={{ href: null }} />
      <Tabs.Screen name="finance" options={{ href: null }} />
    </Tabs>
  );
}

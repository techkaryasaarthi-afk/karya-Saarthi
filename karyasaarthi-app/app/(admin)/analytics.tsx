/**
 * Admin Analytics — Revenue, user growth, project stats. Styled per DESIGN.md.
 */
import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getAnalyticsApi } from '@/services/admin';
import { useAppTheme } from '@/utils/theme';

export default function AdminAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const T = useAppTheme();
  const { data, refetch, isRefetching } = useQuery({ queryKey: ['admin-analytics'], queryFn: getAnalyticsApi });
  const a = data || {};

  const metrics = [
    { label: 'Total Revenue', value: a.totalRevenue ? `₹${(a.totalRevenue / 1000).toFixed(1)}K` : '₹0', icon: 'wallet', color: T.success },
    { label: 'New Users (30d)', value: a.newUsers || 0, icon: 'person-add', color: T.info },
    { label: 'Projects (30d)', value: a.newProjects || 0, icon: 'briefcase', color: T.warning },
    { label: 'Avg Rating', value: a.avgRating ? a.avgRating.toFixed(1) : '—', icon: 'star', color: T.brandGreen },
    { label: 'Active Vendors', value: a.activeVendors || 0, icon: 'people', color: '#8B5CF6' },
    { label: 'Pending Invoices', value: a.pendingInvoices || 0, icon: 'receipt', color: T.error },
  ];

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: T.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 }}><TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 9999, backgroundColor: T.surfaceContainer, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={22} color={T.ink} /></TouchableOpacity><Text style={{ flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20, color: T.ink }}>Analytics</Text></View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 }}>
          {metrics.map((m, i) => (
            <View key={i} style={{ width: '47%', flexGrow: 1, borderRadius: 12, padding: 16, borderWidth: 1, backgroundColor: T.surfaceContainer, borderColor: T.hairline, minHeight: 100 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: m.color + '18', alignItems: 'center', justifyContent: 'center' }}><Ionicons name={m.icon as any} size={20} color={m.color} /></View>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, color: T.ink, marginTop: 12 }}>{m.value}</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: T.steel, marginTop: 2 }}>{m.label}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

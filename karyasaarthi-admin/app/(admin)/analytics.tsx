/**
 * Admin Analytics Dashboard — Platform-wide stats and metrics.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';

export default function AdminAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { data: analytics, refetch, isRefetching } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => { try { const { data } = await api.get(ADMIN_ENDPOINTS.ANALYTICS); return data; } catch { return null; } },
  });

  const stats = [
    { label: 'Total Users', value: analytics?.totalUsers || 0, icon: 'people', color: '#6366F1', gradient: ['#6366F1', '#818CF8'] as [string, string] },
    { label: 'Active Projects', value: analytics?.activeProjects || 0, icon: 'briefcase', color: '#F59E0B', gradient: ['#F59E0B', '#FBBF24'] as [string, string] },
    { label: 'Revenue', value: `₹${(analytics?.totalRevenue || 0).toLocaleString()}`, icon: 'wallet', color: '#10B981', gradient: ['#10B981', '#34D399'] as [string, string] },
    { label: 'Vendors', value: analytics?.totalVendors || 0, icon: 'people-circle', color: '#3B82F6', gradient: ['#3B82F6', '#60A5FA'] as [string, string] },
  ];

  const trends = [
    { label: 'This Month Revenue', value: `₹${(analytics?.monthlyRevenue || 0).toLocaleString()}`, delta: '+12%', up: true },
    { label: 'New Customers', value: analytics?.newCustomers || 0, delta: '+8%', up: true },
    { label: 'Completed Projects', value: analytics?.completedProjects || 0, delta: '+15%', up: true },
    { label: 'Avg. Rating', value: analytics?.avgRating || '4.5', delta: '+0.2', up: true },
  ];

  return (
    <View style={[s.c, { paddingTop: insets.top }]}>
      <View style={s.hdr}><Text style={s.title}>Analytics</Text></View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F59E0B" />}>
        {/* Stat Cards */}
        <View style={s.grid}>{stats.map((st, i) => (
          <LinearGradient key={i} colors={st.gradient} style={s.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name={st.icon as any} size={28} color="rgba(255,255,255,0.8)" />
            <Text style={s.statVal}>{st.value}</Text>
            <Text style={s.statLbl}>{st.label}</Text>
          </LinearGradient>
        ))}</View>

        {/* Trends */}
        <Text style={s.section}>Trends</Text>
        {trends.map((tr, i) => (
          <View key={i} style={s.trendCard}>
            <View style={{ flex: 1 }}><Text style={s.trendLabel}>{tr.label}</Text><Text style={s.trendValue}>{tr.value}</Text></View>
            <View style={[s.deltaBox, { backgroundColor: tr.up ? '#10B98120' : '#EF444420' }]}>
              <Ionicons name={tr.up ? 'trending-up' : 'trending-down'} size={14} color={tr.up ? '#10B981' : '#EF4444'} />
              <Text style={[s.deltaText, { color: tr.up ? '#10B981' : '#EF4444' }]}>{tr.delta}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0F172A' }, hdr: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#FFF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10 },
  statCard: { width: '47%', borderRadius: 16, padding: 18, gap: 6 },
  statVal: { fontFamily: 'Inter_800ExtraBold', fontSize: 24, color: '#FFF' },
  statLbl: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  section: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FFF', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  trendCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  trendLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  trendValue: { fontFamily: 'Inter_700Bold', fontSize: 18, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  deltaBox: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  deltaText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});

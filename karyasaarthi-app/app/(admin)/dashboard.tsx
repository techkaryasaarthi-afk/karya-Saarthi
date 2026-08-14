/**
 * Admin Dashboard — Dynamic metrics, project breakdown, recent activity.
 * Revenue/earnings visible only to super_admin & board_member roles.
 * Styled per DESIGN.md: flat cards, brandGreen accent, Inter typography.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { useAuthStore } from '@/stores/authStore';
import { useAppTheme, spacing } from '@/utils/theme';

const CAN_SEE_FINANCE = ['super_admin', 'board_member'];

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const role = user?.role?.toLowerCase() || '';
  const showFinance = CAN_SEE_FINANCE.includes(role);
  const theme = useAppTheme();

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get(ADMIN_ENDPOINTS.DASHBOARD);
      return data;
    },
  });

  const s = data?.stats || {};

  const stats = [
    { title: 'Total Users', value: s.totalUsers || 0, icon: 'people', color: theme.info },
    { title: 'Active Projects', value: s.totalProjects || 0, icon: 'briefcase', color: theme.warning },
    ...(showFinance
      ? [{ title: 'Revenue (₹)', value: s.totalRevenue ? `₹${(s.totalRevenue / 1000).toFixed(1)}K` : '₹0', icon: 'wallet', color: theme.success }]
      : []),
    { title: 'Pending', value: s.pendingRequests || 0, icon: 'time', color: theme.error },
    { title: 'Vendors', value: s.totalVendors || 0, icon: 'person-circle', color: theme.brandTag },
    { title: 'Blogs', value: s.totalBlogs || 0, icon: 'newspaper', color: '#EC4899' },
  ];

  const ps = data?.projectStats || { pending: 0, in_progress: 0, completed: 0, cancelled: 0 };
  const totalP = (ps.pending || 0) + (ps.in_progress || 0) + (ps.completed || 0) + (ps.cancelled || 0);
  const breakdown = [
    { label: 'Pending', count: ps.pending || 0, color: theme.warning },
    { label: 'In Progress', count: ps.in_progress || 0, color: theme.info },
    { label: 'Completed', count: ps.completed || 0, color: theme.success },
    { label: 'Cancelled', count: ps.cancelled || 0, color: theme.error },
  ];

  const activity = (data?.recentActivity || []).slice(0, 8);

  const quickActions = [
    { icon: 'briefcase', label: 'Projects', onPress: () => router.push('/(admin)/projects' as any) },
    { icon: 'people', label: 'Users', onPress: () => router.push('/(admin)/users' as any) },
    { icon: 'git-merge', label: 'Pipeline', onPress: () => router.push('/(admin)/vendor-pipeline' as any) },
    { icon: 'chatbubbles', label: 'Chat', onPress: () => router.push('/(admin)/chat' as any) },
    { icon: 'megaphone', label: 'Announce', onPress: () => router.push('/(admin)/announcements' as any) },
  ];

  return (
    <View style={[st.c, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.brandGreen} />}>
        {/* Header */}
        <View style={st.hdr}>
          <View>
            <Text style={[st.greeting, { color: theme.steel }]}>Welcome back,</Text>
            <Text style={[st.name, { color: theme.ink }]}>{user?.fullname || 'Admin'}</Text>
          </View>
          <Image source={require('@/assets/icon.png')} style={st.logo} contentFit="contain" />
        </View>

        {/* Stats Grid */}
        <View style={st.grid}>
          {stats.map((item, i) => (
            <View key={i} style={[st.stat, { backgroundColor: theme.surfaceContainer, borderColor: theme.hairline }]}>
              <View style={[st.statIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={[st.statVal, { color: theme.ink }]}>{item.value}</Text>
              <Text style={[st.statLabel, { color: theme.steel }]}>{item.title}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={[st.secTitle, { color: theme.ink }]}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.qaRow}>
          {quickActions.map((a, i) => (
            <TouchableOpacity key={i} style={[st.qaChip, { backgroundColor: theme.brandGreen + '12', borderColor: theme.brandGreen + '30' }]} onPress={a.onPress} activeOpacity={0.7}>
              <Ionicons name={a.icon as any} size={18} color={theme.brandGreen} />
              <Text style={[st.qaText, { color: theme.brandGreen }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Project Breakdown */}
        {totalP > 0 && (
          <>
            <Text style={[st.secTitle, { color: theme.ink }]}>Project Breakdown</Text>
            <View style={[st.breakdownCard, { backgroundColor: theme.surfaceContainer, borderColor: theme.hairline }]}>
              <View style={[st.progressBar, { backgroundColor: theme.hairlineSoft }]}>
                {breakdown.filter(b => b.count > 0).map((b, i) => (
                  <View key={i} style={[st.progressSeg, { width: `${(b.count / totalP) * 100}%`, backgroundColor: b.color }]} />
                ))}
              </View>
              <View style={st.breakdownGrid}>
                {breakdown.map((b, i) => (
                  <View key={i} style={st.breakdownItem}>
                    <View style={[st.breakdownDot, { backgroundColor: b.color }]} />
                    <Text style={[st.breakdownLabel, { color: theme.steel }]}>{b.label}</Text>
                    <Text style={[st.breakdownCount, { color: theme.ink }]}>{b.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Recent Activity */}
        <Text style={[st.secTitle, { color: theme.ink }]}>Recent Activity</Text>
        <View style={st.actList}>
          {activity.length === 0 ? (
            <View style={st.emptyAct}>
              <Ionicons name="pulse-outline" size={40} color={theme.hairline} />
              <Text style={[st.emptyText, { color: theme.muted }]}>No recent activity</Text>
            </View>
          ) : (
            activity.map((item: any, i: number) => (
              <View key={item.id || i} style={[st.actItem, { borderBottomColor: theme.hairlineSoft }]}>
                <View style={[st.actIcon, { backgroundColor: theme.brandGreen + '12' }]}>
                  <Ionicons name="flash" size={16} color={theme.brandGreen} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[st.actText, { color: theme.charcoal }]} numberOfLines={2}>{item.action || item.text || item.details || 'Activity'}</Text>
                  <Text style={[st.actTime, { color: theme.muted }]}>{item.created_at ? timeAgo(item.created_at) : item.time || ''}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const st = StyleSheet.create({
  c: { flex: 1 },
  hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  greeting: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 22, marginTop: 2 },
  logo: { width: 42, height: 42, borderRadius: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  stat: { width: '47%', flexGrow: 1, borderRadius: 12, padding: 16, minHeight: 110, borderWidth: 1 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontFamily: 'Inter_700Bold', fontSize: 24, marginTop: 12 },
  statLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, marginTop: 2 },
  secTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  qaRow: { paddingHorizontal: 20, gap: 10 },
  qaChip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 12 },
  qaText: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  breakdownCard: { marginHorizontal: 20, borderRadius: 12, padding: 16, borderWidth: 1 },
  progressBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' },
  progressSeg: { height: '100%' },
  breakdownGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 4 },
  breakdownItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '48%', paddingVertical: 4 },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, flex: 1 },
  breakdownCount: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  actList: { paddingHorizontal: 20 },
  actItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  actIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actText: { fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 18 },
  actTime: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  emptyAct: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText: { fontFamily: 'Inter_500Medium', fontSize: 14 },
});

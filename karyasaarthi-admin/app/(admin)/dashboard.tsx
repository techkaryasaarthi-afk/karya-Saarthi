/**
 * Admin Dashboard — Dynamic metrics, project breakdown, recent activity.
 * Revenue/earnings visible only to super_admin & board_member roles.
 * Department-specific views for pillar_member role.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { useAuthStore } from '@/stores/authStore';
import { spacing } from '@/utils/theme';

const CAN_SEE_FINANCE = ['super_admin', 'board_member'];

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const role = user?.role?.toLowerCase() || '';
  const showFinance = CAN_SEE_FINANCE.includes(role);

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get(ADMIN_ENDPOINTS.DASHBOARD);
      return data;
    },
  });

  const s = data?.stats || {};

  // ── Build stat cards based on role ────────────────────────────
  const stats = [
    { title: 'Total Users', value: s.totalUsers || 0, icon: 'people', gradient: ['#6366F1', '#8B5CF6'] as const },
    { title: 'Active Projects', value: s.totalProjects || 0, icon: 'briefcase', gradient: ['#F59E0B', '#F97316'] as const },
    ...(showFinance
      ? [{ title: 'Revenue (₹)', value: s.totalRevenue ? `₹${(s.totalRevenue / 1000).toFixed(1)}K` : '₹0', icon: 'wallet', gradient: ['#10B981', '#34D399'] as const }]
      : []),
    { title: 'Pending', value: s.pendingRequests || 0, icon: 'time', gradient: ['#EF4444', '#F87171'] as const },
    { title: 'Vendors', value: s.totalVendors || 0, icon: 'person-circle', gradient: ['#3B82F6', '#60A5FA'] as const },
    { title: 'Blogs', value: s.totalBlogs || 0, icon: 'newspaper', gradient: ['#EC4899', '#F472B6'] as const },
  ];

  // ── Project breakdown ─────────────────────────────────────────
  const ps = data?.projectStats || { pending: 0, in_progress: 0, completed: 0, cancelled: 0 };
  const totalP = (ps.pending || 0) + (ps.in_progress || 0) + (ps.completed || 0) + (ps.cancelled || 0);
  const breakdown = [
    { label: 'Pending', count: ps.pending || 0, color: '#F59E0B' },
    { label: 'In Progress', count: ps.in_progress || 0, color: '#3B82F6' },
    { label: 'Completed', count: ps.completed || 0, color: '#10B981' },
    { label: 'Cancelled', count: ps.cancelled || 0, color: '#EF4444' },
  ];

  // ── Recent activity ────────────────────────────────────────────
  const activity = (data?.recentActivity || []).slice(0, 8);

  const quickActions = [
    { icon: 'briefcase', label: 'Projects', onPress: () => router.push('/(admin)/projects' as any) },
    { icon: 'people', label: 'Users', onPress: () => router.push('/(admin)/users' as any) },
    { icon: 'git-merge', label: 'Pipeline', onPress: () => router.push('/(admin)/vendor-pipeline' as any) },
    { icon: 'chatbubbles', label: 'Chat', onPress: () => router.push('/(admin)/chat' as any) },
    { icon: 'megaphone', label: 'Announce', onPress: () => router.push('/(admin)/announcements' as any) },
  ];

  return (
    <View style={[st.c, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F59E0B" />}>
        {/* Header */}
        <View style={st.hdr}>
          <View>
            <Text style={st.greeting}>Welcome back,</Text>
            <Text style={st.name}>{typeof user?.fullname === 'object' ? (user.fullname as any).fullname : user?.fullname || 'Admin'}</Text>
          </View>
          <Image source={require('@/assets/icon.png')} style={st.logo} contentFit="contain" />
        </View>

        {/* Stats Grid */}
        <View style={st.grid}>
          {stats.map((item, i) => (
            <LinearGradient key={i} colors={item.gradient as unknown as [string, string]} style={st.stat} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={st.statIcon}><Ionicons name={item.icon as any} size={20} color="rgba(255,255,255,0.9)" /></View>
              <Text style={st.statVal}>{item.value}</Text>
              <Text style={st.statLabel}>{item.title}</Text>
            </LinearGradient>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={st.secTitle}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.qaRow}>
          {quickActions.map((a, i) => (
            <TouchableOpacity key={i} style={st.qaChip} onPress={a.onPress} activeOpacity={0.7}>
              <Ionicons name={a.icon as any} size={18} color="#F59E0B" />
              <Text style={st.qaText}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Project Breakdown */}
        {totalP > 0 && (
          <>
            <Text style={st.secTitle}>Project Breakdown</Text>
            <View style={st.breakdownCard}>
              {/* Progress bar */}
              <View style={st.progressBar}>
                {breakdown.filter(b => b.count > 0).map((b, i) => (
                  <View key={i} style={[st.progressSeg, { width: `${(b.count / totalP) * 100}%`, backgroundColor: b.color }]} />
                ))}
              </View>
              <View style={st.breakdownGrid}>
                {breakdown.map((b, i) => (
                  <View key={i} style={st.breakdownItem}>
                    <View style={[st.breakdownDot, { backgroundColor: b.color }]} />
                    <Text style={st.breakdownLabel}>{b.label}</Text>
                    <Text style={st.breakdownCount}>{b.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Recent Activity */}
        <Text style={st.secTitle}>Recent Activity</Text>
        <View style={st.actList}>
          {activity.length === 0 ? (
            <View style={st.emptyAct}>
              <Ionicons name="pulse-outline" size={40} color="rgba(255,255,255,0.15)" />
              <Text style={st.emptyText}>No recent activity</Text>
            </View>
          ) : (
            activity.map((item: any, i: number) => (
              <View key={item.id || i} style={st.actItem}>
                <View style={[st.actIcon, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                  <Ionicons name="flash" size={16} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.actText} numberOfLines={2}>{item.action || item.text || item.details || 'Activity'}</Text>
                  <Text style={st.actTime}>{item.created_at ? timeAgo(item.created_at) : item.time || ''}</Text>
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

/** Simple relative time formatter */
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
  c: { flex: 1, backgroundColor: '#0F172A' },
  hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  greeting: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.45)' },
  name: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#FFF', marginTop: 2 },
  logo: { width: 42, height: 42, borderRadius: 12 },

  // Stats
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  stat: { width: '47%', flexGrow: 1, borderRadius: 16, padding: 16, minHeight: 110 },
  statIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  statVal: { fontFamily: 'Inter_800ExtraBold', fontSize: 24, color: '#FFF', marginTop: 12 },
  statLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // Section
  secTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, color: '#FFF', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },

  // Quick actions
  qaRow: { paddingHorizontal: 20, gap: 10 },
  qaChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  qaText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#F59E0B' },

  // Breakdown
  breakdownCard: { marginHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  progressBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.06)' },
  progressSeg: { height: '100%' },
  breakdownGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 4 },
  breakdownItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '48%', paddingVertical: 4 },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.5)', flex: 1 },
  breakdownCount: { fontFamily: 'Inter_700Bold', fontSize: 14, color: 'rgba(255,255,255,0.8)' },

  // Activity
  actList: { paddingHorizontal: 20 },
  actItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  actIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 18 },
  actTime: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
  emptyAct: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: 'rgba(255,255,255,0.3)' },
});

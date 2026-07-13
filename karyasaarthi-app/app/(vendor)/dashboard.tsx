/**
 * Vendor Dashboard — Professional dashboard with earnings, metrics, projects.
 * Mintlify: White backgrounds, flat cards, hairline borders, ink text, green accents.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';

const { width: SW } = Dimensions.get('window');

export default function VendorDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const theme = useAppTheme();
  const s = useStyles(theme);

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: async () => {
      const [earningsRes, projectsRes] = await Promise.all([
        api.get('/api/vendor/earnings').catch(() => ({ data: {} })),
        api.get('/api/projects').catch(() => ({ data: {} })),
      ]);
      return {
        earnings: earningsRes.data?.earnings || {},
        activeProjects: (projectsRes.data?.projects || []).filter((p: any) => p.status !== 'completed'),
        completedProjects: (projectsRes.data?.projects || []).filter((p: any) => p.status === 'completed'),
        recentPayments: earningsRes.data?.payments || [],
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const stats = data || { earnings: {}, activeProjects: [], completedProjects: [], recentPayments: [] };

  const QUICK_ACTIONS = [
    { icon: 'layers', label: 'Projects', route: '/(vendor)/projects', color: 'rgba(0,212,164,0.12)', iconColor: theme.brandGreen },
    { icon: 'chatbubbles', label: 'Messages', route: '/(vendor)/chat', color: 'rgba(59,130,246,0.12)', iconColor: '#3B82F6' },
    { icon: 'cash', label: 'Earnings', route: '/(vendor)/earnings', color: 'rgba(245,158,11,0.12)', iconColor: '#F59E0B' },
    { icon: 'person', label: 'Profile', route: '/(vendor)/profile', color: 'rgba(139,92,246,0.12)', iconColor: '#8B5CF6' },
  ];

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.brandGreen} />}>
        {/* ── Gradient Hero Header ────────── */}
        <LinearGradient
          colors={[theme.heroDarkFrom, theme.heroDarkTo, '#1a4a3a']}
          style={[s.header, { paddingTop: insets.top + 16 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={s.headerRow}>
            <View style={s.brandRow}>
              <View style={s.logoWrap}>
                <Ionicons name="briefcase" size={20} color={'#ffffff'} />
              </View>
              <View>
                <Text style={s.brandName}>KaryaSaarthi</Text>
                <Text style={s.brandSub}>Vendor Panel</Text>
              </View>
            </View>
            <Avatar name={user?.fullname} size={42} />
          </View>

          <Text style={s.greeting}>Welcome back, {user?.fullname?.split(' ')[0] || 'Vendor'} 🚀</Text>

          {/* Earnings Card inside header */}
          <View style={s.earningsCard}>
            <View style={s.earningsTop}>
              <View>
                <Text style={s.earningsLabel}>Total Earnings</Text>
                <Text style={s.earningsAmount}>₹{stats.earnings?.totalEarned?.toLocaleString() || '0'}</Text>
              </View>
              <View style={s.earningsIconBg}>
                <Ionicons name="trending-up" size={22} color={theme.brandGreen} />
              </View>
            </View>
            <View style={s.earningsRow}>
              <View style={s.earningsStat}>
                <Text style={s.earningsStatValue}>{stats.earnings?.completedProjects || 0}</Text>
                <Text style={s.earningsStatLabel}>Completed</Text>
              </View>
              <View style={s.earningsDivider} />
              <View style={s.earningsStat}>
                <Text style={s.earningsStatValue}>₹{stats.earnings?.pendingAmount?.toLocaleString() || '0'}</Text>
                <Text style={s.earningsStatLabel}>Pending</Text>
              </View>
              <View style={s.earningsDivider} />
              <View style={s.earningsStat}>
                <Text style={s.earningsStatValue}>4.7★</Text>
                <Text style={s.earningsStatLabel}>Rating</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── Quick Actions ────────── */}
        <View style={s.quickRow}>
          {QUICK_ACTIONS.map((act, i) => (
            <TouchableOpacity key={i} style={s.quickItem} activeOpacity={0.8} onPress={() => router.push(act.route as any)}>
              <View style={[s.quickCircle, { backgroundColor: act.color }]}>
                <Ionicons name={act.icon as any} size={22} color={act.iconColor} />
              </View>
              <Text style={s.quickLabel}>{act.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Metrics ────────────────────────── */}
        <View style={s.metricsRow}>
          {[
            { icon: 'flash', value: stats.activeProjects.length, label: 'Active', color: theme.warning },
            { icon: 'checkmark-circle', value: stats.completedProjects.length, label: 'Done', color: theme.brandGreen },
            { icon: 'time', value: stats.recentPayments.length, label: 'Payments', color: theme.primary },
          ].map((m, i) => (
            <View key={i} style={s.metricCard}>
              <Ionicons name={m.icon as any} size={20} color={m.color} />
              <Text style={s.metricValue}>{m.value}</Text>
              <Text style={s.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Active Projects ────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Active Projects</Text>
            <TouchableOpacity onPress={() => router.push('/(vendor)/projects' as any)}>
              <Text style={s.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {stats.activeProjects.length === 0 ? (
            <View style={s.emptyCard}>
              <Ionicons name="folder-open-outline" size={40} color={theme.stone} />
              <Text style={s.emptyText}>No active projects</Text>
            </View>
          ) : (
            stats.activeProjects.slice(0, 5).map((proj: any, i: number) => {
              const formatStatus = (raw?: string) => {
                if (!raw) return 'Active';
                const map: Record<string, string> = {
                  in_progress: 'In Progress', assigned: 'Assigned', review: 'Under Review', delivered: 'Delivered', completed: 'Completed', cancelled: 'Cancelled',
                };
                return map[raw.toLowerCase()] || raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              };
              return (
                <TouchableOpacity key={i} style={s.projectCard} activeOpacity={0.85} onPress={() => router.push(`/(vendor)/projects/${proj.id}` as any)}>
                  <View style={s.projContent}>
                    <Text style={s.projName} numberOfLines={1}>{proj.name || proj.title || proj.service_type || 'Project'}</Text>
                    <Text style={s.projClient}>Client: {proj.customer_name || proj.client?.fullname || 'N/A'}</Text>
                  </View>
                  <View style={[s.projBadge, { backgroundColor: 'rgba(0,212,164,0.1)' }]}>
                    <Text style={[s.projBadgeText, { color: theme.primary }]}>{formatStatus(proj.status)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ── Recent Payments ────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Recent Payments</Text>
            <TouchableOpacity onPress={() => router.push('/(vendor)/earnings' as any)}>
              <Text style={s.viewAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {stats.recentPayments.length === 0 ? (
            <View style={s.emptyCard}>
              <Ionicons name="wallet-outline" size={40} color={theme.stone} />
              <Text style={s.emptyText}>No payments yet</Text>
            </View>
          ) : (
            stats.recentPayments.slice(0, 5).map((pay: any, i: number) => (
              <View key={i} style={s.payItem}>
                <View style={s.payIcon}>
                  <Ionicons name="checkmark-circle" size={18} color={theme.brandGreen} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.payName}>{pay.description || 'Project Payment'}</Text>
                  <Text style={s.payDate}>{pay.created_at?.slice(0, 10) || 'N/A'}</Text>
                </View>
                <Text style={s.payAmount}>₹{pay.amount?.toLocaleString() || '0'}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const HP = spacing.containerMargin;
const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },

  // Gradient Header
  header: {
    paddingHorizontal: HP,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoWrap: {
    width: 42, height: 42, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  brandName: { ...typography.headlineSm, color: '#ffffff' },
  brandSub: { ...typography.labelSm, color: 'rgba(255,255,255,0.7)' },
  greeting: { ...typography.headlineMd, color: '#ffffff', marginTop: 18, marginBottom: 16 },

  // Earnings
  earningsCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.xl, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  earningsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  earningsLabel: { ...typography.labelMd, color: 'rgba(255,255,255,0.75)' },
  earningsAmount: { ...typography.displayLg, color: '#ffffff', marginTop: 4 },
  earningsIconBg: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: 'rgba(0,212,164,0.2)', alignItems: 'center', justifyContent: 'center' },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 16 },
  earningsStat: { alignItems: 'center', flex: 1 },
  earningsStatValue: { ...typography.headlineSm, color: '#ffffff' },
  earningsStatLabel: { ...typography.bodySm, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  earningsDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.15)' },

  // Quick actions
  quickRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: HP, paddingVertical: 22, backgroundColor: theme.white, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  quickItem: { alignItems: 'center', gap: 8, width: 70 },
  quickCircle: { width: 52, height: 52, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { ...typography.labelSm, color: theme.ink, textAlign: 'center' },

  // Metrics
  metricsRow: { flexDirection: 'row', paddingHorizontal: HP, gap: 10, marginBottom: 10 },
  metricCard: { flex: 1, backgroundColor: theme.white, borderRadius: radius.lg, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: theme.hairline },
  metricValue: { ...typography.headlineMd, color: theme.ink },
  metricLabel: { ...typography.labelSm, color: theme.stone },

  // Section
  section: { paddingHorizontal: HP, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { ...typography.headlineMd, color: theme.ink },
  viewAll: { ...typography.labelMd, color: theme.primary },

  // Projects
  projectCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.white, borderRadius: radius.md, marginBottom: 10, padding: 14, borderWidth: 1, borderColor: theme.hairline },
  projContent: { flex: 1 },
  projName: { ...typography.labelLg, color: theme.ink },
  projClient: { ...typography.bodySm, color: theme.stone, marginTop: 3 },
  projBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.sm, marginLeft: 14 },
  projBadgeText: { ...typography.labelSm },

  // Payments
  payItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.hairline, gap: 12 },
  payIcon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: 'rgba(0,212,164,0.1)', alignItems: 'center', justifyContent: 'center' },
  payName: { ...typography.labelLg, color: theme.ink },
  payDate: { ...typography.bodySm, color: theme.stone, marginTop: 2 },
  payAmount: { ...typography.headlineSm, color: theme.brandGreen },

  // Empty
  emptyCard: { alignItems: 'center', paddingVertical: 30, backgroundColor: theme.white, borderRadius: radius.md, borderWidth: 1, borderColor: theme.hairline },
  emptyText: { ...typography.bodySm, color: theme.stone, marginTop: 10 },
});

/**
 * Projects Screen — Customer's project dashboard with status filters.
 * Connected to /api/projects for live data.
 * Mintlify: Flat UI, hairline borders, ink text, mint-green active states, animated list.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import NotificationsModal from '@/components/ui/NotificationsModal';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';
import { getNotificationsApi } from '@/services/notifications';

const statusFilters = ['All', 'Active', 'Pending', 'Completed'] as const;
type FilterType = (typeof statusFilters)[number];

const filterIcons: Record<FilterType, string> = {
  All: 'apps',
  Active: 'flash',
  Pending: 'time',
  Completed: 'checkmark-circle',
};

export default function ProjectsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const theme = useAppTheme();
  const st = useStyles(theme);
  const [filter, setFilter] = useState<FilterType>('All');
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationsApi,
    refetchInterval: 15000,
  });
  const unreadCount = notifData?.unread || 0;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data } = await api.get('/api/projects');
      return data;
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  const projects = data?.projects || data?.data || [];

  /** Prettify raw DB status into human-readable label */
  const formatStatus = (raw?: string) => {
    if (!raw) return 'Pending';
    const map: Record<string, string> = {
      in_progress: 'In Progress',
      assigned: 'Assigned',
      pending: 'Pending',
      review: 'Under Review',
      delivered: 'Delivered',
      completed: 'Completed',
      cancelled: 'Cancelled',
      rejected: 'Rejected',
    };
    return map[raw.toLowerCase()] || raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const getFilteredProjects = (f: FilterType) => {
    if (f === 'All') return projects;
    return projects.filter((p: any) => {
      const status = p.status?.toLowerCase() || '';
      if (f === 'Active') return status.includes('in_progress') || status.includes('active') || status.includes('assigned') || status.includes('review');
      if (f === 'Pending') return status.includes('pending');
      if (f === 'Completed') return status.includes('complete') || status.includes('deliver');
      return false;
    });
  };

  const filtered = getFilteredProjects(filter);
  const getCount = (f: FilterType) => getFilteredProjects(f).length;

  const statusVariant = (s: string) => {
    const status = s?.toLowerCase();
    if (status?.includes('assigned')) return 'info' as const;
    if (status?.includes('active') || status?.includes('progress')) return 'warning' as const;
    if (status?.includes('review')) return 'warning' as const;
    if (status?.includes('complete') || status?.includes('deliver')) return 'success' as const;
    if (status?.includes('cancel') || status?.includes('reject')) return 'error' as const;
    return 'info' as const;
  };

  return (
    <View style={[st.container, { paddingTop: 0 }]}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[theme.heroDarkFrom, theme.heroDarkTo, '#1a4a3a']}
        style={[st.header, { paddingTop: insets.top + 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={st.title}>My Projects</Text>
        <View style={st.headerActions}>
          <TouchableOpacity onPress={() => setNotificationsVisible(true)} style={st.bellBtn}>
            <Ionicons name="notifications-outline" size={24} color={'rgba(255,255,255,0.9)'} />
            {unreadCount > 0 && (
              <View style={st.notifBadge}>
                <Text style={st.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Button title="New Request" onPress={() => router.push('/(customer)/services' as any)} variant="accent" size="sm" />
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.filterRow} style={st.filterScroll}>
        {statusFilters.map((item) => {
          const isActive = filter === item;
          const count = getCount(item);
          return (
            <TouchableOpacity key={item} style={[st.pill, isActive && st.pillActive]} onPress={() => setFilter(item)} activeOpacity={0.7}>
              <Ionicons name={filterIcons[item] as any} size={16} color={isActive ? theme.primary : theme.stone} />
              <Text style={[st.pillText, isActive && st.pillTextActive]}>{item}</Text>
              {count > 0 && (
                <View style={[st.pillCount, isActive && st.pillCountActive]}>
                  <Text style={[st.pillCountText, isActive && st.pillCountTextActive]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Project List */}
      {isLoading ? (
        <View style={{ paddingHorizontal: spacing.containerMargin }}>
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <Animated.FlatList
          data={filtered}
          keyExtractor={(item, i) => `${item?.id || i}`}
          contentContainerStyle={st.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.brandGreen} />}
          itemLayoutAnimation={FadeInDown.duration(400)}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
              <Card variant="flat" style={st.card} onPress={() => router.push(`/(customer)/projects/${item.id}` as any)}>
                <View style={st.cardHeader}>
                  <Text style={st.projectName} numberOfLines={1}>
                    {item.service_type || item.name || item.title || 'Untitled'}
                  </Text>
                  <Badge text={formatStatus(item.status)} variant={statusVariant(item.status)} size="sm" />
                </View>
                {item.description && (
                  <Text style={st.desc} numberOfLines={2}>{item.description}</Text>
                )}
                <View style={st.meta}>
                  <Ionicons name="calendar-outline" size={14} color={theme.stone} />
                  <Text style={st.metaText}>
                    {item.deadline || item.created_at?.slice(0, 10) || 'N/A'}
                  </Text>
                </View>
              </Card>
            </Animated.View>
          )}
          ListEmptyComponent={
            <View style={st.empty}>
              <Ionicons name="folder-open-outline" size={56} color={theme.stone} />
              <Text style={st.emptyTitle}>No Projects Yet</Text>
              <Button title="Browse Services" onPress={() => router.push('/(customer)/services' as any)} variant="primary" size="md" style={{ marginTop: 16 }} />
            </View>
          }
        />
      )}

      {notificationsVisible && (
        <React.Suspense fallback={<View />}>
          <NotificationsModal visible={notificationsVisible} onClose={() => setNotificationsVisible(false)} />
        </React.Suspense>
      )}
    </View>
  );
}

const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.containerMargin, paddingBottom: 18,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bellBtn: { position: 'relative', padding: spacing.xs },
  notifBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: theme.white },
  notifBadgeText: { ...typography.labelMd, fontSize: 10, color: theme.white, fontWeight: 'bold' },
  title: { ...typography.headlineMd, color: '#ffffff' },

  filterScroll: { flexGrow: 0, backgroundColor: theme.white, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  filterRow: { paddingHorizontal: spacing.containerMargin, gap: 8, alignItems: 'center', paddingTop: spacing.sm },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.full, borderWidth: 1.5, borderColor: theme.hairline, backgroundColor: theme.white },
  pillActive: { backgroundColor: 'rgba(0,212,164,0.08)', borderColor: theme.brandGreen },
  pillText: { ...typography.labelMd, color: theme.stone },
  pillTextActive: { color: theme.ink, fontWeight: '700' },
  pillCount: { backgroundColor: theme.surfaceContainerLow, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  pillCountActive: { backgroundColor: theme.brandGreen },
  pillCountText: { fontSize: 11, fontWeight: '700', color: theme.stone },
  pillCountTextActive: { color: theme.primary },

  listContent: { paddingHorizontal: spacing.containerMargin, paddingTop: spacing.md, paddingBottom: 100, gap: 12 },
  card: { padding: spacing.md, backgroundColor: theme.white, borderWidth: 1, borderColor: theme.hairline, borderRadius: radius.xl },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 },
  projectName: { ...typography.labelLg, color: theme.ink, flex: 1, flexShrink: 1, fontWeight: '700' },
  desc: { ...typography.bodySm, color: theme.steel, marginBottom: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...typography.labelMd, color: theme.stone },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { ...typography.headlineMd, color: theme.ink, marginTop: spacing.md },
});

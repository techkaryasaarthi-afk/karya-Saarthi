/**
 * Vendor Projects Screen
 * Mintlify: Flat UI, hairline borders, ink primary, brand green action buttons.
 */
import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getProjectsApi, updateProjectApi } from '@/services/projects';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';

export default function VendorProjects() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useAppTheme();
  const styles = useStyles(theme);
  
  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['vendor-projects'],
    queryFn: () => getProjectsApi(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) => updateProjectApi(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-projects'] });
    },
  });

  const handleUpdate = (id: number, status: string, progress: number) => {
    updateMutation.mutate({ id, updates: { status, progress } });
  };

  const projects = data?.projects || [];

  /** Prettify raw DB status into human-readable label */
  const formatStatus = (raw?: string) => {
    if (!raw) return 'Active';
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

  const statusVariant = (s?: string) => {
    const status = s?.toLowerCase() || '';
    if (status.includes('assigned')) return 'info' as const;
    if (status.includes('progress') || status.includes('active')) return 'warning' as const;
    if (status.includes('review')) return 'warning' as const;
    if (status.includes('complete') || status.includes('deliver')) return 'success' as const;
    if (status.includes('cancel') || status.includes('reject')) return 'error' as const;
    return 'info' as const;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Flat Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Projects</Text>
        <Badge text={`${projects.length}`} variant="info" size="md" />
      </View>

      <Animated.FlatList
        data={projects}
        keyExtractor={(item, i) => `${item.id || i}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.brandGreen} />}
        itemLayoutAnimation={FadeInDown.duration(400)}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
            <Card variant="flat" style={styles.card} onPress={() => router.push(`/(vendor)/projects/${item.id}` as any)}>
              <Text style={styles.projectName}>{item.service_type || item.name || item.title}</Text>
              <Text style={styles.client}>Client: {item.customer_name || item.client?.fullname || 'N/A'}</Text>
              <View style={styles.cardFooter}>
                <Badge text={formatStatus(item.status)} variant={statusVariant(item.status)} size="sm" />
                <Text style={styles.deadline}>{item.created_at?.slice(0, 10) || 'N/A'}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8, flexWrap: 'wrap' }}>
                {item.status === 'assigned' && (
                  <Button title="Start" size="sm" variant="primary" onPress={() => handleUpdate(item.id, 'in_progress', 10)} loading={updateMutation.isPending} />
                )}
                {item.status === 'in_progress' && (
                  <Button title="Review" size="sm" variant="primary" onPress={() => handleUpdate(item.id, 'review', 90)} loading={updateMutation.isPending} />
                )}
                {item.status === 'review' && (
                  <Button title="Deliver" size="sm" variant="primary" onPress={() => handleUpdate(item.id, 'delivered', 100)} loading={updateMutation.isPending} />
                )}
                <Button title="Details" size="sm" variant="secondary" onPress={() => router.push(`/(vendor)/projects/${item.id}` as any)} />
                <Button title="Chat" size="sm" variant="secondary" onPress={() => router.push(`/(vendor)/chat-thread/${item.id}` as any)} />
              </View>
            </Card>
          </Animated.View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No assigned projects</Text></View>}
      />
    </View>
  );
}

const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.containerMargin, paddingVertical: spacing.md, backgroundColor: theme.white, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  title: { ...typography.headlineMd, color: theme.ink },
  list: { paddingHorizontal: spacing.containerMargin, paddingTop: spacing.md, paddingBottom: 100, gap: 12 },
  card: { padding: spacing.md, backgroundColor: theme.white, borderWidth: 1, borderColor: theme.hairline, borderRadius: radius.md },
  projectName: { ...typography.labelLg, color: theme.ink },
  client: { ...typography.bodySm, color: theme.stone, marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  deadline: { ...typography.labelMd, color: theme.stone },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { ...typography.bodyMd, color: theme.stone, marginTop: spacing.md },
});

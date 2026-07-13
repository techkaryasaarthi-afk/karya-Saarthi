/**
 * Notifications Modal — Mintlify design.
 * Bottom sheet with flat notification cards, mint accent for unread.
 */
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotificationsApi, markAllNotificationsReadApi, AppNotification } from '@/services/notifications';
import { colors, spacing, typography, radius } from '@/utils/theme';
import Button from '@/components/ui/Button';

interface Props { visible: boolean; onClose: () => void; }

export default function NotificationsModal({ visible, onClose }: Props) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationsApi,
    enabled: visible,
    refetchInterval: visible ? 5000 : false,
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsReadApi,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  const notifications: AppNotification[] = data?.notifications || [];
  const unreadCount = data?.unread || 0;

  const renderItem = ({ item }: { item: AppNotification }) => (
    <View style={[styles.card, !item.is_read && styles.unreadCard]}>
      <View style={[styles.iconWrap, !item.is_read && { backgroundColor: 'rgba(0,212,164,0.1)' }]}>
        <Ionicons
          name={item.type === 'message' ? 'chatbubble-ellipses' : item.type === 'task' ? 'list' : 'notifications'}
          size={20}
          color={!item.is_read ? colors.brandGreen : colors.stone}
        />
      </View>
      <View style={styles.contentWrap}>
        <Text style={[styles.title, !item.is_read && styles.unreadTitle]}>{item.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.time}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && <Text style={styles.headerSub}>{unreadCount} unread</Text>}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.ink} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.center}><ActivityIndicator size="large" color={colors.brandGreen} /></View>
          ) : notifications.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.muted} />
              <Text style={styles.emptyText}>No notifications yet.</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}

          {unreadCount > 0 && (
            <View style={styles.footer}>
              <Button
                title="Mark All as Read"
                onPress={() => markAllReadMutation.mutate()}
                loading={markAllReadMutation.isPending}
                variant="secondary"
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(10,10,10,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, height: '80%', paddingTop: spacing.xs },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.hairline, alignSelf: 'center', marginBottom: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  headerTitle: { ...typography.headlineLg, color: colors.ink },
  headerSub: { ...typography.caption, color: colors.brandGreen, marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...typography.bodyMd, color: colors.stone, marginTop: spacing.md },
  list: { padding: spacing.md },
  card: { flexDirection: 'row', padding: spacing.md, backgroundColor: colors.white, borderRadius: radius.lg, marginBottom: spacing.xs, borderWidth: 1, borderColor: colors.hairline },
  unreadCard: { backgroundColor: colors.surfaceContainerLow, borderColor: colors.brandGreen, borderWidth: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  contentWrap: { flex: 1 },
  title: { ...typography.labelLg, color: colors.steel },
  unreadTitle: { color: colors.ink },
  message: { ...typography.bodyMd, color: colors.slate, marginTop: 2 },
  time: { ...typography.labelMd, color: colors.stone, marginTop: spacing.xs },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.hairline, paddingBottom: 40 },
});

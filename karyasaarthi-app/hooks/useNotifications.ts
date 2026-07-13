/**
 * useNotifications — Push notification handler hook.
 *
 * Handles three critical scenarios:
 * 1. FOREGROUND: Shows in-app toast when a push arrives while the app is open
 * 2. TAP: Navigates to the correct screen when user taps a notification
 * 3. REFETCH: Instantly refreshes chat data when a chat push arrives (no polling delay)
 *
 * In Expo Go we intentionally skip remote notification setup because
 * expo-notifications no longer supports Android push there.
 */

import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useQueryClient } from '@tanstack/react-query';
import {
  addNotificationReceivedListener,
  addNotificationTapListener,
  canUseRemoteNotifications,
  registerForPushNotifications,
  type NotificationPayload,
  type NotificationResponsePayload,
  type NotificationSubscription,
} from '@/services/notifications';
import { useAuthStore } from '@/stores/authStore';

export default function useNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const notificationListener = useRef<NotificationSubscription | null>(null);
  const responseListener = useRef<NotificationSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !canUseRemoteNotifications()) {
      return;
    }

    let isMounted = true;

    const setupNotifications = async () => {
      await registerForPushNotifications();

      if (!isMounted) {
        return;
      }

      // ── Foreground notification: show toast + refetch chat ──
      notificationListener.current = await addNotificationReceivedListener(
        (notification: NotificationPayload) => {
          const content = notification.request?.content;
          const title = content?.title || 'New notification';
          const data = content?.data;
          const body = (content as any)?.body || '';

          // Show in-app toast (like Instagram/WhatsApp banner)
          Toast.show({
            type: 'info',
            text1: title,
            text2: body,
            position: 'top',
            visibilityTime: 4000,
            topOffset: 60,
            onPress: () => {
              Toast.hide();
              navigateToTarget(data);
            },
          });

          // If it's a chat notification, instantly refetch the relevant chat
          if (data?.type === 'chat') {
            const chatType = data.chatType || 'project';
            const conversationId = data.conversationId;

            // Refetch the specific chat thread
            if (conversationId) {
              queryClient.invalidateQueries({
                queryKey: [`chat-messages-${chatType}`, String(conversationId)],
              });
            }

            // Also refetch chat lists to update last message / unread counts
            queryClient.invalidateQueries({ queryKey: ['customer-chat-groups'] });
            queryClient.invalidateQueries({ queryKey: ['customer-chat-projects'] });
            queryClient.invalidateQueries({ queryKey: ['customer-dm-contacts'] });
          }

          // Refetch notification bell count
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      );

      if (!isMounted) {
        notificationListener.current?.remove();
        notificationListener.current = null;
        return;
      }

      // ── Notification tap: navigate to correct screen ──
      responseListener.current = await addNotificationTapListener(
        (response: NotificationResponsePayload) => {
          const data = response.notification?.request?.content?.data;
          navigateToTarget(data);
        }
      );
    };

    setupNotifications();

    return () => {
      isMounted = false;
      notificationListener.current?.remove();
      responseListener.current?.remove();
      notificationListener.current = null;
      responseListener.current = null;
    };
  }, [isAuthenticated, queryClient]);
}

/**
 * Navigate to the target screen based on push notification data.
 * Handles: chat (group/project/dm), project details, invoices.
 */
function navigateToTarget(data?: Record<string, any>) {
  if (!data) return;

  try {
    if (data.type === 'chat' && data.conversationId) {
      const chatType = data.chatType || 'project';
      router.push(`/(customer)/chat/${data.conversationId}?type=${chatType}` as any);
    } else if (data.type === 'project' && data.projectId) {
      router.push(`/(customer)/projects/${data.projectId}` as any);
    } else if (data.type === 'invoice') {
      router.push('/(customer)/profile' as any);
    }
  } catch {
    // Navigation may fail if the route doesn't exist yet
  }
}

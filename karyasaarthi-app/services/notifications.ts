/**
 * Push Notification Service
 *
 * Expo Go no longer supports Android remote push notifications. To avoid
 * startup warnings and runtime noise there, we lazy-load expo-notifications
 * only in development builds and standalone apps.
 */

import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { setSecure } from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';
import api from './api';

export type NotificationSubscription = {
  remove: () => void;
};

export type NotificationPayload = {
  request?: {
    content?: {
      title?: string | null;
      data?: Record<string, any>;
    };
  };
};

export type NotificationResponsePayload = {
  notification?: NotificationPayload;
};

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const noopSubscription: NotificationSubscription = { remove: () => {} };

let notificationHandlerConfigured = false;

async function ensureNotificationHandlerConfigured() {
  if (isExpoGo) {
    return null;
  }

  if (!notificationHandlerConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    notificationHandlerConfigured = true;
  }

  return Notifications;
}

export function canUseRemoteNotifications(): boolean {
  return !isExpoGo;
}

export async function registerForPushNotifications(): Promise<string | null> {
  const Notifications = await ensureNotificationHandlerConfigured();

  if (!Notifications) {
    if (__DEV__) {
      console.log('[Push] Skipping push registration in Expo Go. Use a development build for remote notifications.');
    }
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Permission not granted');
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || undefined,
    });
    const token = tokenData.data;

    await setSecure(STORAGE_KEYS.PUSH_TOKEN, token);
    registerTokenWithBackend(token).catch(() => {});

    if (Platform.OS === 'android') {
      await setupAndroidChannels(Notifications);
    }

    return token;
  } catch (error) {
    console.error('[Push] Token registration failed:', error);
    return null;
  }
}

async function registerTokenWithBackend(token: string): Promise<void> {
  try {
    await api.post('/api/notifications/register', {
      push_token: token,
      platform: Platform.OS,
    });
  } catch {
    // Backend registration is optional during local development.
  }
}

async function setupAndroidChannels(Notifications: typeof import('expo-notifications')): Promise<void> {
  await Notifications.setNotificationChannelAsync('default', {
    name: 'General',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1B3A6B',
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('chat', {
    name: 'Chat Messages',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 100],
    lightColor: '#F59E0B',
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('projects', {
    name: 'Project Updates',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: '#1B3A6B',
  });
}

export async function addNotificationReceivedListener(
  callback: (notification: NotificationPayload) => void
): Promise<NotificationSubscription> {
  const Notifications = await ensureNotificationHandlerConfigured();

  if (!Notifications) {
    return noopSubscription;
  }

  return Notifications.addNotificationReceivedListener(callback as Parameters<typeof Notifications.addNotificationReceivedListener>[0]);
}

export async function addNotificationTapListener(
  callback: (response: NotificationResponsePayload) => void
): Promise<NotificationSubscription> {
  const Notifications = await ensureNotificationHandlerConfigured();

  if (!Notifications) {
    return noopSubscription;
  }

  return Notifications.addNotificationResponseReceivedListener(callback as Parameters<typeof Notifications.addNotificationResponseReceivedListener>[0]);
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  delaySeconds = 0
): Promise<string | null> {
  const Notifications = await ensureNotificationHandlerConfigured();

  if (!Notifications) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: 'default' },
    trigger: delaySeconds > 0
      ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds }
      : null,
  });
}

export async function getBadgeCount(): Promise<number> {
  const Notifications = await ensureNotificationHandlerConfigured();

  if (!Notifications) {
    return 0;
  }

  return Notifications.getBadgeCountAsync();
}

export async function setBadgeCount(count: number): Promise<void> {
  const Notifications = await ensureNotificationHandlerConfigured();

  if (!Notifications) {
    return;
  }

  await Notifications.setBadgeCountAsync(count);
}

export async function clearAllNotifications(): Promise<void> {
  const Notifications = await ensureNotificationHandlerConfigured();

  if (!Notifications) {
    return;
  }

  await Notifications.dismissAllNotificationsAsync();
  await Notifications.setBadgeCountAsync(0);
}

// Backend DB Notifications API
export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  project_id: number | null;
  is_read: boolean;
  created_at: string;
}

export async function getNotificationsApi() {
  const { data } = await api.get('/api/notifications');
  return data;
}

export async function markAllNotificationsReadApi() {
  const { data } = await api.patch('/api/notifications', { markAllRead: true });
  return data;
}


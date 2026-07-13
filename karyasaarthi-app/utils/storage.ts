/**
 * Secure storage wrapper using expo-secure-store.
 * Provides encrypted key-value storage for tokens and sensitive data.
 * Falls back gracefully on web (where SecureStore isn't available).
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Store a value securely (encrypted on device).
 * On web, falls back to sessionStorage (NOT localStorage for security).
 */
export async function setSecure(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { sessionStorage.setItem(key, value); } catch {}
    return;
  }
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

/**
 * Retrieve a securely stored value.
 * Returns null if the key doesn't exist or on error.
 */
export async function getSecure(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try { return sessionStorage.getItem(key); } catch { return null; }
  }
  return SecureStore.getItemAsync(key);
}

/**
 * Delete a securely stored value.
 */
export async function deleteSecure(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { sessionStorage.removeItem(key); } catch {}
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

/**
 * Clear all app-specific secure storage keys.
 * Used during logout to ensure no tokens remain.
 */
export async function clearAllSecure(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => deleteSecure(key)));
}

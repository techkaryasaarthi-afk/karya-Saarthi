/**
 * Axios-based API client with automatic token management.
 * 
 * Security features:
 * - Bearer token injection from SecureStore
 * - Automatic token refresh on 401
 * - Request/response interceptors for logging
 * - Timeout protection (15s default)
 * - X-Platform: mobile header on all requests
 * - Content-Type enforcement
 * 
 * Usage:
 *   import api from '@/services/api';
 *   const { data } = await api.get('/api/services');
 *   const { data } = await api.post('/api/auth/login', { email, password });
 */

class SimpleEventEmitter {
  private listeners: { [key: string]: Function[] } = {};
  on(event: string, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(...args));
    }
  }
}

/** Event bus for auth state changes (e.g., forced logout on token expiry) */
export const authEvents = new SimpleEventEmitter();

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL, STORAGE_KEYS, AUTH_ENDPOINTS, PLATFORM_HEADER } from '@/utils/constants';
import { getSecure, setSecure, deleteSecure } from '@/utils/storage';

// ── Create axios instance ────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    ...PLATFORM_HEADER,
  },
});

// Track if we're currently refreshing to avoid infinite loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/** Process queued requests after token refresh */
function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  failedQueue = [];
}

// ── Request interceptor: inject Bearer token ─────────────────────────────────
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getSecure(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 with automatic refresh ──────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh on 401 and if we haven't already retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh if the request was to the refresh or login endpoints
    if (
      originalRequest.url?.includes(AUTH_ENDPOINTS.REFRESH) ||
      originalRequest.url?.includes(AUTH_ENDPOINTS.LOGIN)
    ) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            originalRequest._retry = true;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const refreshToken = await getSecure(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        // No refresh token available — force logout gracefully
        await deleteSecure(STORAGE_KEYS.ACCESS_TOKEN);
        await deleteSecure(STORAGE_KEYS.USER_DATA);
        authEvents.emit('forceLogout');
        return Promise.reject(new Error('Session expired. Please login again.'));
      }

      // Call refresh endpoint with the refresh token as Bearer
      const { data } = await axios.post(
        `${API_URL}${AUTH_ENDPOINTS.REFRESH}`,
        {},
        {
          headers: {
            ...PLATFORM_HEADER,
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      // Store new access token if returned
      if (data.tokens?.accessToken) {
        await setSecure(STORAGE_KEYS.ACCESS_TOKEN, data.tokens.accessToken);
        if (data.tokens.refreshToken) {
          await setSecure(STORAGE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken);
        }
        processQueue(null, data.tokens.accessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
        }
        return api(originalRequest);
      }

      throw new Error('No token in refresh response');
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Clear tokens — session is truly expired
      await deleteSecure(STORAGE_KEYS.ACCESS_TOKEN);
      await deleteSecure(STORAGE_KEYS.REFRESH_TOKEN);
      await deleteSecure(STORAGE_KEYS.USER_DATA);
      authEvents.emit('forceLogout');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

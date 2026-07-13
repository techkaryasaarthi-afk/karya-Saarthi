/**
 * Auth Store — Zustand store managing authentication state.
 * 
 * Handles:
 * - Login/logout flows with SecureStore token persistence
 * - Token refresh
 * - User state hydration on app launch
 * - Role-based navigation hints
 */

import { create } from 'zustand';
import { STORAGE_KEYS, ROLES } from '@/utils/constants';
import { getSecure, setSecure, deleteSecure, clearAllSecure } from '@/utils/storage';
import { loginApi, logoutApi, getMeApi, type User } from '@/services/auth';
import { authEvents } from '@/services/api';

// ── Types ────────────────────────────────────────────────────────────────────
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string, remember?: boolean) => Promise<User>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;

  // Computed helpers
  isCustomer: () => boolean;
  isVendor: () => boolean;
  isAdmin: () => boolean;
  isInternal: () => boolean;
}

// ── Store ────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,
  error: null,

  // ── Login ──────────────────────────────────────────────────────────────
  login: async (email, password, remember = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await loginApi(email, password, remember);

      // Extract tokens flexibly — support nested and flat response shapes
      const accessToken = response.tokens?.accessToken || response.accessToken;
      const refreshToken = response.tokens?.refreshToken || response.refreshToken;

      if (accessToken) {
        await setSecure(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      }
      if (refreshToken) {
        await setSecure(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }

      // Persist user data for offline access
      await setSecure(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return response.user;
    } catch (err: unknown) {
      const message = extractErrorMessage(err);
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  // ── Logout ─────────────────────────────────────────────────────────────
  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutApi();
    } finally {
      // Always clear local state regardless of API success
      await clearAllSecure([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  // ── Hydrate (called on app launch) ─────────────────────────────────────
  hydrate: async () => {
    try {
      const token = await getSecure(STORAGE_KEYS.ACCESS_TOKEN);
      const userData = await getSecure(STORAGE_KEYS.USER_DATA);

      if (!token) {
        set({ isHydrated: true, isAuthenticated: false });
        return;
      }

      // Use cached user data for instant UI, then verify with server
      if (userData) {
        try {
          const cachedUser = JSON.parse(userData) as User;
          set({ user: cachedUser, isAuthenticated: true });
        } catch {}
      }

      // Verify token is still valid by calling /me
      try {
        const { user } = await getMeApi();
        await setSecure(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        set({ user, isAuthenticated: true, isHydrated: true });
      } catch {
        // Token is invalid — clear everything
        await clearAllSecure([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
        ]);
        set({ user: null, isAuthenticated: false, isHydrated: true });
      }
    } catch {
      set({ isHydrated: true, isAuthenticated: false });
    }
  },

  // ── Setters ────────────────────────────────────────────────────────────
  setUser: (user) => set({ user }),
  clearError: () => set({ error: null }),

  // ── Computed helpers ───────────────────────────────────────────────────
  isCustomer: () => get().user?.role === ROLES.CUSTOMER,
  isVendor: () => get().user?.role === ROLES.VENDOR,
  isAdmin: () => {
    const role = get().user?.role;
    return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
  },
  isInternal: () => {
    const role = get().user?.role;
    const internalRoles: string[] = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.BOARD_MEMBER, ROLES.PILLAR_MEMBER];
    return !!role && internalRoles.includes(role);
  },
}));

// ── Helpers ──────────────────────────────────────────────────────────────────
function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
    return axiosErr.response?.data?.error || axiosErr.message || 'Something went wrong';
  }
  return 'Something went wrong';
}

// ── Listen for forced logout events from the API interceptor ─────────────────
authEvents.on('forceLogout', () => {
  const store = useAuthStore.getState();
  if (store.isAuthenticated) {
    clearAllSecure([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]).then(() => {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    });
  }
});

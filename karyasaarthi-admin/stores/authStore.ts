/**
 * Admin Auth Store — Zustand store for admin authentication.
 */
import { create } from 'zustand';
import { STORAGE_KEYS, ADMIN_ROLES } from '@/utils/constants';
import { getSecure, setSecure, deleteSecure, clearAllSecure } from '@/utils/storage';
import { loginApi, logoutApi, getMeApi, type User } from '@/services/auth';
import { authEvents } from '@/services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<User>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,
  error: null,

  login: async (email, password, remember = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await loginApi(email, password, remember);

      // Extract tokens flexibly — support nested and flat response shapes
      const accessToken = response.tokens?.accessToken || (response as any).accessToken;
      const refreshToken = response.tokens?.refreshToken || (response as any).refreshToken;

      if (accessToken) {
        await setSecure(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      }
      if (refreshToken) {
        await setSecure(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      await setSecure(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      set({ user: response.user, isAuthenticated: true, isLoading: false, error: null });
      return response.user;
    } catch (err: unknown) {
      const message = err && typeof err === 'object' ? ((err as any).response?.data?.error || (err as any).message || 'Login failed') : 'Login failed';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try { await logoutApi(); } finally {
      await clearAllSecure([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.USER_DATA]);
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  hydrate: async () => {
    try {
      const token = await getSecure(STORAGE_KEYS.ACCESS_TOKEN);
      const userData = await getSecure(STORAGE_KEYS.USER_DATA);
      if (!token) { set({ isHydrated: true, isAuthenticated: false }); return; }
      if (userData) { try { set({ user: JSON.parse(userData) as User, isAuthenticated: true }); } catch {} }
      try {
        const { user } = await getMeApi();
        await setSecure(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        set({ user, isAuthenticated: true, isHydrated: true });
      } catch {
        await clearAllSecure([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.USER_DATA]);
        set({ user: null, isAuthenticated: false, isHydrated: true });
      }
    } catch { set({ isHydrated: true, isAuthenticated: false }); }
  },

  setUser: (user) => set({ user }),
  clearError: () => set({ error: null }),

  isAdmin: () => {
    const role = get().user?.role?.toLowerCase();
    return !!role && (ADMIN_ROLES as readonly string[]).includes(role);
  },
}));

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

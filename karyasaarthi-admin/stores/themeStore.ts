import { create } from 'zustand';
import { getSecure, setSecure } from '@/utils/storage';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  themeMode: ThemeMode;
  setTheme: (mode: ThemeMode) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'dark', // Mintlify dark mode by default
  setTheme: async (mode) => {
    set({ themeMode: mode });
    await setSecure('app_theme', mode);
  },
  hydrate: async () => {
    const saved = await getSecure('app_theme');
    if (saved && ['system', 'light', 'dark'].includes(saved)) {
      set({ themeMode: saved as ThemeMode });
    }
  }
}));

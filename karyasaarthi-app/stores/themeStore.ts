import { create } from 'zustand';
import { getSecure, setSecure } from '@/utils/storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  initializeTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light', // default to light
  setTheme: async (theme) => {
    await setSecure('app_theme', theme);
    set({ theme });
  },
  initializeTheme: async () => {
    const savedTheme = await getSecure('app_theme');
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      set({ theme: savedTheme as ThemeMode });
    }
  },
}));

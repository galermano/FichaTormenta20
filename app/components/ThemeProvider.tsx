'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  type ThemePreset,
  THEME_PRESETS,
  getSavedThemeId,
  saveThemeId,
  getThemeById,
  applyThemeToDOM,
} from '@/app/lib/themes';

interface ThemeContextValue {
  theme: ThemePreset;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreset>(() => getThemeById(getSavedThemeId()));

  useEffect(() => {
    // Apply on mount
    applyThemeToDOM(theme);
  }, [theme]);

  const setTheme = useCallback((id: string) => {
    const t = getThemeById(id);
    setThemeState(t);
    saveThemeId(id);
    applyThemeToDOM(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

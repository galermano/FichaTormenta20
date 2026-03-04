export interface ThemePreset {
  id: string;
  name: string;
  colors: {
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'amber',
    name: 'Âmbar',
    colors: { 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
  },
  {
    id: 'emerald',
    name: 'Esmeralda',
    colors: { 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857' },
  },
  {
    id: 'violet',
    name: 'Violeta',
    colors: { 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
  },
  {
    id: 'rose',
    name: 'Rosa',
    colors: { 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c' },
  },
  {
    id: 'sky',
    name: 'Céu',
    colors: { 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1' },
  },
  {
    id: 'red',
    name: 'Rubi',
    colors: { 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
  },
  {
    id: 'teal',
    name: 'Turquesa',
    colors: { 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' },
  },
  {
    id: 'orange',
    name: 'Laranja',
    colors: { 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c' },
  },
];

export const DEFAULT_THEME_ID = 'amber';

const THEME_STORAGE_KEY = 't20_theme';

export function getSavedThemeId(): string {
  if (typeof window === 'undefined') return DEFAULT_THEME_ID;
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

export function saveThemeId(id: string): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // ignore
  }
}

export function getThemeById(id: string): ThemePreset {
  return THEME_PRESETS.find((t) => t.id === id) || THEME_PRESETS[0];
}

export function applyThemeToDOM(theme: ThemePreset): void {
  const root = document.documentElement;
  root.style.setProperty('--accent-300', theme.colors[300]);
  root.style.setProperty('--accent-400', theme.colors[400]);
  root.style.setProperty('--accent-500', theme.colors[500]);
  root.style.setProperty('--accent-600', theme.colors[600]);
  root.style.setProperty('--accent-700', theme.colors[700]);
}

import { THEME_KEY } from '../constants.ts';
import { getStorageValue, removeStorageValue, saveStorageValue } from './storage.ts';

export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

const themeColor: Record<Theme, string> = {
  light: '#f0f2f5',
  dark: '#1a1e28',
};

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

export function getThemePreference(): ThemePreference {
  const savedTheme = getStorageValue(THEME_KEY);

  if (savedTheme === null) return 'system';
  if (isTheme(savedTheme)) return savedTheme;

  removeStorageValue(THEME_KEY);
  return 'system';
}

export function getResolvedTheme(preference: ThemePreference): Theme {
  if (preference !== 'system') return preference;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(preference: ThemePreference): void {
  const root = document.documentElement;

  if (preference === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.dataset.theme = preference;
  }

  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute('content', themeColor[getResolvedTheme(preference)]);
  document.dispatchEvent(new Event('themechange'));
}

export function saveThemePreference(preference: ThemePreference): void {
  if (preference === 'system') {
    removeStorageValue(THEME_KEY);
  } else {
    saveStorageValue(THEME_KEY, preference);
  }
}

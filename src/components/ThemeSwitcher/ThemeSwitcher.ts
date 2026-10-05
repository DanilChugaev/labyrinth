import './theme-switcher.css';
import {
  applyTheme,
  getThemePreference,
  saveThemePreference,
  type ThemePreference,
} from '../../utils/theme.ts';

const themeOptions: { value: ThemePreference; label: string; icon: string }[] = [
  { value: 'light', label: 'Светлая тема', icon: '☀' },
  { value: 'system', label: 'Системная тема', icon: '◐' },
  { value: 'dark', label: 'Тёмная тема', icon: '☾' },
];

const themeInputName = 'theme-preference';

export function ThemeSwitcher(): string {
  return `<fieldset class="theme-switcher">
            <legend class="theme-switcher__legend">Тема</legend>
            <span class="theme-switcher__label">Тема</span>
            <div class="theme-switcher__options">
              ${themeOptions
                .map(
                  ({
                    value,
                    label,
                    icon,
                  }) => `<label class="theme-switcher__option" title="${label}">
                    <input class="theme-switcher__input" type="radio" name="${themeInputName}" value="${value}">
                    <span class="theme-switcher__icon" aria-hidden="true">${icon}</span>
                    <span class="visually-hidden">${label}</span>
                  </label>`,
                )
                .join('')}
            </div>
          </fieldset>`;
}

export function setupThemeSwitcher(): void {
  const inputs = document.querySelectorAll<HTMLInputElement>(`input[name="${themeInputName}"]`);
  let preference = getThemePreference();

  function updateInputs(): void {
    inputs.forEach(input => {
      input.checked = input.value === preference;
    });
  }

  updateInputs();
  applyTheme(preference);

  inputs.forEach(input => {
    input.addEventListener('change', () => {
      if (!input.checked || !isThemePreference(input.value)) return;

      preference = input.value;
      saveThemePreference(preference);
      applyTheme(preference);
    });
  });

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    if (preference === 'system') applyTheme(preference);
  });
}

function isThemePreference(value: string): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

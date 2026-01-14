import './settings.css';
import settings from '/settings.svg';
import type { SettingsItem } from '../../types.ts';

export function Settings({ items }: { items: SettingsItem[] }) {
  const list = items.map(
    item => `
                <label class="settings__label" title="${item.title}">
                  <input id="${item.id}" type="checkbox" checked>
                  ${item.label}
                </label>
              `,
  );

  return `<div class="settings">
            <button class="settings__button" popovertarget="settings-popover" title="Настройки">
              <img class="settings__icon" src="${settings}" alt="Settings icon" width="30">
            </button>
            
            <div class="settings__popover" popover id="settings-popover">
              <div class="settings__title">Настройки</div>
              
              ${list.join('')}
            </div>
          </div>`;
}

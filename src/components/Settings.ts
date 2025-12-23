import type { SettingsItem } from '../types.ts';

export function Settings({ icon, items }: { icon: string; items: SettingsItem[] }) {
  const list = items.map(
    item => `
                <label title="${item.title}">
                  <input id="${item.id}" type="checkbox" checked>
                  ${item.label}
                </label>
              `,
  );

  return `<div class="settings">
            <button class="settings__button" popovertarget="settings-popover" title="Настройки">
              <img class="settings__icon" src="${icon}" alt="Settings icon" width="30">
            </button>
            
            <div class="settings__popover" popover id="settings-popover">
              <span>Настройки</span>
              
              ${list.join('')}
            </div>
          </div>`;
}

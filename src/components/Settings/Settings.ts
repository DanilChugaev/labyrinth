import './settings.css';
import settings from '/settings.svg';
import type { SettingsItem } from '../../types.ts';
import { FAST_MOVEMENT_KEY, TIMER_KEY, VIEW_PATH_KEY } from '../../constants.ts';
import { loadBooleanStorageValue, saveStorageValue } from '../../utils/storage.ts';

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

export function setupSettingsCheckboxes({
  canvasPath,
  timerContainer,
  checkboxViewPath,
  checkboxFastMovement,
  checkboxTimer,
}: {
  canvasPath: HTMLCanvasElement;
  timerContainer: HTMLDivElement;
  checkboxViewPath: HTMLInputElement;
  checkboxFastMovement: HTMLInputElement;
  checkboxTimer: HTMLInputElement;
}) {
  checkboxViewPath.checked = loadBooleanStorageValue(VIEW_PATH_KEY, true);
  checkboxFastMovement.checked = loadBooleanStorageValue(FAST_MOVEMENT_KEY, true);
  checkboxFastMovement.disabled = !checkboxViewPath.checked;
  checkboxTimer.checked = loadBooleanStorageValue(TIMER_KEY, true);

  changeDisplay(canvasPath, checkboxViewPath.checked);

  checkboxViewPath.onchange = () => {
    const checked = checkboxViewPath.checked;

    changeDisplay(canvasPath, checked);

    saveStorageValue(VIEW_PATH_KEY, checked.toString());
    checkboxFastMovement.disabled = !checked;
    checkboxFastMovement.checked = checked;
    saveStorageValue(FAST_MOVEMENT_KEY, checkboxFastMovement.checked.toString());
  };

  checkboxFastMovement.onchange = () => {
    saveStorageValue(FAST_MOVEMENT_KEY, checkboxFastMovement.checked.toString());
  };

  checkboxTimer.onchange = () => {
    changeDisplay(timerContainer, checkboxTimer.checked, 'flex');
    saveStorageValue(TIMER_KEY, checkboxTimer.checked.toString());
  };
}

function changeDisplay(element: HTMLElement, condition: boolean, value = 'block') {
  element.style.display = condition ? value : 'none';
}

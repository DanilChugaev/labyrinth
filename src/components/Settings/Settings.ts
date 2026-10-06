import './settings.css';
import settings from '/settings.svg';
import type { SettingsItem } from '../../types.ts';
import { FAST_MOVEMENT_KEY, TIMER_KEY, VIEW_PATH_KEY } from '../../constants.ts';
import { loadBooleanStorageValue, saveStorageValue } from '../../utils/storage.ts';
import { ThemeSwitcher, setupThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher.ts';

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
            <button class="settings__button" id="settings-button" type="button" popovertarget="settings-popover" aria-controls="settings-popover" aria-expanded="false" aria-label="Открыть настройки" title="Настройки">
              <img class="settings__icon" src="${settings}" alt="" width="30">
            </button>
            
            <div class="settings__popover" popover id="settings-popover" role="dialog" aria-modal="false" aria-labelledby="settings-title" tabindex="-1">
               <div class="settings__title" id="settings-title">Настройки</div>

                ${list.join('')}
                ${ThemeSwitcher()}
                <p class="settings__hint">Прогресс игры сохраняется автоматически.</p>
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
  setupSettingsPopover();
  setupThemeSwitcher();
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

function setupSettingsPopover(): void {
  const button = document.querySelector<HTMLButtonElement>('#settings-button')!;
  const popover = document.querySelector<HTMLDivElement>('#settings-popover')!;
  const firstControl = popover.querySelector<HTMLInputElement>('input');
  let shouldRestoreFocus = false;

  popover.addEventListener('toggle', () => {
    const isOpen = popover.matches(':popover-open');
    button.setAttribute('aria-expanded', String(isOpen));
    button.setAttribute('aria-label', isOpen ? 'Закрыть настройки' : 'Открыть настройки');

    if (isOpen) {
      requestAnimationFrame(() => firstControl?.focus());
    } else if (shouldRestoreFocus) {
      shouldRestoreFocus = false;
      button.focus();
    }
  });

  popover.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;

    shouldRestoreFocus = true;
    popover.hidePopover();
  });
}

function changeDisplay(element: HTMLElement, condition: boolean, value = 'block') {
  element.style.display = condition ? value : 'none';
}

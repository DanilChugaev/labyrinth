import './styles/colors-palette.css';
import './styles/common.css';

import { setupCanvas } from './elements/canvas.ts';
import { setupButton } from './elements/button.ts';
import { setupSelect } from './elements/select.ts';
import { setupArrows } from './elements/arrows.ts';

import { Preloader } from './components/Preloader/Preloader.ts';
import { Settings, setupSettingsCheckboxes } from './components/Settings/Settings.ts';
import type { SettingsItem } from './types.ts';
import { Logo } from './components/Logo/Logo.ts';
import { Timer } from './components/Timer/Timer.ts';
import { ZoomControls, zoomControlIds } from './components/Zoom/Zoom.ts';
import { getLabyrinthSize, setLabyrinthSize } from './utils/storage.ts';
import {
  JUNIOR_MAX_CANVAS_SIZE,
  JUNIOR_MIN_CANVAS_SIZE,
  JUNIOR_STEP_CANVAS_SIZE,
  MAX_CANVAS_SIZE,
  STEP_CANVAS_SIZE,
} from './constants.ts';

async function main() {
  const app = document.querySelector<HTMLDivElement>('#app')!;

  const preloaderId = 'preloader';
  const checkboxViewPathId = 'checkbox-view-path';
  const checkboxFastMovementId = 'checkbox-fast-movement';
  const checkboxTimerId = 'checkbox-timer';

  const timerContainerId = 'timer-container-id';

  const settingsItems: SettingsItem[] = [
    {
      id: checkboxViewPathId,
      label: 'Показать путь',
      title: '',
    },
    {
      id: checkboxFastMovementId,
      label: 'Быстрое перемещение',
      title: 'Нажми на точку пути',
    },
    {
      id: checkboxTimerId,
      label: 'Таймер',
      title: '',
    },
  ];

  app.innerHTML = `
    <header class="header">
      ${Logo()}
      
      ${Timer(timerContainerId)}
      
      <div class="game__actions">
        ${Settings({ items: settingsItems })}
      
        <div class="game__select-container">
          <label class="visually-hidden" for="select">Размер лабиринта</label>
          <select class="game__select" id="select" disabled aria-label="Размер лабиринта"></select>
        </div>
        
        <button class="game__button" id="button" type="button" disabled>Новый лабиринт</button>
      </div>
    </header>
    
    <main class="game" aria-labelledby="game-title">
      <h2 class="visually-hidden" id="game-title">Игровое поле</h2>
      <p class="visually-hidden" id="game-instructions">Используйте кнопки направления или стрелки клавиатуры, чтобы перемещаться по лабиринту. Чтобы приблизить поле, используйте кнопки масштаба, жест двумя пальцами или Control и колесо мыши.</p>
      <div class="game__canvas-container" aria-describedby="game-instructions">
        ${Preloader({ id: preloaderId })}
        
         <canvas id="canvas-background" class="canvas-background" aria-hidden="true"></canvas>
         <canvas id="canvas-path" class="canvas-path" aria-hidden="true"></canvas>
         <canvas id="canvas-point" class="canvas-point" tabindex="0" aria-label="Лабиринт. Для движения используйте кнопки направления или стрелки клавиатуры.">Ваш браузер не поддерживает Canvas. Используйте современный браузер для игры.</canvas>

        <dialog id="result-container" class="game__result" aria-labelledby="result-title" aria-describedby="result-description">
          <div class="game__result-icon" aria-hidden="true">✦</div>
          <h2 id="result-title" class="game__result-title">Победа!</h2>
          <p id="result-description" class="game__result-description">Вы добрались до выхода из лабиринта.</p>

          <dl class="game__result-stats">
            <div class="game__result-stat">
              <dt>Размер лабиринта</dt>
              <dd id="result-size">—</dd>
            </div>
            <div class="game__result-stat">
              <dt>Итоговое время</dt>
              <dd id="result-time">00:00</dd>
            </div>
            <div class="game__result-stat">
              <dt>Лучший результат</dt>
              <dd id="result-best-time">00:00</dd>
            </div>
          </dl>

          <div class="game__result-actions">
            <button class="game__button" id="new-level" type="button">Новый лабиринт</button>
            <button class="game__button" id="next-level" type="button">Следующий уровень</button>
          </div>
        </dialog>
      </div>
      
      <div class="game__controls">
        <div class="game__arrows">
          <button class="game__button game-button--top" id="top" type="button"><span>↑</span></button>
          <button class="game__button game-button--left" id="left" type="button"><span>←</span></button>
          <button class="game__button game-button--bottom" id="bottom" type="button"><span>↓</span></button>
          <button class="game__button game-button--right" id="right" type="button"><span>→</span></button>
        </div>
        
        ${ZoomControls()}
      </div>
    </main>
  `;

  const elements = {
    canvasBackground: document.querySelector<HTMLCanvasElement>('#canvas-background')!,
    canvasPath: document.querySelector<HTMLCanvasElement>('#canvas-path')!,
    canvasPoint: document.querySelector<HTMLCanvasElement>('#canvas-point')!,
    canvasContainer: document.querySelector<HTMLDivElement>('.game__canvas-container')!,
    button: document.querySelector<HTMLButtonElement>('#button')!,
    newLevel: document.querySelector<HTMLButtonElement>('#new-level')!,
    nextLevel: document.querySelector<HTMLButtonElement>('#next-level')!,
    select: document.querySelector<HTMLSelectElement>('#select')!,
    preloader: document.querySelector<SVGSVGElement>(`#${preloaderId}`)!,
    timerContainer: document.querySelector<HTMLDivElement>(`#${timerContainerId}`)!,

    checkboxViewPath: document.querySelector<HTMLInputElement>(`#${checkboxViewPathId}`)!,
    checkboxFastMovement: document.querySelector<HTMLInputElement>(`#${checkboxFastMovementId}`)!,
    checkboxTimer: document.querySelector<HTMLInputElement>(`#${checkboxTimerId}`)!,

    top: document.querySelector<HTMLButtonElement>('#top')!,
    left: document.querySelector<HTMLButtonElement>('#left')!,
    bottom: document.querySelector<HTMLButtonElement>('#bottom')!,
    right: document.querySelector<HTMLButtonElement>('#right')!,
    resultContainer: document.querySelector<HTMLDialogElement>('#result-container')!,
    zoomDecrease: document.querySelector<HTMLButtonElement>(`#${zoomControlIds.decrease}`)!,
    zoomIncrease: document.querySelector<HTMLButtonElement>(`#${zoomControlIds.increase}`)!,
    zoomReset: document.querySelector<HTMLButtonElement>(`#${zoomControlIds.reset}`)!,
    zoomValue: document.querySelector<HTMLOutputElement>(`#${zoomControlIds.value}`)!,
  };

  function updateNextLevelVisibility(): void {
    elements.nextLevel.hidden = Number(getLabyrinthSize()) >= MAX_CANVAS_SIZE;
  }

  const { redrawLabyrinth, drawPoint, zoomIn, zoomOut, fitToScreen } = await setupCanvas({
    canvasBackground: elements.canvasBackground,
    canvasPath: elements.canvasPath,
    canvasPoint: elements.canvasPoint,
    canvasContainer: elements.canvasContainer,
    resultContainer: elements.resultContainer,
    onZoomChange: zoomPercent => {
      elements.zoomValue.value = `${zoomPercent}%`;
      elements.zoomValue.textContent = `${zoomPercent}%`;
    },
  });

  setupSettingsCheckboxes({
    canvasPath: elements.canvasPath,
    timerContainer: elements.timerContainer,
    checkboxViewPath: elements.checkboxViewPath,
    checkboxFastMovement: elements.checkboxFastMovement,
    checkboxTimer: elements.checkboxTimer,
  });

  elements.resultContainer.addEventListener('cancel', event => event.preventDefault());

  setupButton(elements.button, redrawLabyrinth);
  setupButton(elements.newLevel, redrawLabyrinth);
  setupButton(elements.nextLevel, () => {
    let size = Number(getLabyrinthSize());

    if (size >= JUNIOR_MIN_CANVAS_SIZE && size < JUNIOR_MAX_CANVAS_SIZE) {
      size += JUNIOR_STEP_CANVAS_SIZE;
    } else if (size < MAX_CANVAS_SIZE) {
      size += STEP_CANVAS_SIZE;
    }

    setLabyrinthSize(size);
    updateNextLevelVisibility();
    redrawLabyrinth();
  });
  setupSelect(elements.select, () => {
    updateNextLevelVisibility();
    void redrawLabyrinth();
  });
  setupButton(elements.zoomDecrease, zoomOut);
  setupButton(elements.zoomIncrease, zoomIn);
  setupButton(elements.zoomReset, fitToScreen);
  setupArrows({
    top: elements.top,
    left: elements.left,
    bottom: elements.bottom,
    right: elements.right,
    drawPoint,
  });

  elements.button.disabled = false;
  elements.select.disabled = false;
  elements.preloader.style.display = 'none';
  app.setAttribute('aria-busy', 'false');
  updateNextLevelVisibility();
}

main();

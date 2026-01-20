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
import { getLabyrinthSize, setLabyrinthSize } from './utils/storage.ts';
import {
  JUNIOR_MAX_CANVAS_SIZE,
  JUNIOR_MIN_CANVAS_SIZE,
  JUNIOR_STEP_CANVAS_SIZE,
  STEP_CANVAS_SIZE,
} from './constants.ts';

async function main() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  const figureColor = getComputedStyle(app).getPropertyValue('--figure-color');

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
    <div class="header">
      ${Logo()}
      
      ${Timer(timerContainerId)}
      
      <div class="game__actions">
        ${Settings({ items: settingsItems })}
      
        <div class="game__select-container">
          <select class="game__select" id="select" disabled></select>
        </div>
        
        <button class="game__button" id="button" type="button" disabled>Новый лабиринт</button>
      </div>
    </div>
    
    <div class="game">
      <div class="game__canvas-container">
        ${Preloader({
          id: preloaderId,
          color: figureColor,
        })}
        
        <canvas id="canvas-background" class="canvas-background"></canvas>
        <canvas id="canvas-path" class="canvas-path"></canvas>
        <canvas id="canvas-point" class="canvas-point"></canvas>
        
        <div id="result-container" class="game__result">
          <div>Победа!</div>
          
          <div>
            <button class="game__button" id="new-level" type="button">Новый лабиринт</button>
            <button class="game__button" id="next-level" type="button">Следующий уровень</button>
          </div>
        </div>
      </div>
      
      <div class="game__arrows">
        <button class="game__button game-button--top" id="top" type="button"><span>↑</span></button>
        <button class="game__button game-button--left" id="left" type="button"><span>←</span></button>
        <button class="game__button game-button--bottom" id="bottom" type="button"><span>↓</span></button>
        <button class="game__button game-button--right" id="right" type="button"><span>→</span></button>
      </div>
    </div>
  `;

  const elements = {
    canvasBackground: document.querySelector<HTMLCanvasElement>('#canvas-background')!,
    canvasPath: document.querySelector<HTMLCanvasElement>('#canvas-path')!,
    canvasPoint: document.querySelector<HTMLCanvasElement>('#canvas-point')!,
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
    resultContainer: document.querySelector<HTMLDivElement>('#result-container')!,
  };

  const { drawLabyrinth, redrawLabyrinth, drawPoint } = await setupCanvas({
    canvasBackground: elements.canvasBackground,
    canvasPath: elements.canvasPath,
    canvasPoint: elements.canvasPoint,
    pathColor: figureColor,
    resultContainer: elements.resultContainer,
  });

  setupSettingsCheckboxes({
    canvasPath: elements.canvasPath,
    timerContainer: elements.timerContainer,
    checkboxViewPath: elements.checkboxViewPath,
    checkboxFastMovement: elements.checkboxFastMovement,
    checkboxTimer: elements.checkboxTimer,
  });

  setupButton(elements.button, redrawLabyrinth);
  setupButton(elements.newLevel, redrawLabyrinth);
  setupButton(elements.nextLevel, () => {
    let size = Number(getLabyrinthSize());

    if (size >= JUNIOR_MIN_CANVAS_SIZE && size <= JUNIOR_MAX_CANVAS_SIZE) {
      size += JUNIOR_STEP_CANVAS_SIZE;
    } else {
      size += STEP_CANVAS_SIZE;
    }

    setLabyrinthSize(size);
    redrawLabyrinth();
  });
  setupSelect(elements.select, redrawLabyrinth);
  setupArrows({
    top: elements.top,
    left: elements.left,
    bottom: elements.bottom,
    right: elements.right,
    drawPoint,
  });

  await drawLabyrinth();
  drawPoint();

  elements.button.disabled = false;
  elements.select.disabled = false;
  elements.preloader.style.display = 'none';
}

main();

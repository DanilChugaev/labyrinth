import './style.css';
import { setupCanvas } from './elements/canvas.ts';
import { setupButton } from './elements/button.ts';
import { setupSelect } from './elements/select.ts';
import labyrinth from '/labyrinth.svg';
import settings from '/settings.svg';
import { setupArrows } from './elements/arrows.ts';
import { setupCheckboxes } from './elements/checkboxes.ts';

const app = document.querySelector<HTMLDivElement>('#app')!;
const styles = getComputedStyle(app);
const figureColor = styles.getPropertyValue('--figure-color');

app.innerHTML = `
  <div class="header">
    <div class="header__logo-container">
      <img class="header__logo" src="${labyrinth}" alt="Labyrinth icon" width="50">
      <h1 class="header__title">Labyrinth</h1>
    </div>
    
    <div class="game__actions">
      <div class="settings">
        <button class="settings__button" popovertarget="settings-popover" title="Настройки">
          <img class="settings__icon" src="${settings}" alt="Settings icon" width="30">
        </button>
        
        <div class="settings__popover" popover id="settings-popover">
          <span>Настройки</span>
          
          <label>
            <input id="checkbox-view-path" type="checkbox" checked>
            Показать путь
          </label>
          
          <label title="Нажми на точку пути">
            <input id="checkbox-fast-movement" type="checkbox" checked>
            Быстрое перемещение
          </label>
        </div>
      </div>
    
      <div class="game__select-container">
        <select class="game__select" id="select" disabled></select>
      </div>
      
      <button class="game__button" id="button" type="button" disabled>Новый лабиринт</button>
    </div>
  </div>
  
  <div class="game">
    <div class="game__canvas-container">
      <svg id="preloader" class="game__preloader" width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="none" stroke="${figureColor}" stroke-width="8" stroke-linecap="round" stroke-dasharray="125.6 125.6">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      
      <canvas id="canvas-background" class="canvas-background"></canvas>
      <canvas id="canvas-path" class="canvas-path"></canvas>
      <canvas id="canvas-point" class="canvas-point"></canvas>
    </div>
    
    <div class="game__arrows">
      <button class="game__button game-button--top" id="top" type="button"><span>↑</span></button>
      <button class="game__button game-button--left" id="left" type="button"><span>←</span></button>
      <button class="game__button game-button--bottom" id="bottom" type="button"><span>↓</span></button>
      <button class="game__button game-button--right" id="right" type="button"><span>→</span></button>
    </div>
  </div>
`;

const canvasBackground = document.querySelector<HTMLCanvasElement>('#canvas-background')!;
const canvasPath = document.querySelector<HTMLCanvasElement>('#canvas-path')!;
const canvasPoint = document.querySelector<HTMLCanvasElement>('#canvas-point')!;
const button = document.querySelector<HTMLButtonElement>('#button')!;
const select = document.querySelector<HTMLSelectElement>('#select')!;
const preloader = document.querySelector<HTMLOrSVGImageElement>('#preloader')!;
const checkboxViewPath = document.querySelector<HTMLInputElement>('#checkbox-view-path')!;
const checkboxFastMovement = document.querySelector<HTMLInputElement>('#checkbox-fast-movement')!;

const top = document.querySelector<HTMLButtonElement>('#top')!;
const left = document.querySelector<HTMLButtonElement>('#left')!;
const bottom = document.querySelector<HTMLButtonElement>('#bottom')!;
const right = document.querySelector<HTMLButtonElement>('#right')!;

// const isTouchDevice = !!('ontouchstart' in window || navigator.maxTouchPoints);

const { drawLabyrinth, redrawLabyrinth, drawPoint } = await setupCanvas({
  canvasBackground,
  canvasPath,
  canvasPoint,
});
setupCheckboxes({
  checkboxViewPath,
  canvasPath,
  checkboxFastMovement,
});
setupButton(button, redrawLabyrinth);
setupSelect(select, redrawLabyrinth);
setupArrows({ top, left, bottom, right, drawPoint });

await drawLabyrinth();
drawPoint();

button.disabled = false;
select.disabled = false;
preloader.style.display = 'none';

// 1 - todo: мб на мобилках ограничить размер клеток
// 2 - todo: добавить стартовую и конечную точки
// 3 - todo: сделать лупу для канваса
// 4 - todo: сделать чтобы работало без интернета
// 5 - todo: скачать картинку лабиринта
// 6 - todo: добавить описание проекта и ссылку на гитхаб в правом верхнем углу
// 7 - todo: быстрое перемещение при клике по точке из пути
// 9 - todo: подсчет времени вкл/выкл

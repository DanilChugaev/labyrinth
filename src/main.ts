import './style.css';
import { setupCanvas } from './elements/canvas.ts';
import { setupButton } from './elements/button.ts';
import { setupSelect } from './elements/select.ts';
import labyrinth from '/labyrinth.svg';

const app = document.querySelector<HTMLDivElement>('#app')!;
const styles = getComputedStyle(app);
const figureColor = styles.getPropertyValue('--figure-color');

app.innerHTML = `
  <div class="header">
    <img class="header__logo" src="${labyrinth}" alt="Labyrinth icon" width="50">
    <h1 class="header__title">Labyrinth</h1>
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
      
      <canvas id="canvas"></canvas>
    </div>
    
    <div class="game__actions">
      <div class="game__select-container">
        <select class="game__select" id="select" disabled></select>
      </div>
      
      <button class="game__button" id="button" type="button" disabled>Новый лабиринт</button>
    </div>
  </div>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
const button = document.querySelector<HTMLButtonElement>('#button')!;
const select = document.querySelector<HTMLSelectElement>('#select')!;
const preloader = document.querySelector<HTMLOrSVGImageElement>('#preloader')!;

const { drawLabyrinth, redrawLabyrinth } = setupCanvas(canvas);
setupButton(button, redrawLabyrinth);
setupSelect(select, redrawLabyrinth);

await drawLabyrinth();

button.disabled = false;
select.disabled = false;
preloader.style.display = 'none';

// 1 - todo: мб на мобилках ограничить размер клеток
// 3 - todo: добавить стрелки для перемещений
// 4 - todo: добавить стартовую и конечную точки
// 5 - todo: добавить перемещение по лабиринту
// 6 - todo: добавить рисование пути перемещения
// 7 - todo: сделать лупу для канваса
// 8 - todo: сделать чтобы работало без интернета
// 9 - todo: скачать картинку лабиринта
// 10 - todo: добавить описание проекта и ссылку на гитхаб в правом верхнем углу

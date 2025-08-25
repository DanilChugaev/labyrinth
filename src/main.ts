import './style.css';
import { setupCanvas } from './canvas.ts';
import { setupButton } from './button.ts';
import { setupSelect } from './select.ts';
import labyrinth from '/labyrinth.svg';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="header">
    <img class="header__logo" src="${labyrinth}" alt="Labyrinth icon" width="50">
    <h1 class="header__title">Labyrinth</h1>
  </div>
  
  <div class="game">
    <canvas id="canvas"></canvas>
    
    <div class="game__actions">
      <div class="game__select-container">
        <select class="game__select" id="select"></select>
      </div>
      
      <button class="game__button" id="button" type="button">Новый лабиринт</button>
    </div>
  </div>
`;

const { drawLabyrinth, redrawLabyrinth } = setupCanvas(
  document.querySelector<HTMLCanvasElement>('#canvas')!,
);
setupButton(document.querySelector<HTMLButtonElement>('#button')!, redrawLabyrinth);
setupSelect(document.querySelector<HTMLSelectElement>('#select')!, redrawLabyrinth);

drawLabyrinth();

// 1 - todo: оптимизировать код генерации лабиринта (мб на мобилках ограничить размер клеток)
// 2 - todo: добавить какой-то лоадер, чтобы при выборе большого размера страница не висла
// 3 - todo: добавить стрелки для перемещений
// 4 - todo: добавить стартовую и конечную точки
// 5 - todo: добавить перемещение по лабиринту
// 6 - todo: добавить рисование пути перемещения
// 7 - todo: сделать лупу для канваса
// 8 - todo: сделать чтобы работало без интернета
// 9 - todo: скачать картинку лабиринта
// 10 - todo: сделать обновление лабиринта через перерисовку, а не обновление страницы
// 11 - todo: добавить описание проекта и ссылку на гитхаб в правом верхнем углу

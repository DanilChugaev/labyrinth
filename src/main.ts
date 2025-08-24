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
      <button class="game__button" id="button" type="button">Новый лабиринт</button>
      
      <div class="game__select-container">
        <select class="game__select" id="select"></select>
      </div>
    </div>
  </div>
`

const { drawLabyrinth, redrawLabyrinth } = setupCanvas(document.querySelector<HTMLCanvasElement>('#canvas')!);
setupButton(document.querySelector<HTMLButtonElement>('#button')!, redrawLabyrinth);
setupSelect(document.querySelector<HTMLSelectElement>('#select')!, redrawLabyrinth);

drawLabyrinth();

// todo: сделать лупу для канваса
// todo: добавить стрелки для мобилки (мб просто переключалку, которая включит стрелки и автоматом будет включена)
// todo: добавить описание проекта и ссылку на гитхаб в правом верхнем углу
// todo: добавить какой-то лоадер, чтобы при выборе большого размера страница не висла
// todo: мб на мобилках ограничить размер
// todo: оптимизировать код генерации лабиринта
// todo: добавить стартовую и конечную точки и добавить перемещение по лабиринту
// todo: добавить рисование пути перемещения
// todo: установить eslint
// todo: сделать чтобы работало без интернета
// todo: скачать картинку лабиринта
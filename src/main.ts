import './style.css';
import { setupCanvas } from './canvas.ts';
import { setupButton } from './button.ts';
import { setupSelect } from './select.ts';
import labyrinth from '/labyrinth.svg';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="header">
    <img class="logo" src="${labyrinth}" alt="Labyrinth icon" width="50">
    <h1>Labyrinth</h1>
  </div>
  
  <div class="game-container">
    <div class="select-container">
      <select id="select"></select>
    </div>
    
    <canvas id="canvas"></canvas>
    
    <button id="button" type="button">Новый лабиринт</button>
  </div>
`

const { drawLabyrinth, redrawLabyrinth } = setupCanvas(document.querySelector<HTMLCanvasElement>('#canvas')!);
setupButton(document.querySelector<HTMLButtonElement>('#button')!, redrawLabyrinth);
setupSelect(document.querySelector<HTMLSelectElement>('#select')!, redrawLabyrinth);

drawLabyrinth();

// todo: сделать лупу для канваса
// todo: добавить стрелки для мобилки (мб просто переключалку, которая включит стрелки и автоматом будет включена)
// todo: доработать визуал для темной и светлой темы, мб переключалку темы сделать
// todo: добавить описание проекта и ссылку на гитхаб в правом верхнем углу
// todo: добавить какой-то лоадер, чтобы при выборе большого размера страница не висла
// todo: мб на мобилках ограничить размер
// todo: оптимизировать код генерации лабиринта
// todo: добавить стартовую и конечную точки и добавить перемещение по лабиринту
// todo: добавить рисование пути перемещения
// todo: установить eslint
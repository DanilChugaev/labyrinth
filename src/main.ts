import './style.css';
import { setupCanvas } from './canvas.ts';
import { setupButton } from './button.ts';
import labyrinth from '/labyrinth.svg';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="header">
    <img class="logo" src="${labyrinth}" alt="Labyrinth icon" width="50">
    <h1>Labyrinth</h1>
  </div>
  
  <canvas id="canvas"></canvas>
  
  <button id="button" type="button">Новый лабиринт</button>
`

const { redrawLabyrinth } = setupCanvas(document.querySelector<HTMLCanvasElement>('#canvas')!);
setupButton(document.querySelector<HTMLButtonElement>('#button')!, redrawLabyrinth);

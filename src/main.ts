import './style.css'
import { setupCanvas } from './canvas.ts'
import labyrinth from '/labyrinth.svg'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="header">
    <img class="logo" src="${labyrinth}" alt="Labyrinth icon" width="50">
    <h1>Labyrinth</h1>
  </div>
  
  <canvas id="canvas"></canvas>
`

setupCanvas(document.querySelector<HTMLCanvasElement>('#canvas')!)

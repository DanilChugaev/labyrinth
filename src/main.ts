import './style.css'
import { setupCounter } from './counter.ts'
import { getArr } from './generator.ts'
import labyrinth from '/labyrinth.svg'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <img class="logo" src="${labyrinth}" alt="Labyrinth icon" width="100">
    <h1>Labyrinth</h1>
    <pre>${getArr()}</pre>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

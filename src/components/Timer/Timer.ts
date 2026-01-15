import './timer.css';
import { getTimer, loadBooleanStorageValue, saveTimer } from '../../utils/storage.ts';
import { TIMER_KEY } from '../../constants.ts';

const currentTimeId = 'current-time-id';
const bestTimeId = 'best-time-id';

let counter = 0;
let intervalId: number;

export function Timer(timerContainerId: string) {
  const isView = loadBooleanStorageValue(TIMER_KEY, true);
  const style = isView ? 'display: flex' : 'display: none';

  return `<div id="${timerContainerId}" style="${style}" class="timer">
            <div class="timer__container">
              <div>Текущее время</div>
              <div id="${currentTimeId}">00:00</div>
            </div>
            
            <div class="timer__container">
              <div>Лучшее время</div>
              <div id="${bestTimeId}">00:00</div>
            </div>
          </div>`;
}

export function timerStart() {
  const currentTimeEl = document.querySelector<HTMLDivElement>(`#${currentTimeId}`)!;
  const oldTimeEl = document.querySelector<HTMLDivElement>(`#${bestTimeId}`)!;

  const oldTime = getTimer();

  oldTimeEl.innerHTML = formatTime(oldTime);

  intervalId = setInterval(() => {
    counter++;

    currentTimeEl.innerHTML = formatTime(counter);
  }, 1000);
}

export function timerStop() {
  clearInterval(intervalId);
  saveTimer(counter);
}

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
}

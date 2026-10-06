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
            <span id="${currentTimeId}" title="Текущее время">00:00</span>
            <span> / </span>
            <span id="${bestTimeId}" title="Лучшее время">00:00</span>
          </div>`;
}

export function timerStart(initialSeconds = 0): void {
  const currentTimeEl = document.querySelector<HTMLSpanElement>(`#${currentTimeId}`)!;
  const oldTimeEl = document.querySelector<HTMLSpanElement>(`#${bestTimeId}`)!;

  clearInterval(intervalId);
  counter = initialSeconds;
  const oldTime = getTimer();

  oldTimeEl.textContent = formatTime(oldTime);
  currentTimeEl.textContent = formatTime(counter);

  intervalId = setInterval(() => {
    counter++;

    currentTimeEl.textContent = formatTime(counter);
  }, 1000);
}

export function timerStop(shouldSave = true): number {
  clearInterval(intervalId);

  if (shouldSave) saveTimer(counter);

  return counter;
}

export function getCurrentTimerValue(): number {
  return counter;
}

export function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
}

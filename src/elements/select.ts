import { getLabyrinthSize, setLabyrinthSize } from '../utils/storage.ts';
import {
  JUNIOR_MAX_CANVAS_SIZE,
  JUNIOR_MIN_CANVAS_SIZE,
  JUNIOR_STEP_CANVAS_SIZE,
  MAX_CANVAS_SIZE,
  MIN_CANVAS_SIZE,
  STEP_CANVAS_SIZE,
} from '../constants.ts';

export function setupSelect(element: HTMLSelectElement, onChangeSelectionFn: () => void) {
  for (let i = JUNIOR_MIN_CANVAS_SIZE; i <= JUNIOR_MAX_CANVAS_SIZE; i += JUNIOR_STEP_CANVAS_SIZE) {
    const option = document.createElement('option');
    option.value = i.toString();
    option.textContent = i.toString();
    element.appendChild(option);
  }

  for (let i = MIN_CANVAS_SIZE; i <= MAX_CANVAS_SIZE; i += STEP_CANVAS_SIZE) {
    const option = document.createElement('option');
    option.value = i.toString();
    option.textContent = i.toString();
    element.appendChild(option);
  }

  element.value = getLabyrinthSize();

  element.addEventListener('change', (event: Event) => {
    if (event.target instanceof HTMLSelectElement) {
      setLabyrinthSize(Number(event.target.value));
      onChangeSelectionFn();
    }
  });
}

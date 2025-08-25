import { getLabyrinthSize, setLabyrinthSize } from './storage.ts';

export function setupSelect(element: HTMLSelectElement, onChangeSelectionFn: () => void) {
  for (let i = 5; i <= 100; i += 5) {
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
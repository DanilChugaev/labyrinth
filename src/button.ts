export function setupButton(element: HTMLButtonElement, onClickButtonFn: () => void) {
  element.addEventListener('click', onClickButtonFn);
}
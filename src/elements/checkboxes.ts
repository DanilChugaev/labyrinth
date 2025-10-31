import { FAST_MOVEMENT_KEY, VIEW_PATH_KEY } from '../constants.ts';

export function setupCheckboxes({
  checkboxViewPath,
  canvasPath,
  checkboxFastMovement,
}: {
  checkboxViewPath: HTMLInputElement;
  canvasPath: HTMLCanvasElement;
  checkboxFastMovement: HTMLInputElement;
}) {
  checkboxViewPath.checked = loadBool(VIEW_PATH_KEY, true);
  checkboxFastMovement.checked = loadBool(FAST_MOVEMENT_KEY, true);
  checkboxFastMovement.disabled = !checkboxViewPath.checked;

  changeDisplay(canvasPath, checkboxViewPath.checked);

  checkboxViewPath.onchange = () => {
    const checked = checkboxViewPath.checked;

    changeDisplay(canvasPath, checked);

    localStorage.setItem(VIEW_PATH_KEY, checked.toString());
    checkboxFastMovement.disabled = !checked;
    checkboxFastMovement.checked = checked;
    localStorage.setItem(FAST_MOVEMENT_KEY, checkboxFastMovement.checked.toString());
  };

  checkboxFastMovement.onchange = () => {
    localStorage.setItem(FAST_MOVEMENT_KEY, checkboxFastMovement.checked.toString());
  };
}

function loadBool(key: string, defaultValue: boolean): boolean {
  const stored = localStorage.getItem(key);
  return stored === null ? defaultValue : stored === 'true';
}

function changeDisplay(element: HTMLElement, condition: boolean) {
  element.style.display = condition ? 'block' : 'none';
}

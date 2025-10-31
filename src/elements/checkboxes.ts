import { FAST_MOVEMENT_KEY, VIEW_PATH_KEY } from '../constants.ts';
import { loadBooleanStorageValue, saveStorageValue } from '../utils/storage.ts';

export function setupCheckboxes({
  checkboxViewPath,
  canvasPath,
  checkboxFastMovement,
}: {
  checkboxViewPath: HTMLInputElement;
  canvasPath: HTMLCanvasElement;
  checkboxFastMovement: HTMLInputElement;
}) {
  checkboxViewPath.checked = loadBooleanStorageValue(VIEW_PATH_KEY, true);
  checkboxFastMovement.checked = loadBooleanStorageValue(FAST_MOVEMENT_KEY, true);
  checkboxFastMovement.disabled = !checkboxViewPath.checked;

  changeDisplay(canvasPath, checkboxViewPath.checked);

  checkboxViewPath.onchange = () => {
    const checked = checkboxViewPath.checked;

    changeDisplay(canvasPath, checked);

    saveStorageValue(VIEW_PATH_KEY, checked.toString());
    checkboxFastMovement.disabled = !checked;
    checkboxFastMovement.checked = checked;
    saveStorageValue(FAST_MOVEMENT_KEY, checkboxFastMovement.checked.toString());
  };

  checkboxFastMovement.onchange = () => {
    saveStorageValue(FAST_MOVEMENT_KEY, checkboxFastMovement.checked.toString());
  };
}

function changeDisplay(element: HTMLElement, condition: boolean) {
  element.style.display = condition ? 'block' : 'none';
}

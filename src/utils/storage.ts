import { DEFAULT_CANVAS_SIZE, LABYRINTH_SIZE_KEY } from '../constants.ts';

export function saveStorageValue(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function getStorageValue(key: string) {
  return localStorage.getItem(key);
}

export function getLabyrinthSize(): string {
  return getStorageValue(LABYRINTH_SIZE_KEY) ?? DEFAULT_CANVAS_SIZE.toString();
}

export function setLabyrinthSize(size: number) {
  saveStorageValue(LABYRINTH_SIZE_KEY, String(size || DEFAULT_CANVAS_SIZE));
}

export function loadBooleanStorageValue(key: string, defaultValue: boolean): boolean {
  const stored = getStorageValue(key);
  return stored === null ? defaultValue : stored === 'true';
}

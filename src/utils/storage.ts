import { DEFAULT_CANVAS_SIZE } from './constants.ts';

export function getLabyrinthSize(): string {
  return localStorage.getItem('labyrinth-size') ?? DEFAULT_CANVAS_SIZE.toString();
}

export function setLabyrinthSize(size: number) {
  localStorage.setItem('labyrinth-size', String(size || DEFAULT_CANVAS_SIZE));
}

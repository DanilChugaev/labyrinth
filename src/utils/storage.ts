import {
  DEFAULT_CANVAS_SIZE,
  DEFAULT_TIMER_VALUE,
  GAME_STATE_KEY,
  LABYRINTH_SIZE_KEY,
  TIMER_VALUE_KEY,
} from '../constants.ts';
import type { GameState } from '../types.ts';

export function saveStorageValue<T extends string>(key: string, value: T) {
  localStorage.setItem(key, value);
}

export function getStorageValue(key: string) {
  return localStorage.getItem(key);
}

/** --- Размер лабиринта --- **/
export function getLabyrinthSize(): string {
  return getStorageValue(LABYRINTH_SIZE_KEY) ?? DEFAULT_CANVAS_SIZE.toString();
}

export function setLabyrinthSize(size: number) {
  saveStorageValue(LABYRINTH_SIZE_KEY, String(size || DEFAULT_CANVAS_SIZE));
}
/** ------------------------ **/

/** --- Булевы значения --- **/
export function loadBooleanStorageValue(key: string, defaultValue: boolean): boolean {
  const stored = getStorageValue(key);
  return stored === null ? defaultValue : stored === 'true';
}
/** ----------------------- **/

/** --- Состояния игры --- **/
export function checkGameState(gameState: GameState): boolean {
  return getStorageValue(GAME_STATE_KEY) === gameState;
}

export function gameStart() {
  saveStorageValue<GameState>(GAME_STATE_KEY, 'play');
}

export function gameStop() {
  saveStorageValue<GameState>(GAME_STATE_KEY, 'win');
}
/** ---------------------- **/

function getTimers() {
  const size = getLabyrinthSize();
  const timers = JSON.parse(getStorageValue(TIMER_VALUE_KEY) ?? '{}');

  return {
    size,
    timers,
  };
}

export function saveTimer(value: number) {
  const { size, timers } = getTimers();

  if (!timers[size] || timers[size] > value) {
    timers[size] = value;
    saveStorageValue(TIMER_VALUE_KEY, JSON.stringify(timers));
  }
}

export function getTimer() {
  const { size, timers } = getTimers();

  return timers[size] ?? DEFAULT_TIMER_VALUE;
}

import {
  DEFAULT_CANVAS_SIZE,
  DEFAULT_TIMER_VALUE,
  GAME_STATE_KEY,
  JUNIOR_MAX_CANVAS_SIZE,
  JUNIOR_MIN_CANVAS_SIZE,
  JUNIOR_STEP_CANVAS_SIZE,
  LABYRINTH_SIZE_KEY,
  MAX_CANVAS_SIZE,
  MIN_CANVAS_SIZE,
  STEP_CANVAS_SIZE,
  TIMER_VALUE_KEY,
} from '../constants.ts';
import type { GameState } from '../types.ts';

type TimerRecords = Record<string, number>;

export function saveStorageValue(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage may be unavailable, for example in a private browsing context.
  }
}

export function getStorageValue(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function removeStorageValue(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // The default value is used when storage cannot be modified.
  }
}

/** --- Размер лабиринта --- **/
export function getLabyrinthSize(): string {
  const storedSize = Number(getStorageValue(LABYRINTH_SIZE_KEY));

  if (isValidLabyrinthSize(storedSize)) return String(storedSize);

  if (getStorageValue(LABYRINTH_SIZE_KEY) !== null) removeStorageValue(LABYRINTH_SIZE_KEY);

  return String(DEFAULT_CANVAS_SIZE);
}

export function setLabyrinthSize(size: number): void {
  saveStorageValue(
    LABYRINTH_SIZE_KEY,
    String(isValidLabyrinthSize(size) ? size : DEFAULT_CANVAS_SIZE),
  );
}

export function isValidLabyrinthSize(size: number): boolean {
  const isJuniorSize =
    size >= JUNIOR_MIN_CANVAS_SIZE &&
    size <= JUNIOR_MAX_CANVAS_SIZE &&
    (size - JUNIOR_MIN_CANVAS_SIZE) % JUNIOR_STEP_CANVAS_SIZE === 0;
  const isRegularSize =
    size >= MIN_CANVAS_SIZE &&
    size <= MAX_CANVAS_SIZE &&
    (size - MIN_CANVAS_SIZE) % STEP_CANVAS_SIZE === 0;

  return Number.isInteger(size) && (isJuniorSize || isRegularSize);
}
/** ------------------------ **/

/** --- Булевы значения --- **/
export function loadBooleanStorageValue(key: string, defaultValue: boolean): boolean {
  const stored = getStorageValue(key);

  if (stored === null) return defaultValue;
  if (stored === 'true') return true;
  if (stored === 'false') return false;

  removeStorageValue(key);
  return defaultValue;
}
/** ----------------------- **/

/** --- Состояния игры --- **/
export function checkGameState(gameState: GameState): boolean {
  return getStorageValue(GAME_STATE_KEY) === gameState;
}

export function gameStart() {
  saveStorageValue(GAME_STATE_KEY, 'play');
}

export function gameStop() {
  saveStorageValue(GAME_STATE_KEY, 'win');
}
/** ---------------------- **/

function getTimers(): { size: string; timers: TimerRecords } {
  const size = getLabyrinthSize();
  const timers = parseTimerRecords(getStorageValue(TIMER_VALUE_KEY));

  return {
    size,
    timers,
  };
}

function parseTimerRecords(value: string | null): TimerRecords {
  if (value === null) return {};

  try {
    const parsed: unknown = JSON.parse(value);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      removeStorageValue(TIMER_VALUE_KEY);
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([size, time]) => isValidLabyrinthSize(Number(size)) && isValidTimerValue(time),
      ),
    );
  } catch {
    removeStorageValue(TIMER_VALUE_KEY);
    return {};
  }
}

function isValidTimerValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function saveTimer(value: number): void {
  if (!isValidTimerValue(value)) return;

  const { size, timers } = getTimers();

  if (timers[size] === undefined || timers[size] > value) {
    timers[size] = value;
    saveStorageValue(TIMER_VALUE_KEY, JSON.stringify(timers));
  }
}

export function getTimer(): number {
  const { size, timers } = getTimers();

  return isValidTimerValue(timers[size]) ? timers[size] : DEFAULT_TIMER_VALUE;
}

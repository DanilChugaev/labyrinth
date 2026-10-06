import type { ViewportSnapshot } from './Viewport.ts';
import {
  decodeUint8Array,
  decodeUint32Array,
  encodeUint8Array,
  encodeUint32Array,
} from '../utils/binaryStorage.ts';
import { ACTIVE_GAME_KEY } from '../constants.ts';
import {
  getStorageValue,
  isValidLabyrinthSize,
  removeStorageValue,
  saveStorageValue,
} from '../utils/storage.ts';

const SAVED_GAME_VERSION = 1;

interface StoredGame {
  version: number;
  size: number;
  structure: string;
  player: { x: number; y: number };
  path: string;
  viewport: ViewportSnapshot;
  elapsedSeconds: number;
  savedAt: number;
}

export interface RestoredGame {
  size: number;
  structure: Uint8Array;
  playerX: number;
  playerY: number;
  pathBuffer: Map<number, Set<number>>;
  viewport: ViewportSnapshot;
  elapsedSeconds: number;
}

export type ActiveGameSnapshot = RestoredGame;

export function saveActiveGame(snapshot: ActiveGameSnapshot): void {
  const storedGame: StoredGame = {
    version: SAVED_GAME_VERSION,
    size: snapshot.size,
    structure: encodeUint8Array(snapshot.structure),
    player: { x: snapshot.playerX, y: snapshot.playerY },
    path: encodeUint32Array(pathBufferToIndexes(snapshot.pathBuffer, snapshot.size)),
    viewport: snapshot.viewport,
    elapsedSeconds: snapshot.elapsedSeconds,
    savedAt: Date.now(),
  };

  saveStorageValue(ACTIVE_GAME_KEY, JSON.stringify(storedGame));
}

export function loadActiveGame(): RestoredGame | null {
  const storedValue = getStorageValue(ACTIVE_GAME_KEY);
  if (storedValue === null) return null;

  try {
    const restoredGame = parseStoredGame(JSON.parse(storedValue) as unknown);

    if (restoredGame) return restoredGame;
  } catch {
    // The invalid save is removed below.
  }

  clearActiveGame();
  return null;
}

export function clearActiveGame(): void {
  removeStorageValue(ACTIVE_GAME_KEY);
}

function parseStoredGame(value: unknown): RestoredGame | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const game = value as Partial<StoredGame>;
  if (game.version !== SAVED_GAME_VERSION || typeof game.size !== 'number') return null;
  const size = game.size;
  if (!isValidLabyrinthSize(size)) return null;
  if (!isValidPlayer(game.player, size) || !isValidViewport(game.viewport)) return null;
  if (
    !isValidElapsedTime(game.elapsedSeconds) ||
    typeof game.structure !== 'string' ||
    typeof game.path !== 'string'
  ) {
    return null;
  }

  const structure = decodeUint8Array(game.structure);
  const pathIndexes = decodeUint32Array(game.path);
  if (!structure || !pathIndexes || structure.length !== size * size) return null;
  if ([...structure].some(border => border > 0b1111)) return null;

  const pathBuffer = indexesToPathBuffer(pathIndexes, size);
  if (!pathBuffer) return null;

  return {
    size,
    structure,
    playerX: game.player.x,
    playerY: game.player.y,
    pathBuffer,
    viewport: game.viewport,
    elapsedSeconds: game.elapsedSeconds,
  };
}

function pathBufferToIndexes(pathBuffer: Map<number, Set<number>>, size: number): Uint32Array {
  const indexes: number[] = [];

  pathBuffer.forEach((columns, y) => {
    columns.forEach(x => indexes.push(y * size + x));
  });

  return new Uint32Array(indexes);
}

function indexesToPathBuffer(indexes: Uint32Array, size: number): Map<number, Set<number>> | null {
  if (indexes.length > size * size) return null;

  const pathBuffer = new Map<number, Set<number>>();

  for (const index of indexes) {
    if (index >= size * size) return null;

    const y = Math.floor(index / size);
    const x = index % size;
    const row = pathBuffer.get(y) ?? new Set<number>();
    row.add(x);
    pathBuffer.set(y, row);
  }

  return pathBuffer;
}

function isValidPlayer(value: unknown, size: number): value is { x: number; y: number } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  const player = value as { x?: unknown; y?: unknown };
  return (
    Number.isInteger(player.x) &&
    Number.isInteger(player.y) &&
    (player.x as number) >= 0 &&
    (player.x as number) < size &&
    (player.y as number) >= 0 &&
    (player.y as number) < size
  );
}

function isValidViewport(value: unknown): value is ViewportSnapshot {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  const viewport = value as Partial<ViewportSnapshot>;
  return (
    Number.isFinite(viewport.zoom) &&
    (viewport.zoom ?? 0) >= 1 &&
    (viewport.zoom ?? Infinity) <= 16 &&
    Number.isFinite(viewport.centerX) &&
    Number.isFinite(viewport.centerY)
  );
}

function isValidElapsedTime(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

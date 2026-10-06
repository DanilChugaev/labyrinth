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

const SAVED_GAME_VERSION = 2;

interface StoredGameV1 {
  version: 1;
  size: number;
  structure: string;
  player: { x: number; y: number };
  path: string;
  viewport: ViewportSnapshot;
  elapsedSeconds: number;
  savedAt: number;
}

interface StoredGameV2 extends Omit<StoredGameV1, 'version'> {
  version: 2;
  stats: {
    moves: number | null;
    visited: string;
    shortestPathLength: number | null;
  };
}

export interface RestoredGame {
  size: number;
  structure: Uint8Array;
  playerX: number;
  playerY: number;
  pathBuffer: Map<number, Set<number>>;
  viewport: ViewportSnapshot;
  elapsedSeconds: number;
  moves: number | null;
  visitedCells: Set<number>;
  shortestPathLength: number | null;
}

export type ActiveGameSnapshot = RestoredGame;

export function saveActiveGame(snapshot: ActiveGameSnapshot): void {
  const storedGame: StoredGameV2 = {
    version: SAVED_GAME_VERSION,
    size: snapshot.size,
    structure: encodeUint8Array(snapshot.structure),
    player: { x: snapshot.playerX, y: snapshot.playerY },
    path: encodeUint32Array(pathBufferToIndexes(snapshot.pathBuffer, snapshot.size)),
    viewport: snapshot.viewport,
    elapsedSeconds: snapshot.elapsedSeconds,
    savedAt: Date.now(),
    stats: {
      moves: snapshot.moves,
      visited: encodeUint32Array(new Uint32Array(snapshot.visitedCells)),
      shortestPathLength: snapshot.shortestPathLength,
    },
  };

  saveStorageValue(ACTIVE_GAME_KEY, JSON.stringify(storedGame));
}

export function loadActiveGame(): RestoredGame | null {
  const storedValue = getStorageValue(ACTIVE_GAME_KEY);
  if (storedValue === null) return null;

  try {
    const restoredGame = parseStoredGame(migrateStoredGame(JSON.parse(storedValue) as unknown));

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

function migrateStoredGame(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const game = value as Partial<StoredGameV1 | StoredGameV2>;
  if (game.version !== 1) return value;
  if (
    typeof game.size !== 'number' ||
    typeof game.structure !== 'string' ||
    !game.player ||
    typeof game.path !== 'string' ||
    !game.viewport ||
    typeof game.elapsedSeconds !== 'number' ||
    typeof game.savedAt !== 'number'
  ) {
    return null;
  }

  return {
    ...game,
    version: SAVED_GAME_VERSION,
    stats: {
      moves: null,
      visited: game.path,
      shortestPathLength: null,
    },
  };
}

function parseStoredGame(value: unknown): RestoredGame | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const game = value as Partial<StoredGameV2>;
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
  const visitedIndexes =
    typeof game.stats?.visited === 'string' ? decodeUint32Array(game.stats.visited) : null;
  if (!structure || !pathIndexes || !visitedIndexes || structure.length !== size * size) {
    return null;
  }
  if ([...structure].some(border => border > 0b1111)) return null;

  const pathBuffer = indexesToPathBuffer(pathIndexes, size);
  const visitedCells = indexesToSet(visitedIndexes, size);
  if (!pathBuffer || !visitedCells || !isValidStats(game.stats)) return null;

  return {
    size,
    structure,
    playerX: game.player.x,
    playerY: game.player.y,
    pathBuffer,
    viewport: game.viewport,
    elapsedSeconds: game.elapsedSeconds,
    moves: game.stats.moves,
    visitedCells,
    shortestPathLength: game.stats.shortestPathLength,
  };
}

function indexesToSet(indexes: Uint32Array, size: number): Set<number> | null {
  if (indexes.length > size * size) return null;

  const cells = new Set<number>();
  for (const index of indexes) {
    if (index >= size * size) return null;
    cells.add(index);
  }

  return cells;
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

function isValidStats(value: unknown): value is StoredGameV2['stats'] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  const stats = value as { moves?: unknown; shortestPathLength?: unknown };
  return (
    (stats.moves === null || (Number.isInteger(stats.moves) && (stats.moves as number) >= 0)) &&
    (stats.shortestPathLength === null ||
      (Number.isInteger(stats.shortestPathLength) && (stats.shortestPathLength as number) >= 0))
  );
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

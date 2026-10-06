export interface GameStats {
  moves: number | null;
  visitedCells: Set<number>;
  shortestPathLength: number | null;
}

export function createGameStats(shortestPathLength: number | null = null): GameStats {
  return {
    moves: 0,
    visitedCells: new Set([0]),
    shortestPathLength,
  };
}

export function getExplorationPercent(stats: GameStats, totalCells: number): number {
  return Math.round((stats.visitedCells.size / totalCells) * 100);
}

export function getEfficiency(stats: GameStats): number | null {
  if (!stats.moves || stats.shortestPathLength === null) return null;

  return Math.min(100, Math.round((stats.shortestPathLength / stats.moves) * 100));
}

import { describe, expect, it } from 'vitest';
import { createGameStats, getEfficiency, getExplorationPercent } from './gameStats.ts';

describe('gameStats', () => {
  describe('createGameStats', () => {
    it('должен создать статистику со стартовой клеткой', () => {
      const stats = createGameStats(12);

      expect(stats.moves).toBe(0);
      expect(stats.visitedCells).toEqual(new Set([0]));
      expect(stats.shortestPathLength).toBe(12);
    });
  });

  describe('getExplorationPercent', () => {
    it('должен вернуть процент исследованных клеток', () => {
      const stats = createGameStats();
      stats.visitedCells.add(1);
      stats.visitedCells.add(2);

      expect(getExplorationPercent(stats, 10)).toBe(30);
    });

    it('должен округлить процент до целого', () => {
      const stats = createGameStats();
      stats.visitedCells.add(1);

      expect(getExplorationPercent(stats, 3)).toBe(67);
    });
  });

  describe('getEfficiency', () => {
    it('должен вернуть 100% для оптимального маршрута', () => {
      const stats = createGameStats(20);
      stats.moves = 20;

      expect(getEfficiency(stats)).toBe(100);
    });

    it('должен рассчитать эффективность маршрута с лишними ходами', () => {
      const stats = createGameStats(50);
      stats.moves = 80;

      expect(getEfficiency(stats)).toBe(63);
    });

    it('должен вернуть null, если ходы или кратчайший путь неизвестны', () => {
      const stats = createGameStats();
      stats.moves = null;

      expect(getEfficiency(stats)).toBeNull();

      stats.moves = 10;
      expect(getEfficiency(stats)).toBeNull();
    });
  });
});

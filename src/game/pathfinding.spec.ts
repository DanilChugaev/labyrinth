import { describe, expect, it } from 'vitest';
import { findShortestPathLength } from './pathfinding.ts';

describe('findShortestPathLength', () => {
  it('должен вернуть 0 для лабиринта 1 × 1', () => {
    expect(findShortestPathLength(new Uint8Array([0b1111]), 1)).toBe(0);
  });

  it('должен найти кратчайший путь в лабиринте с единственным маршрутом', () => {
    const structure = new Uint8Array([0b1101, 0b1011, 0b0101, 0b0111]);

    expect(findShortestPathLength(structure, 2)).toBe(2);
  });

  it('должен вернуть null для лабиринта с неправильной длиной структуры', () => {
    expect(findShortestPathLength(new Uint8Array([0b1111]), 2)).toBeNull();
  });

  it('должен вернуть null, если цель недостижима', () => {
    const structure = new Uint8Array([0b1111, 0b1111, 0b1111, 0b1111]);

    expect(findShortestPathLength(structure, 2)).toBeNull();
  });
});

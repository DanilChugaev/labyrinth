import type { Labyrinth } from './types.ts';
import { UniqueRandomNumberGenerator } from './UniqueRandomNumberGenerator.ts';

function setXNeighbours(obj: Labyrinth, y: number, x: number, xCoord: number) {
  if (!obj[y][x].neighbours[y]) {
    obj[y][x].neighbours[y] = {}
  }

  obj[y][x].neighbours[y][xCoord] = {
    y,
    x: xCoord,
    weight: obj[y][xCoord].weight,
    neighbours: {}, // это тут не нужно, надо типизацию поправить
  }
}

function setYNeighbours(obj: Labyrinth, y: number, x: number, yCoord: number) {
  if (!obj[y][x].neighbours[yCoord]) {
    obj[y][x].neighbours[yCoord] = {}
  }

  obj[y][x].neighbours[yCoord][x] = {
    y: yCoord,
    x,
    weight: obj[yCoord][x].weight,
    neighbours: {}, // это тут не нужно, надо типизацию поправить
  }
}

export function generateLabyrinth(size: number): Labyrinth {
  const length = size*size
  const generator = new UniqueRandomNumberGenerator(1, length * 2)

  const obj: Labyrinth = {}

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!obj[y]) {
        obj[y] = {};
      }

      obj[y][x] = {
        y,
        x,
        weight: generator.getRandomNumber(),
        neighbours: {},
      };
    }
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const top = y - 1;
      const right = x + 1;
      const bottom = y + 1;
      const left = x - 1;

      if (top >= 0) {
        setYNeighbours(obj, y, x, top)
      }

      if (right < size) {
        setXNeighbours(obj, y, x, right)
      }

      if (bottom < size) {
        setYNeighbours(obj, y, x, bottom)
      }

      if (left >= 0) {
        setXNeighbours(obj, y, x, left)
      }
    }
  }

  console.log(obj)

  return obj
}
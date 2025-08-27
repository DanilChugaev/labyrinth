import type { Labyrinth, NeighbourGeneratorParams } from './types.ts';
import { UniqueRandomNumberGenerator } from './utils/UniqueRandomNumberGenerator.ts';
import { getSides } from './utils/getSides.ts';
import { runWorker } from './worker/runWorker.ts';

function generateBaseStructure(obj: Labyrinth, size: number) {
  const length = size * size;
  const generator = new UniqueRandomNumberGenerator(1, length * 3);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!obj[y]) {
        obj[y] = {};
      }

      if (!obj[y][x]) {
        obj[y][x] = {
          y,
          x,
          weight: generator.getRandomNumber(),
          neighbours: {},
          isVisited: false,
          borders: {
            top: true,
            right: true,
            bottom: true,
            left: true,
          },
        };
      }

      generateNeighbours({ obj, y, x, size, generator });
    }
  }
}

function generateNeighbours({
  obj,
  y,
  x,
  size,
  generator,
}: NeighbourGeneratorParams & { size: number }) {
  const { top, right, bottom, left } = getSides(y, x);

  if (top >= 0) {
    generateYNeighbour({ obj, y, x, yCoord: top, generator });
  }

  if (right < size) {
    generateXNeighbour({ obj, y, x, xCoord: right, generator });
  }

  if (bottom < size) {
    generateYNeighbour({ obj, y, x, yCoord: bottom, generator });
  }

  if (left >= 0) {
    generateXNeighbour({ obj, y, x, xCoord: left, generator });
  }
}

function generateXNeighbour({
  obj,
  y,
  x,
  xCoord,
  generator,
}: NeighbourGeneratorParams & { xCoord: number }) {
  if (!obj[y][xCoord]) {
    // сразу создаем соседа по X координате
    obj[y][xCoord] = {
      y,
      x: xCoord,
      weight: generator.getRandomNumber(),
      neighbours: {},
      isVisited: false,
      borders: {
        top: true,
        right: true,
        bottom: true,
        left: true,
      },
    };
  }

  if (!obj[y][x].neighbours![y]) {
    obj[y][x].neighbours![y] = {};
  }

  obj[y][x].neighbours![y][xCoord] = {
    y,
    x: xCoord,
    weight: obj[y][xCoord].weight,
    isVisited: false,
  };
}

function generateYNeighbour({
  obj,
  y,
  x,
  yCoord,
  generator,
}: NeighbourGeneratorParams & { yCoord: number }) {
  if (!obj[yCoord]) {
    obj[yCoord] = {};
  }

  if (!obj[yCoord][x]) {
    // сразу создаем соседа по Y координате
    obj[yCoord][x] = {
      y: yCoord,
      x,
      weight: generator.getRandomNumber(),
      neighbours: {},
      isVisited: false,
      borders: {
        top: true,
        right: true,
        bottom: true,
        left: true,
      },
    };
  }

  if (!obj[y][x].neighbours![yCoord]) {
    obj[y][x].neighbours![yCoord] = {};
  }

  obj[y][x].neighbours![yCoord][x] = {
    y: yCoord,
    x,
    weight: obj[yCoord][x].weight,
    isVisited: false,
  };
}

export async function generateLabyrinth(size: number): Promise<Labyrinth> {
  let obj: Labyrinth = {};

  const start = performance.now();
  generateBaseStructure(obj, size);
  const end = performance.now();
  console.log(`Время generateBaseStructure: ${end - start} мс`);

  const start2 = performance.now();
  const worker = new Worker('src/worker/worker.ts', { type: 'module' });

  obj = await runWorker<Labyrinth, Labyrinth>(worker, { obj, size } as {
    obj: Labyrinth;
    size: number;
  });

  const end2 = performance.now();
  console.log(`Время createBorders: ${end2 - start2} мс`);

  return obj;
}

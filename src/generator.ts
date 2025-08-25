import type { Border, Cell, Labyrinth, NeighbourGeneratorParams } from './types.ts';
import { UniqueRandomNumberGenerator } from './UniqueRandomNumberGenerator.ts';

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
  const top = y - 1;
  const right = x + 1;
  const bottom = y + 1;
  const left = x - 1;

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

function createBorders(obj: Labyrinth): Labyrinth {
  const unvisited: Labyrinth = obj;
  const visited: Labyrinth = {};

  // для простоты первой вершиной будем брать 1 элемент { x:0, y: 0 }
  visited[0] = {};
  visited[0][0] = unvisited[0][0];
  visited[0][0].isVisited = true;
  delete unvisited[0][0];

  let prevY = 0;
  let prevX = 0;
  let newY = 0;
  let newX = 0;
  let isXEqual = false;
  let isYEqual = false;
  let prevBorders: Border | undefined = undefined;
  let newBorders: Border | undefined = undefined;

  // тут надо запустить цикл с условием, пока в unvisited еще есть вершины
  while (Object.keys(unvisited).length) {
    // сосед с наименьшим весом
    let minWeightVertex: Cell | undefined = undefined;

    for (const y in visited) {
      for (const x in visited[y]) {
        // у neighbours в visited смотрим не посещенных соседей
        const neighbours = visited[y][x].neighbours;

        // находим соседа с наименьшим весом
        for (const nY in neighbours) {
          for (const nX in neighbours[Number(nY)]) {
            const vertex = neighbours[Number(nY)][Number(nX)];

            if (vertex.isVisited) continue;

            if (visited[Number(nY)]?.[Number(nX)]) {
              vertex.isVisited = true;
              continue;
            }

            if (!minWeightVertex || minWeightVertex.weight > vertex.weight) {
              minWeightVertex = vertex;
              prevY = Number(y);
              prevX = Number(x);
            }
          }
        }
      }
    }

    minWeightVertex!.isVisited = true;

    // переносим найденную вершину в посещенные
    newY = minWeightVertex!.y;
    newX = minWeightVertex!.x;

    if (!visited[newY]) {
      visited[newY] = {};
    }

    visited[newY][newX] = unvisited[newY][newX];

    isXEqual = newX === prevX;
    isYEqual = newY === prevY;
    prevBorders = visited[prevY][prevX]!.borders!;
    newBorders = visited[newY][newX]!.borders!;

    if (newY > prevY && isXEqual) {
      prevBorders.bottom = false;
      newBorders.top = false;
    }

    if (newY < prevY && isXEqual) {
      prevBorders.top = false;
      newBorders.bottom = false;
    }

    if (isYEqual && newX > prevX) {
      prevBorders.right = false;
      newBorders.left = false;
    }

    if (isYEqual && newX < prevX) {
      prevBorders.left = false;
      newBorders.right = false;
    }

    visited[newY][newX].isVisited = true;

    delete unvisited[newY][newX];

    if (!Object.keys(unvisited[newY]).length) {
      delete unvisited[newY];
    }
  }

  return visited;
}

export function generateLabyrinth(size: number): Labyrinth {
  let obj: Labyrinth = {};

  generateBaseStructure(obj, size);
  obj = createBorders(obj);

  // console.log(obj);

  return obj;
}

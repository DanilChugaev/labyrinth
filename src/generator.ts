import type { Border, Cell, Labyrinth, NeighbourGeneratorParams } from './types.ts';
import { UniqueRandomNumberGenerator } from './UniqueRandomNumberGenerator.ts';

function getSides(y: number, x: number) {
  return {
    top: y - 1,
    right: x + 1,
    bottom: y + 1,
    left: x - 1,
  };
}

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

  let firstcount = 0;
  let count = 0;
  let usefulcount = 0;

  // тут надо запустить цикл с условием, пока в unvisited еще есть вершины
  while (Object.keys(unvisited).length) {
    // сосед с наименьшим весом
    let minWeightVertex: Cell | undefined = undefined;

    for (const y in visited) {
      for (const x in visited[y]) {
        firstcount = firstcount + 1;
        // у neighbours в visited смотрим не посещенных соседей
        const neighbours = visited[y][x].neighbours;
        const { top, right, bottom, left } = getSides(Number(y), Number(x));

        // находим соседа с наименьшим весом
        [
          neighbours?.[top]?.[x],
          neighbours?.[y]?.[right],
          neighbours?.[bottom]?.[x],
          neighbours?.[y]?.[left],
        ].forEach(item => {
          count = count + 1;
          if (!item || item.isVisited) return;

          if (visited[Number(item.y)]?.[Number(item.x)]) {
            item.isVisited = true;
            return;
          }

          if (!minWeightVertex || minWeightVertex.weight > item.weight) {
            usefulcount = usefulcount + 1;
            minWeightVertex = item;
            prevY = Number(y);
            prevX = Number(x);
          }
        });
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

  console.log('количество итераций firstcount: ', firstcount);
  console.log('количество итераций: ', count);
  console.log('количество итераций до конца: ', usefulcount);

  return visited;
}

export function generateLabyrinth(size: number): Labyrinth {
  let obj: Labyrinth = {};

  const start = performance.now();
  generateBaseStructure(obj, size);
  const end = performance.now();
  console.log(`Время generateBaseStructure: ${end - start} мс`);

  const start2 = performance.now();
  obj = createBorders(obj);
  const end2 = performance.now();
  console.log(`Время createBorders: ${end2 - start2} мс`);

  return obj;
}

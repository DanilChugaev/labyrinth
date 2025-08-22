import type { Cell, Labyrinth } from './types.ts';
import { UniqueRandomNumberGenerator } from './UniqueRandomNumberGenerator.ts';

function generateBaseStructure(obj: Labyrinth, size: number) {
  const length = size * size;
  const generator = new UniqueRandomNumberGenerator(1, length * 3);

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
        isVisited: false,
        borders: {
          top: true,
          right: true,
          bottom: true,
          left: true,
        }
      };
    }
  }
}

function setXNeighbour(obj: Labyrinth, y: number, x: number, xCoord: number) {
  if (!obj[y][x].neighbours![y]) {
    obj[y][x].neighbours![y] = {};
  }

  obj[y][x].neighbours![y][xCoord] = {
    y,
    x: xCoord,
    weight: obj[y][xCoord].weight,
    isVisited: false,
  }
}

function setYNeighbour(obj: Labyrinth, y: number, x: number, yCoord: number) {
  if (!obj[y][x].neighbours![yCoord]) {
    obj[y][x].neighbours![yCoord] = {};
  }

  obj[y][x].neighbours![yCoord][x] = {
    y: yCoord,
    x,
    weight: obj[yCoord][x].weight,
    isVisited: false,
  }
}

function setNeighbours(obj: Labyrinth, size: number) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const top = y - 1;
      const right = x + 1;
      const bottom = y + 1;
      const left = x - 1;

      if (top >= 0) {
        setYNeighbour(obj, y, x, top);
      }

      if (right < size) {
        setXNeighbour(obj, y, x, right);
      }

      if (bottom < size) {
        setYNeighbour(obj, y, x, bottom);
      }

      if (left >= 0) {
        setXNeighbour(obj, y, x, left);
      }
    }
  }
}

function createPath(obj: Labyrinth): Labyrinth {
  const unvisited: Labyrinth = obj;
  const visited: Labyrinth = {};

  // для простоты первой вершиной будем брать 1 элемент { x:0, y: 0 }
  visited[0] = {};
  visited[0][0] = unvisited[0][0];
  visited[0][0].isVisited = true;
  delete unvisited[0][0];

  let prevY = 0;
  let prevX = 0;

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
    const newY = minWeightVertex!.y
    const newX = minWeightVertex!.x

    if (!visited[newY]) {
      visited[newY] = {}
    }

    visited[newY][newX] = unvisited[newY][newX];

    if (newY > prevY && newX === prevX) {
      visited[prevY][prevX]!.borders!.bottom = false;
      visited[newY][newX]!.borders!.top = false;
    }

    if (newY < prevY && newX === prevX) {
      visited[prevY][prevX]!.borders!.top = false;
      visited[newY][newX]!.borders!.bottom = false;
    }

    if (newY === prevY && newX > prevX) {
      visited[prevY][prevX]!.borders!.right = false;
      visited[newY][newX]!.borders!.left = false;
    }

    if (newY === prevY && newX < prevX) {
      visited[prevY][prevX]!.borders!.left = false;
      visited[newY][newX]!.borders!.right = false;
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
  setNeighbours(obj, size);
  obj = createPath(obj)

  console.log(obj);

  return obj;
}
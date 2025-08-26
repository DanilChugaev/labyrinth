import type { Border, Cell, Labyrinth, MinWeightVertex, PrevCoordVertex } from '../types.ts';
import { getSides } from '../utils/getSides.ts';

function findMinVertex(
  item: Cell | undefined,
  visited: Labyrinth,
  minWeightVertex: MinWeightVertex,
  y: string,
  x: string,
  prev: PrevCoordVertex,
) {
  if (!item || item.isVisited) return;

  if (visited[Number(item.y)]?.[Number(item.x)]) {
    item.isVisited = true;
    return;
  }

  if (!minWeightVertex.value || minWeightVertex.value.weight > item.weight) {
    minWeightVertex.value = item;
    prev.y = Number(y);
    prev.x = Number(x);
  }
}

export function createBorders(obj: Labyrinth): Labyrinth {
  const unvisited: Labyrinth = obj;
  const visited: Labyrinth = {};

  // для простоты первой вершиной будем брать 1 элемент { x:0, y: 0 }
  visited[0] = {};
  visited[0][0] = unvisited[0][0];
  visited[0][0].isVisited = true;
  delete unvisited[0][0];

  const prev: PrevCoordVertex = {
    y: 0,
    x: 0,
  };

  let newY = 0;
  let newX = 0;
  let isXEqual = false;
  let isYEqual = false;
  let prevBorders: Border | undefined = undefined;
  let newBorders: Border | undefined = undefined;

  let count = 0;

  // тут надо запустить цикл с условием, пока в unvisited еще есть вершины
  while (Object.keys(unvisited).length) {
    // сосед с наименьшим весом
    const minWeightVertex: MinWeightVertex = {
      value: undefined,
    };

    for (const y in visited) {
      for (const x in visited[y]) {
        count = count + 1;
        // у neighbours в visited смотрим не посещенных соседей
        const neighbours = visited[y][x].neighbours;
        const { top, right, bottom, left } = getSides(Number(y), Number(x));

        // находим соседа с наименьшим весом
        findMinVertex(neighbours?.[top]?.[x], visited, minWeightVertex, y, x, prev);
        findMinVertex(neighbours?.[y]?.[right], visited, minWeightVertex, y, x, prev);
        findMinVertex(neighbours?.[bottom]?.[x], visited, minWeightVertex, y, x, prev);
        findMinVertex(neighbours?.[y]?.[left], visited, minWeightVertex, y, x, prev);
      }
    }

    minWeightVertex.value!.isVisited = true;

    // переносим найденную вершину в посещенные
    newY = minWeightVertex.value!.y;
    newX = minWeightVertex.value!.x;

    if (!visited[newY]) {
      visited[newY] = {};
    }

    visited[newY][newX] = unvisited[newY][newX];

    isYEqual = newY === prev.y;
    isXEqual = newX === prev.x;
    prevBorders = visited[prev.y][prev.x]!.borders!;
    newBorders = visited[newY][newX]!.borders!;

    if (newY > prev.y && isXEqual) {
      prevBorders.bottom = false;
      newBorders.top = false;
    }

    if (newY < prev.y && isXEqual) {
      prevBorders.top = false;
      newBorders.bottom = false;
    }

    if (isYEqual && newX > prev.x) {
      prevBorders.right = false;
      newBorders.left = false;
    }

    if (isYEqual && newX < prev.x) {
      prevBorders.left = false;
      newBorders.right = false;
    }

    visited[newY][newX].isVisited = true;

    delete unvisited[newY][newX];

    if (!Object.keys(unvisited[newY]).length) {
      delete unvisited[newY];
    }
  }

  console.log('Количество итераций: ', count);

  return visited;
}

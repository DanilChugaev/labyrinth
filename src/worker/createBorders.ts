import type { Border, Cell, Labyrinth, MinWeightVertex, PrevCoordVertex } from '../types.ts';
import { getSides } from '../utils/getSides.ts';

function findMinVertex(
  item: Cell,
  visited: Labyrinth,
  minWeightVertex: MinWeightVertex,
  y: number,
  x: number,
  prev: PrevCoordVertex,
) {
  if (item.isVisited) return;

  if (visited[item.y]?.[item.x]) {
    item.isVisited = true;
    return;
  }

  if (!minWeightVertex.value || minWeightVertex.value.weight > item.weight) {
    minWeightVertex.value = item;
    prev.y = y;
    prev.x = x;
  }
}

export function createBorders(obj: Labyrinth, size: number): Labyrinth {
  let unvisitedCount = size * size;
  const visited: Labyrinth = {};
  const visitedArr: Cell[] = [];

  // для простоты первой вершиной будем брать 1 элемент { x:0, y: 0 }
  visited[0] = {};
  visited[0][0] = obj[0][0];
  visited[0][0].isVisited = true;

  // visitedArr используем для поиска не посещенных соседей
  visitedArr.push(visited[0][0]);
  unvisitedCount = unvisitedCount - 1;

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
  let whilecount = 0;
  const start = performance.now();
  // тут надо запустить цикл с условием, пока в unvisited еще есть вершины
  while (unvisitedCount) {
    whilecount = whilecount + 1;
    // сосед с наименьшим весом
    const minWeightVertex: MinWeightVertex = {
      value: undefined,
    };

    // мб стоит удалять ненужные элементы из visitedArr, чтобы уменьшить количество проходов
    // если все соседи в item из visitedArr посещены, то стоит удалить этот элемент из массива
    const length = visitedArr.length;

    for (let i = 0; i < length; i++) {
      count = count + 1;
      // у neighbours в visited смотрим не посещенных соседей
      const { y, x, neighbours } = visitedArr[i];
      const { top, right, bottom, left } = getSides(y, x);

      // находим соседа с наименьшим весом
      top >= 0 && findMinVertex(neighbours![top][x], visited, minWeightVertex, y, x, prev);
      right < size && findMinVertex(neighbours![y][right], visited, minWeightVertex, y, x, prev);
      bottom < size &&
        findMinVertex(neighbours![bottom][x], visited, minWeightVertex, y, x, prev);
      left >= 0 && findMinVertex(neighbours![y][left], visited, minWeightVertex, y, x, prev);
    }

    minWeightVertex.value!.isVisited = true;

    // переносим найденную вершину в посещенные
    newY = minWeightVertex.value!.y;
    newX = minWeightVertex.value!.x;

    if (!visited[newY]) {
      visited[newY] = {};
    }

    visited[newY][newX] = obj[newY][newX];
    visitedArr.push(visited[newY][newX]);

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

    unvisitedCount = unvisitedCount - 1;
  }

  const end = performance.now();

  console.log(`Цикл while: ${end - start} мс`);

  console.log('Количество циклов while: ', whilecount);
  console.log('Количество всех итераций: ', count);

  return visited;
}

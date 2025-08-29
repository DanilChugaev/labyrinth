import type { Labyrinth } from '../types.ts';
import { PriorityQueue } from '../utils/PriorityQueue.ts';
import { UniqueRandomNumberGenerator } from '../utils/UniqueRandomNumberGenerator.ts';

function generateBaseStructure(obj: Labyrinth, size: number, totalCells: number) {
  const generator = new UniqueRandomNumberGenerator(1, totalCells * 3);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!obj[y]) {
        obj[y] = {};
      }

      obj[y][x] = {
        y,
        x,
        weight: generator.getRandomNumber(),
        isVisited: false,
        borders: {
          top: true,
          right: true,
          bottom: true,
          left: true,
        },
      };
    }
  }
}

export function generateStructure(size: number): Labyrinth {
  const obj: Labyrinth = {};
  const totalCells = size * size;

  const start1 = performance.now();
  generateBaseStructure(obj, size, totalCells);
  const end1 = performance.now();
  console.log(`Время generateBaseStructure: ${end1 - start1} мс`);

  // для моментального доступа к не посещенным вершинам создаем приоритетную очередь с бинарной кучей
  const priorityQueue = new PriorityQueue();
  const keySet = new Set<string>();
  const structure: Labyrinth = {};

  let visitedCount = 1;

  // для простоты первой вершиной будем брать 1 элемент { x:0, y: 0 }
  structure[0] = {};
  structure[0][0] = obj[0][0];
  structure[0][0].isVisited = true;

  // используем для добавления соседей в бинарную кучу
  const directions = [
    { dy: -1, dx: 0 }, // top
    { dy: 0, dx: 1 }, // right
    { dy: 1, dx: 0 }, // bottom
    { dy: 0, dx: -1 }, // left
  ];

  const addNeighbours = (y: number, x: number) => {
    for (const dir of directions) {
      const newY = y + dir.dy;
      const newX = x + dir.dx;

      if (newY >= 0 && newY < size && newX >= 0 && newX < size) {
        const key = `${newY}:${newX}`;

        if (!obj[newY]?.[newX]?.isVisited && !keySet.has(key)) {
          keySet.add(key);

          priorityQueue.enqueue({
            weight: obj[newY][newX].weight,
            y: newY,
            x: newX,
            prevY: y,
            prevX: x,
          });
        }
      }
    }
  };

  addNeighbours(0, 0);

  const start = performance.now();

  while (visitedCount < totalCells) {
    const minItem = priorityQueue.dequeue();

    if (!minItem) break;

    const { y: newY, x: newX, prevY, prevX } = minItem;
    const cell = obj[newY][newX];

    if (cell.isVisited) continue;

    cell.isVisited = true;
    visitedCount++;

    if (!structure[newY]) {
      structure[newY] = {};
    }

    structure[newY][newX] = cell;
    keySet.delete(`${newY}:${newX}`);

    const isYEqual = newY === prevY;
    const isXEqual = newX === prevX;
    const prevBorders = structure[prevY][prevX]!.borders!;
    const newBorders = cell.borders!;

    // удаляем границы для формирования проходов
    if (newY > prevY && isXEqual) {
      prevBorders.bottom = false;
      newBorders.top = false;
    } else if (newY < prevY && isXEqual) {
      prevBorders.top = false;
      newBorders.bottom = false;
    } else if (isYEqual && newX > prevX) {
      prevBorders.right = false;
      newBorders.left = false;
    } else if (isYEqual && newX < prevX) {
      prevBorders.left = false;
      newBorders.right = false;
    }

    // для этой вершины добавляем не посещенные вершины (соседей)
    addNeighbours(newY, newX);
  }

  const end = performance.now();
  console.log(`Цикл while: ${end - start} мс`);
  console.log('Количество всех итераций: ', visitedCount);

  return structure;
}

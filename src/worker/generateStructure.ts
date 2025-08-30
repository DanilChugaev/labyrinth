import { PriorityQueue } from '../utils/PriorityQueue.ts';
import { UniqueRandomNumberGenerator } from '../utils/UniqueRandomNumberGenerator.ts';

// удаляем стену сверху у текущей клетки и снизу у соседа сверху
function removeTopBorder(borders: Uint8Array, idx: number, y: number, size: number): void {
  if (y === 0) return; // пропускаем, если клетка на верхней границе

  // сбрасываем бит top (0) у текущей клетки
  borders[idx] &= ~(1 << 0);

  // сбрасываем бит bottom (2) у соседа сверху (idx - size)
  borders[idx - size] &= ~(1 << 2);
}

// удаляем стену справа у текущей клетки и слева у соседа справа
function removeRightBorder(borders: Uint8Array, idx: number, x: number, size: number): void {
  if (x === size - 1) return; // пропускаем, если клетка на правой границе

  // сбрасываем бит right (1) у текущей клетки
  borders[idx] &= ~(1 << 1);

  // сбрасываем бит left (3) у соседа справа
  borders[idx + 1] &= ~(1 << 3);
}

// удаляем стену снизу у текущей клетки и сверху у соседа снизу
function removeBottomBorder(borders: Uint8Array, idx: number, y: number, size: number): void {
  if (y === size - 1) return; // пропускаем, если клетка на нижней границе

  // сбрасываем бит bottom (2) у текущей клетки
  borders[idx] &= ~(1 << 2);

  // сбрасываем бит top (0) у соседа снизу
  borders[idx + size] &= ~(1 << 0);
}

// удаляем стену слева у текущей клетки и справа у соседа слева
function removeLeftBorder(borders: Uint8Array, idx: number, x: number): void {
  if (x === 0) return; // пропускаем, если клетка на левой границе

  // сбрасываем бит left (3) у текущей клетки
  borders[idx] &= ~(1 << 3);

  // сбрасываем бит right (1) у соседа слева
  borders[idx - 1] &= ~(1 << 1);
}

function generateBaseStructure(totalCells: number) {
  const generator = new UniqueRandomNumberGenerator(1, totalCells * 3);

  const isVisitedBuffer = new Uint8Array(totalCells); // 1 байт на клетку (храним как бинарный флаг 0 или 1)
  // храним borders как 4 бита на клетку (top, right, bottom, left)
  const bordersBuffer = new Uint8Array(totalCells); // 1 байт, где биты 0-3 = borders
  const weightsBuffer = new Uint32Array(totalCells); // 4 байта на weight

  for (let i = 0; i < totalCells; i++) {
    isVisitedBuffer[i] = 0; // не посещено
    bordersBuffer[i] = 0b1111; // все стены (true = 1)
    weightsBuffer[i] = generator.getRandomNumber();
  }

  return {
    isVisitedBuffer,
    bordersBuffer,
    weightsBuffer,
  };
}

export function generateStructure(size: number) {
  const totalCells = size * size;

  const start1 = performance.now();
  const { isVisitedBuffer, bordersBuffer, weightsBuffer } = generateBaseStructure(totalCells);

  const end1 = performance.now();
  console.log(`Время generateBaseStructure: ${end1 - start1} мс`);

  // для моментального доступа к не посещенным вершинам создаем приоритетную очередь с бинарной кучей
  const priorityQueue = new PriorityQueue(totalCells);
  const keySet = new Set<number>();

  let visitedCount = 1;

  // для простоты первой вершиной будем брать 1 элемент { x:0, y: 0 }
  isVisitedBuffer[0] = 1;

  // используем для добавления соседей в бинарную кучу
  const directions = [
    { dy: -1, dx: 0 }, // top
    { dy: 0, dx: 1 }, // right
    { dy: 1, dx: 0 }, // bottom
    { dy: 0, dx: -1 }, // left
  ];

  const addNeighbours = (idx: number) => {
    for (const dir of directions) {
      const y = Math.floor(idx / size);
      const x = idx % size;
      const newY = y + dir.dy;
      const newX = x + dir.dx;
      const newIdx = newY * size + newX;

      if (newY >= 0 && newY < size && newX >= 0 && newX < size) {
        if (!isVisitedBuffer[newIdx] && !keySet.has(newIdx)) {
          keySet.add(newIdx);

          priorityQueue.enqueue({
            weight: weightsBuffer[newIdx],
            idx: newIdx,
            prevIdx: idx,
          });
        }
      }
    }
  };

  // добавляем соседей для начальной точки
  addNeighbours(0);

  const start = performance.now();

  while (visitedCount < totalCells) {
    const minItem = priorityQueue.dequeue();

    if (!minItem) break;

    const { idx, prevIdx } = minItem;

    if (isVisitedBuffer[idx]) continue;

    isVisitedBuffer[idx] = 1;
    visitedCount++;
    keySet.delete(idx);

    const newY = Math.floor(idx / size);
    const newX = idx % size;
    const prevY = Math.floor(prevIdx / size);
    const prevX = prevIdx % size;
    const isYEqual = newY === prevY;
    const isXEqual = newX === prevX;

    // удаляем границы для формирования проходов
    if (newY > prevY && isXEqual) {
      removeTopBorder(bordersBuffer, idx, newY, size);
    } else if (newY < prevY && isXEqual) {
      removeBottomBorder(bordersBuffer, idx, newY, size);
    } else if (isYEqual && newX > prevX) {
      removeLeftBorder(bordersBuffer, idx, newX);
    } else if (isYEqual && newX < prevX) {
      removeRightBorder(bordersBuffer, idx, newX, size);
    }

    // для этой вершины добавляем не посещенные вершины (соседей)
    addNeighbours(idx);
  }

  const end = performance.now();
  console.log(`Цикл while: ${end - start} мс`);
  console.log('Количество всех итераций: ', visitedCount);

  return bordersBuffer;
}

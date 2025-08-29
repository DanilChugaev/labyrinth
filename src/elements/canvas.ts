import { generateLabyrinth } from '../generator.ts';
import type { Border, Labyrinth } from '../types.ts';
import { getLabyrinthSize } from '../utils/storage.ts';

async function draw({
  size,
  cellSize,
  context,
}: {
  size: number;
  cellSize: number;
  context: CanvasRenderingContext2D;
}) {
  const start = performance.now();

  const obj: Labyrinth = await generateLabyrinth(size);

  const end = performance.now();
  console.log(`Время генерации: ${end - start} мс`);

  context.lineWidth = 1;
  context.fillStyle = '#f3f4f6';

  let newX = 0;
  let newY = 0;
  let newXPlus1 = 0;
  let newYPlus1 = 0;
  let borders: Border | undefined = undefined;

  const start2 = performance.now();

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      newX = x * cellSize;
      newY = y * cellSize;
      newXPlus1 = (x + 1) * cellSize;
      newYPlus1 = (y + 1) * cellSize;
      borders = obj[y][x].borders!;

      context.fillRect(newX, newY, cellSize, cellSize);

      if (borders.right) {
        context.moveTo(newXPlus1, newY);
        context.lineTo(newXPlus1, newYPlus1);
      }

      if (borders.left) {
        context.moveTo(newX, newY);
        context.lineTo(newX, newYPlus1);
      }

      if (borders.top) {
        context.moveTo(newX, newY);
        context.lineTo(newXPlus1, newY);
      }

      if (borders.bottom) {
        context.moveTo(newX, newYPlus1);
        context.lineTo(newXPlus1, newYPlus1);
      }
    }
  }

  context.stroke();

  const end2 = performance.now();
  console.log(`Время отрисовки: ${end2 - start2} мс`);
}

export function setupCanvas(element: HTMLCanvasElement) {
  const { innerWidth: windowWidth, innerHeight: windowHeight } = window;

  const margin = 24;
  const size = Number(getLabyrinthSize());
  const coef = 1.2;

  const usefulWidth = windowWidth - 2 * margin;
  const cellSizeWidth = Math.floor(usefulWidth / size);
  const canvasWidth = cellSizeWidth * size;

  const usefulHeight = windowHeight / coef;
  const cellSizeHeight = Math.floor(usefulHeight / size);
  const canvasHeight = cellSizeHeight * size;

  let canvasSize = 0;
  let cellSize = 0;

  if (usefulWidth < usefulHeight) {
    canvasSize = canvasWidth;
    cellSize = cellSizeWidth;
  } else {
    canvasSize = canvasHeight;
    cellSize = cellSizeHeight;
  }

  element.width = canvasSize;
  element.height = canvasSize;

  const context = element.getContext('2d')!;

  const drawLabyrinth = () => draw({ size, cellSize, context });

  const redrawLabyrinth = () => {
    window.location.reload();
  };

  return {
    drawLabyrinth,
    redrawLabyrinth,
  };
}

import { generateLabyrinth } from './generator.ts'
import type { Labyrinth } from './types.ts';
import { getLabyrinthSize } from './storage.ts';

function draw({
  size,
  cellSize,
  context
}: {
  size: number,
  cellSize: number,
  context: CanvasRenderingContext2D,
}) {
  const obj: Labyrinth = generateLabyrinth(size);

  context.lineWidth = 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const newX = x * cellSize;
      const newY = y * cellSize;

      context.fillStyle = "#f3f4f6";
      context.fillRect(newX, newY, cellSize, cellSize);

      if (obj[y][x].borders!.right) {
        context.moveTo((x + 1) * cellSize, y * cellSize);
        context.lineTo((x + 1) * cellSize, (y + 1) * cellSize);
        context.stroke();
      }

      if (obj[y][x].borders!.left) {
        context.moveTo(x * cellSize, y * cellSize);
        context.lineTo(x * cellSize, (y + 1) * cellSize);
        context.stroke();
      }

      if (obj[y][x].borders!.top) {
        context.moveTo(x * cellSize, y * cellSize);
        context.lineTo((x + 1) * cellSize, y * cellSize);
        context.stroke();
      }

      if (obj[y][x].borders!.bottom) {
        context.moveTo(x * cellSize, (y + 1) * cellSize);
        context.lineTo((x + 1) * cellSize, (y + 1) * cellSize);
        context.stroke();
      }
    }
  }
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

  const context = element.getContext("2d")!;

  const drawLabyrinth = () => draw({ size, cellSize, context });

  const redrawLabyrinth = () => {
    window.location.reload();
  };

  return {
    drawLabyrinth,
    redrawLabyrinth,
  }
}

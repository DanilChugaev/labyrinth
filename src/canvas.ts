import { generateLabyrinth } from './generator.ts'
import type { Labyrinth } from './types.ts';

function drawLabyrinth(canvasSize: number, context: CanvasRenderingContext2D) {
  const size = 11
  const cellSize = Math.floor(canvasSize / size);
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
  const coef = 1.3;
  const canvasSize = windowWidth < windowHeight ? windowWidth / coef : windowHeight / coef;

  element.width = canvasSize;
  element.height = canvasSize;

  const context = element.getContext("2d")!;

  const redrawLabyrinth = () => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    drawLabyrinth(canvasSize, context);
  };

  drawLabyrinth(canvasSize, context);

  return {
    redrawLabyrinth,
  }
}

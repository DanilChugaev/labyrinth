import { generateLabyrinth } from '../generator.ts';
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

  const structure: Uint8Array = await generateLabyrinth(size);
  const totalCells = structure.length;

  const end = performance.now();
  console.log(`Время генерации: ${end - start} мс`);

  context.lineWidth = 1;
  context.strokeStyle = '#000000';
  context.fillStyle = '#f3f4f6';

  context.fillRect(0, 0, size * cellSize, size * cellSize);

  const start2 = performance.now();

  context.beginPath();

  for (let i = 0; i < totalCells; i++) {
    const x = i % size;
    const y = Math.floor(i / size);
    const newX = x * cellSize;
    const newY = y * cellSize;
    const newXPlus1 = (x + 1) * cellSize;
    const newYPlus1 = (y + 1) * cellSize;

    // проверяем верхнюю стену
    if ((structure[i] & (1 << 0)) !== 0) {
      context.moveTo(newX, newY);
      context.lineTo(newXPlus1, newY);
    }

    // проверяем правую стену
    if ((structure[i] & (1 << 1)) !== 0) {
      context.moveTo(newXPlus1, newY);
      context.lineTo(newXPlus1, newYPlus1);
    }

    // проверяем нижнюю стену
    if ((structure[i] & (1 << 2)) !== 0) {
      context.moveTo(newX, newYPlus1);
      context.lineTo(newXPlus1, newYPlus1);
    }

    // проверяем левую стену
    if ((structure[i] & (1 << 3)) !== 0) {
      context.moveTo(newX, newY);
      context.lineTo(newX, newYPlus1);
    }
  }

  context.stroke();

  const end2 = performance.now();
  console.log(`Время отрисовки: ${end2 - start2} мс`);
}

export function setupCanvas(element: HTMLCanvasElement) {
  const { innerWidth: windowWidth, innerHeight: windowHeight } = window;

  const padding = 24;
  const gap = 16;
  const footerHeight = 56;
  const actionsHeight = 0;
  const arrowsHeight = 114;
  const size = Number(getLabyrinthSize());

  const usefulWidth = windowWidth - 2 * padding;
  const cellSizeWidth = Math.floor(usefulWidth / size);
  const canvasWidth = cellSizeWidth * size;

  const usefulHeight =
    windowHeight - (2 * padding + 2 * gap) - footerHeight - actionsHeight - arrowsHeight;
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

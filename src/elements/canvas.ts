import { generateLabyrinth } from '../generator.ts';
import { getLabyrinthSize, loadBooleanStorageValue } from '../utils/storage.ts';
import type { PointDirection } from '../types.ts';
import { FAST_MOVEMENT_KEY } from '../constants.ts';

async function draw({
  size,
  cellSize,
  context,
  structure,
  totalCells,
}: {
  size: number;
  cellSize: number;
  context: CanvasRenderingContext2D;
  structure: Uint8Array;
  totalCells: number;
}) {
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
  context.closePath();

  const end2 = performance.now();
  console.log(`Время отрисовки: ${end2 - start2} мс`);
}

let currentY = 0;
let currentX = 0;

const directionMap = {
  top: (structure: Uint8Array, size: number) => {
    if ((structure[currentY * size + currentX] & (1 << 0)) === 0) {
      currentY -= 1;
    }
  },
  right: (structure: Uint8Array, size: number) => {
    if ((structure[currentY * size + currentX] & (1 << 1)) === 0) {
      currentX += 1;
    }
  },
  bottom: (structure: Uint8Array, size: number) => {
    if ((structure[currentY * size + currentX] & (1 << 2)) === 0) {
      currentY += 1;
    }
  },
  left: (structure: Uint8Array, size: number) => {
    if ((structure[currentY * size + currentX] & (1 << 3)) === 0) {
      currentX -= 1;
    }
  },
};

const pathBuffer: Record<number, Set<number>> = {};

function drawPath({
  cellSize,
  context,
  initialPointCoord,
  pointRadius,
  endPointAngle,
  pathColor,
}: {
  cellSize: number;
  context: CanvasRenderingContext2D;
  structure: Uint8Array;
  initialPointCoord: number;
  pointRadius: number;
  endPointAngle: number;
  pathColor: string;
}) {
  context.beginPath();
  context.arc(
    currentX * cellSize + initialPointCoord,
    currentY * cellSize + initialPointCoord,
    pointRadius,
    0,
    endPointAngle,
  );
  context.fillStyle = pathColor;
  context.fill();

  // todo вынести в отдельный метод
  if (!pathBuffer[currentY]) {
    pathBuffer[currentY] = new Set();
  }

  pathBuffer[currentY].add(currentX);
}

function drawPointOnCanvas({
  size,
  cellSize,
  pathContext,
  pointContext,
  structure,
  initialPointCoord,
  pointRadius,
  endPointAngle,
  pathColor,
  direction,
}: {
  size: number;
  cellSize: number;
  pathContext: CanvasRenderingContext2D;
  pointContext: CanvasRenderingContext2D;
  structure: Uint8Array;
  initialPointCoord: number;
  pointRadius: number;
  endPointAngle: number;
  pathColor: string;
  direction?: PointDirection;
}) {
  if (direction) {
    directionMap[direction](structure, size);
  }

  drawPath({
    context: pathContext,
    cellSize,
    structure,
    initialPointCoord,
    pointRadius,
    endPointAngle,
    pathColor,
  });

  pointContext.clearRect(0, 0, size * cellSize, size * cellSize);

  pointContext.beginPath();
  pointContext.arc(
    currentX * cellSize + initialPointCoord,
    currentY * cellSize + initialPointCoord,
    pointRadius,
    0,
    endPointAngle,
  );
  pointContext.fillStyle = 'red';
  pointContext.fill();
  pointContext.closePath();
}

function drawTarget({
  size,
  cellSize,
  context,
  pointRadius,
  initialPointCoord,
  endPointAngle,
}: {
  size: number;
  cellSize: number;
  context: CanvasRenderingContext2D;
  pointRadius: number;
  initialPointCoord: number;
  endPointAngle: number;
}) {
  context.beginPath();
  context.arc(
    (size - 1) * cellSize + initialPointCoord,
    (size - 1) * cellSize + initialPointCoord,
    pointRadius,
    0,
    endPointAngle,
  );
  context.fillStyle = 'green';
  context.fill();
  context.closePath();
}

function getSizes() {
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

  let canvasSize: number;
  let cellSize: number;

  if (usefulWidth < usefulHeight) {
    canvasSize = canvasWidth;
    cellSize = cellSizeWidth;
  } else {
    canvasSize = canvasHeight;
    cellSize = cellSizeHeight;
  }

  return {
    size,
    canvasSize,
    cellSize,
  };
}

export async function setupCanvas({
  canvasBackground,
  canvasPath,
  canvasPoint,
  pathColor,
}: {
  canvasBackground: HTMLCanvasElement;
  canvasPath: HTMLCanvasElement;
  canvasPoint: HTMLCanvasElement;
  pathColor: string;
}) {
  const { size, canvasSize, cellSize } = getSizes();

  canvasBackground.width = canvasSize;
  canvasBackground.height = canvasSize;

  canvasPath.width = canvasSize;
  canvasPath.height = canvasSize;

  canvasPoint.width = canvasSize;
  canvasPoint.height = canvasSize;

  const backgroundContext = canvasBackground.getContext('2d')!;
  const pathContext = canvasPath.getContext('2d')!;
  const pointContext = canvasPoint.getContext('2d')!;

  const start = performance.now();

  const structure: Uint8Array = await generateLabyrinth(size);
  const totalCells = structure.length;

  const end = performance.now();
  console.log(`Время генерации: ${end - start} мс`);

  const drawLabyrinth = () => {
    draw({
      size,
      cellSize,
      context: backgroundContext,
      structure,
      totalCells,
    });

    drawTarget({
      size,
      cellSize,
      context: backgroundContext,
      pointRadius,
      initialPointCoord,
      endPointAngle,
    });
  };

  const redrawLabyrinth = () => {
    window.location.reload();
  };

  const initialPointCoord = cellSize / 2;
  const pointRadius = cellSize / 3;
  const endPointAngle = 2 * Math.PI;

  const drawPoint = (direction?: PointDirection) =>
    drawPointOnCanvas({
      size,
      cellSize,
      pointContext,
      pathContext,
      structure,
      initialPointCoord,
      pointRadius,
      endPointAngle,
      direction,
      pathColor,
    });

  canvasPoint.addEventListener('click', event => {
    if (!loadBooleanStorageValue(FAST_MOVEMENT_KEY, true)) return;

    const rect = canvasPoint.getBoundingClientRect();

    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    if (pathBuffer[y]?.has(x)) {
      currentX = x;
      currentY = y;
      drawPoint();
    }
  });

  return {
    drawLabyrinth,
    redrawLabyrinth,
    drawPoint,
  };
}

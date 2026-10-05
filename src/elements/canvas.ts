import { timerStart, timerStop } from '../components/Timer/Timer.ts';
import { FAST_MOVEMENT_KEY, TIMER_KEY } from '../constants.ts';
import { generateLabyrinth } from '../generator.ts';
import { Viewport } from '../game/Viewport.ts';
import type { PointDirection } from '../types.ts';
import {
  checkGameState,
  gameStart,
  gameStop,
  getLabyrinthSize,
  loadBooleanStorageValue,
} from '../utils/storage.ts';

const MIN_VIEWPORT_SIZE = 160;
const PAN_THRESHOLD = 8;
const ZOOM_STEP = 1.25;

let currentY = 0;
let currentX = 0;

const directionMap: Record<PointDirection, (structure: Uint8Array, size: number) => void> = {
  top: (structure, size) => {
    if ((structure[currentY * size + currentX] & (1 << 0)) === 0) currentY -= 1;
  },
  right: (structure, size) => {
    if ((structure[currentY * size + currentX] & (1 << 1)) === 0) currentX += 1;
  },
  bottom: (structure, size) => {
    if ((structure[currentY * size + currentX] & (1 << 2)) === 0) currentY += 1;
  },
  left: (structure, size) => {
    if ((structure[currentY * size + currentX] & (1 << 3)) === 0) currentX -= 1;
  },
};

interface PointerPosition {
  x: number;
  y: number;
  startX: number;
  startY: number;
}

interface CanvasSetup {
  canvasBackground: HTMLCanvasElement;
  canvasPath: HTMLCanvasElement;
  canvasPoint: HTMLCanvasElement;
  canvasContainer: HTMLDivElement;
  pathColor: string;
  resultContainer: HTMLDivElement;
  onZoomChange: (zoomPercent: number) => void;
}

export async function setupCanvas({
  canvasBackground,
  canvasPath,
  canvasPoint,
  canvasContainer,
  pathColor,
  resultContainer,
  onZoomChange,
}: CanvasSetup) {
  const backgroundContext = canvasBackground.getContext('2d')!;
  const pathContext = canvasPath.getContext('2d')!;
  const pointContext = canvasPoint.getContext('2d')!;

  const styles = getComputedStyle(canvasBackground);
  const wallColor = styles.getPropertyValue('--border-canvas-wall').trim();
  const canvasBgColor = styles.getPropertyValue('--bg-canvas').trim();
  const pointColor = styles.getPropertyValue('--point-color').trim();
  const targetColor = styles.getPropertyValue('--target-color').trim();

  let size = Number(getLabyrinthSize());
  let structure = new Uint8Array();
  let viewport = new Viewport(size);
  let viewportSize = MIN_VIEWPORT_SIZE;
  let devicePixelRatio = window.devicePixelRatio || 1;
  let generationId = 0;
  const pathBuffer = new Map<number, Set<number>>();
  const activePointers = new Map<number, PointerPosition>();
  let hasDragged = false;
  let hasPinched = false;
  let pinchDistance = 0;

  function getViewportSize(): number {
    const headerHeight = document.querySelector<HTMLElement>('.header')?.offsetHeight ?? 0;
    const arrowsHeight = document.querySelector<HTMLElement>('.game__arrows')?.offsetHeight ?? 0;
    const width = window.innerWidth - 32;
    const height = window.innerHeight - headerHeight - arrowsHeight - 48;

    return Math.max(MIN_VIEWPORT_SIZE, Math.floor(Math.min(width, height)));
  }

  function setCanvasSize(): void {
    viewportSize = getViewportSize();
    devicePixelRatio = window.devicePixelRatio || 1;
    canvasContainer.style.width = `${viewportSize}px`;
    canvasContainer.style.height = `${viewportSize}px`;

    [canvasBackground, canvasPath, canvasPoint].forEach(canvas => {
      canvas.width = Math.round(viewportSize * devicePixelRatio);
      canvas.height = Math.round(viewportSize * devicePixelRatio);
      canvas.style.width = `${viewportSize}px`;
      canvas.style.height = `${viewportSize}px`;
    });

    viewport.setSize(viewportSize, viewportSize);
  }

  function prepareContext(context: CanvasRenderingContext2D, clearColor?: string): void {
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.clearRect(0, 0, viewportSize, viewportSize);

    if (clearColor) {
      context.fillStyle = clearColor;
      context.fillRect(0, 0, viewportSize, viewportSize);
    }

    context.translate(viewport.offsetX, viewport.offsetY);
    context.scale(viewport.scale, viewport.scale);
  }

  function drawLabyrinth(): void {
    if (!structure.length) return;

    const { minX, maxX, minY, maxY } = viewport.getVisibleBounds();
    prepareContext(backgroundContext, canvasBgColor);
    backgroundContext.strokeStyle = wallColor;
    backgroundContext.lineWidth = 1 / viewport.scale;
    backgroundContext.beginPath();

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const borders = structure[y * size + x];

        if ((borders & 1) !== 0) {
          backgroundContext.moveTo(x, y);
          backgroundContext.lineTo(x + 1, y);
        }
        if ((borders & 2) !== 0) {
          backgroundContext.moveTo(x + 1, y);
          backgroundContext.lineTo(x + 1, y + 1);
        }
        if ((borders & 4) !== 0) {
          backgroundContext.moveTo(x, y + 1);
          backgroundContext.lineTo(x + 1, y + 1);
        }
        if ((borders & 8) !== 0) {
          backgroundContext.moveTo(x, y);
          backgroundContext.lineTo(x, y + 1);
        }
      }
    }

    backgroundContext.stroke();
    backgroundContext.closePath();
    backgroundContext.beginPath();
    backgroundContext.arc(size - 0.5, size - 0.5, 0.3, 0, 2 * Math.PI);
    backgroundContext.fillStyle = targetColor;
    backgroundContext.fill();
    backgroundContext.closePath();
  }

  function drawPath(): void {
    const { minX, maxX, minY, maxY } = viewport.getVisibleBounds();
    prepareContext(pathContext);
    pathContext.beginPath();

    for (let y = minY; y <= maxY; y++) {
      const row = pathBuffer.get(y);
      if (!row) continue;

      row.forEach(x => {
        if (x >= minX && x <= maxX) pathContext.moveTo(x + 0.72, y + 0.5);
        if (x >= minX && x <= maxX) pathContext.arc(x + 0.5, y + 0.5, 0.22, 0, 2 * Math.PI);
      });
    }

    pathContext.fillStyle = pathColor;
    pathContext.fill();
    pathContext.closePath();
  }

  function drawPlayer(): void {
    prepareContext(pointContext);
    pointContext.beginPath();
    pointContext.arc(currentX + 0.5, currentY + 0.5, 0.3, 0, 2 * Math.PI);
    pointContext.fillStyle = pointColor;
    pointContext.fill();
    pointContext.closePath();
  }

  function render(): void {
    drawLabyrinth();
    drawPath();
    drawPlayer();
    onZoomChange(viewport.getZoomPercent());
  }

  function drawPoint(direction?: PointDirection): void {
    if (checkGameState('win') || !structure.length) return;

    if (direction) directionMap[direction](structure, size);

    const row = pathBuffer.get(currentY) ?? new Set<number>();
    row.add(currentX);
    pathBuffer.set(currentY, row);
    viewport.keepCellVisible(currentX, currentY);
    render();

    if (currentX === size - 1 && currentY === size - 1) {
      gameStop();
      resultContainer.style.display = 'flex';

      if (loadBooleanStorageValue(TIMER_KEY, true)) timerStop();
    }
  }

  async function startLabyrinth(): Promise<void> {
    const requestId = ++generationId;
    size = Number(getLabyrinthSize());
    viewport = new Viewport(size);
    currentX = 0;
    currentY = 0;
    pathBuffer.clear();
    resultContainer.style.display = 'none';
    timerStop(false);
    setCanvasSize();
    viewport.fit();
    onZoomChange(viewport.getZoomPercent());
    gameStart();

    if (loadBooleanStorageValue(TIMER_KEY, true)) timerStart();

    const generatedStructure = await generateLabyrinth(size);
    if (requestId !== generationId) return;

    structure = generatedStructure;
    drawPoint();
  }

  function getPointerPosition(event: PointerEvent | WheelEvent): { x: number; y: number } {
    const rect = canvasPoint.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function getPinchData(): { centerX: number; centerY: number; distance: number } | null {
    const pointers = [...activePointers.values()];
    if (pointers.length !== 2) return null;

    const [first, second] = pointers;
    return {
      centerX: (first.x + second.x) / 2,
      centerY: (first.y + second.y) / 2,
      distance: Math.hypot(second.x - first.x, second.y - first.y),
    };
  }

  canvasPoint.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const { x, y } = getPointerPosition(event);
    activePointers.set(event.pointerId, { x, y, startX: x, startY: y });
    canvasPoint.setPointerCapture(event.pointerId);

    if (activePointers.size === 1) {
      hasDragged = false;
      hasPinched = false;
    }

    const pinchData = getPinchData();
    if (pinchData) {
      pinchDistance = pinchData.distance;
      hasPinched = true;
    }
  });

  canvasPoint.addEventListener('pointermove', event => {
    const pointer = activePointers.get(event.pointerId);
    if (!pointer) return;

    const { x, y } = getPointerPosition(event);
    const previousX = pointer.x;
    const previousY = pointer.y;
    pointer.x = x;
    pointer.y = y;

    const pinchData = getPinchData();
    if (pinchData) {
      if (pinchDistance > 0 && pinchData.distance > 0) {
        viewport.zoomAt(pinchData.centerX, pinchData.centerY, pinchData.distance / pinchDistance);
        render();
      }
      pinchDistance = pinchData.distance;
      hasPinched = true;
      return;
    }

    if (Math.hypot(x - pointer.startX, y - pointer.startY) >= PAN_THRESHOLD) hasDragged = true;
    if (hasDragged) {
      viewport.panBy(x - previousX, y - previousY);
      render();
    }
  });

  function finishPointer(event: PointerEvent): void {
    const pointer = activePointers.get(event.pointerId);
    if (!pointer) return;

    activePointers.delete(event.pointerId);
    if (canvasPoint.hasPointerCapture(event.pointerId)) {
      canvasPoint.releasePointerCapture(event.pointerId);
    }

    if (activePointers.size === 1) {
      const remainingPointer = [...activePointers.values()][0];
      remainingPointer.startX = remainingPointer.x;
      remainingPointer.startY = remainingPointer.y;
      pinchDistance = 0;
      return;
    }

    if (activePointers.size > 0) return;

    if (!hasDragged && !hasPinched && loadBooleanStorageValue(FAST_MOVEMENT_KEY, true)) {
      const { x, y } = getPointerPosition(event);
      const cell = viewport.screenToCell(x, y);
      if (cell && pathBuffer.get(cell.y)?.has(cell.x)) {
        currentX = cell.x;
        currentY = cell.y;
        drawPoint();
      }
    }
  }

  canvasPoint.addEventListener('pointerup', finishPointer);
  canvasPoint.addEventListener('pointercancel', finishPointer);
  canvasPoint.addEventListener(
    'wheel',
    event => {
      if (!event.ctrlKey && !event.metaKey) return;

      event.preventDefault();
      const { x, y } = getPointerPosition(event);
      viewport.zoomAt(x, y, Math.exp(-event.deltaY * 0.002));
      render();
    },
    { passive: false },
  );

  function zoomAtCenter(factor: number): void {
    viewport.zoomAt(viewportSize / 2, viewportSize / 2, factor);
    render();
  }

  function fitToScreen(): void {
    viewport.fit();
    render();
  }

  window.addEventListener('resize', () => {
    setCanvasSize();
    render();
  });

  document.addEventListener('keydown', event => {
    const target = event.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLButtonElement
    ) {
      return;
    }

    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      zoomAtCenter(ZOOM_STEP);
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      zoomAtCenter(1 / ZOOM_STEP);
    } else if (event.key === '0') {
      event.preventDefault();
      fitToScreen();
    }
  });

  await startLabyrinth();

  return {
    redrawLabyrinth: startLabyrinth,
    drawPoint,
    zoomIn: () => zoomAtCenter(ZOOM_STEP),
    zoomOut: () => zoomAtCenter(1 / ZOOM_STEP),
    fitToScreen,
  };
}

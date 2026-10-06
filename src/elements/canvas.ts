import {
  formatTime,
  getCurrentTimerValue,
  timerStart,
  timerStop,
} from '../components/Timer/Timer.ts';
import { FAST_MOVEMENT_KEY, MINIMAP_VISIBLE_KEY } from '../constants.ts';
import { calculateShortestPathLength, generateLabyrinth } from '../generator.ts';
import {
  easeOutCubic,
  getAnimationProgress,
  lerp,
  type GoalAnimation,
  type PlayerAnimation,
  type WallHitAnimation,
} from '../game/animations.ts';
import { Viewport } from '../game/Viewport.ts';
import {
  createGameStats,
  getEfficiency,
  getExplorationPercent,
  type GameStats,
} from '../game/gameStats.ts';
import { MinimapRenderer } from '../rendering/MinimapRenderer.ts';
import {
  clearActiveGame,
  loadActiveGame,
  saveActiveGame,
  type RestoredGame,
} from '../game/savedGame.ts';
import type { PointDirection } from '../types.ts';
import {
  checkGameState,
  gameStart,
  gameStop,
  getLabyrinthSize,
  getTimer,
  loadBooleanStorageValue,
  saveStorageValue,
  setLabyrinthSize,
} from '../utils/storage.ts';

const MIN_VIEWPORT_SIZE = 160;
const PAN_THRESHOLD = 8;
const ZOOM_STEP = 1.25;
const PLAYER_MOVE_DURATION = 130;
const WALL_HIT_DURATION = 140;
const GOAL_DURATION = 360;
const MINIMAP_MIN_SIZE = 50;

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
  minimap: HTMLCanvasElement;
  minimapContainer: HTMLDivElement;
  minimapToggle: HTMLButtonElement;
  canvasContainer: HTMLDivElement;
  resultContainer: HTMLDialogElement;
  onZoomChange: (zoomPercent: number) => void;
  onMinimapVisibilityChange: (isVisible: boolean) => void;
}

export async function setupCanvas({
  canvasBackground,
  canvasPath,
  canvasPoint,
  minimap,
  minimapContainer,
  minimapToggle,
  canvasContainer,
  resultContainer,
  onZoomChange,
  onMinimapVisibilityChange,
}: CanvasSetup) {
  const backgroundContext = canvasBackground.getContext('2d')!;
  const pathContext = canvasPath.getContext('2d')!;
  const pointContext = canvasPoint.getContext('2d')!;
  const minimapRenderer = new MinimapRenderer(minimap);

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
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let playerAnimation: PlayerAnimation | null = null;
  let wallHitAnimation: WallHitAnimation | null = null;
  let goalAnimation: GoalAnimation | null = null;
  let animationFrameId: number | null = null;
  let isVictoryPending = false;
  let saveTimeoutId: number | null = null;
  let isTimerPaused = false;
  let isMinimapDragging = false;
  let isMinimapEnabled = loadBooleanStorageValue(MINIMAP_VISIBLE_KEY, true);
  let gameStats: GameStats = createGameStats();
  let winningElapsedTime: number | null = null;

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

  function isMinimapVisible(): boolean {
    return size >= MINIMAP_MIN_SIZE && isMinimapEnabled;
  }

  function updateMinimapVisibility(): void {
    minimapContainer.hidden = !isMinimapVisible();
    minimapToggle.disabled = size < MINIMAP_MIN_SIZE;
    minimapToggle.setAttribute('aria-pressed', String(isMinimapEnabled));
    minimapToggle.setAttribute(
      'aria-label',
      size < MINIMAP_MIN_SIZE
        ? 'Миникарта доступна для лабиринтов от 50 × 50'
        : isMinimapEnabled
          ? 'Скрыть миникарту'
          : 'Показать миникарту',
    );
    minimapToggle.title =
      size < MINIMAP_MIN_SIZE
        ? 'Миникарта доступна для лабиринтов от 50 × 50'
        : 'Показать или скрыть миникарту';
    onMinimapVisibilityChange(isMinimapEnabled);
  }

  function setMinimapVisibility(isVisible: boolean): void {
    isMinimapEnabled = isVisible;
    saveStorageValue(MINIMAP_VISIBLE_KEY, String(isMinimapEnabled));
    updateMinimapVisibility();
    if (isMinimapEnabled) renderMinimap();
  }

  function renderMinimap(): void {
    if (!isMinimapVisible()) return;

    minimapRenderer.render(viewport, {
      playerX: currentX,
      playerY: currentY,
      pathBuffer,
    });
  }

  function persistGame(): void {
    if (!structure.length || checkGameState('win')) return;

    const pathSnapshot = new Map([...pathBuffer].map(([y, columns]) => [y, new Set(columns)]));
    const currentRow = pathSnapshot.get(currentY) ?? new Set<number>();
    currentRow.add(currentX);
    pathSnapshot.set(currentY, currentRow);

    saveActiveGame({
      size,
      structure,
      playerX: currentX,
      playerY: currentY,
      pathBuffer: pathSnapshot,
      viewport: viewport.getSnapshot(),
      elapsedSeconds: getCurrentTimerValue(),
      moves: gameStats.moves,
      visitedCells: gameStats.visitedCells,
      shortestPathLength: gameStats.shortestPathLength,
    });
  }

  function pauseTimer(): void {
    if (isTimerPaused || checkGameState('win')) return;

    timerStop(false);
    isTimerPaused = true;
  }

  function resumeTimer(): void {
    if (!isTimerPaused || checkGameState('win')) return;

    timerStart(getCurrentTimerValue());
    isTimerPaused = false;
  }

  function schedulePersist(): void {
    if (saveTimeoutId !== null) clearTimeout(saveTimeoutId);

    saveTimeoutId = window.setTimeout(() => {
      saveTimeoutId = null;
      persistGame();
    }, 300);
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

  function drawLabyrinth(now: number): void {
    if (!structure.length) return;

    const styles = getComputedStyle(canvasBackground);
    const wallColor = styles.getPropertyValue('--border-canvas-wall').trim();
    const canvasBgColor = styles.getPropertyValue('--bg-canvas').trim();
    const targetColor = styles.getPropertyValue('--target-color').trim();
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
    const targetX = size - 1;
    const targetY = size - 1;
    const poleX = targetX + 0.34;
    const goalProgress = goalAnimation ? getAnimationProgress(goalAnimation, now) : 0;
    const goalScale = goalAnimation ? 1 + Math.sin(goalProgress * Math.PI) * 0.16 : 1;

    backgroundContext.save();
    backgroundContext.translate(targetX + 0.5, targetY + 0.5);
    backgroundContext.scale(goalScale, goalScale);
    backgroundContext.translate(-(targetX + 0.5), -(targetY + 0.5));
    backgroundContext.strokeStyle = targetColor;
    backgroundContext.lineWidth = 0.1;
    backgroundContext.lineCap = 'round';
    backgroundContext.beginPath();
    backgroundContext.moveTo(poleX, targetY + 0.82);
    backgroundContext.lineTo(poleX, targetY + 0.18);
    backgroundContext.stroke();
    backgroundContext.closePath();

    backgroundContext.beginPath();
    backgroundContext.moveTo(poleX, targetY + 0.2);
    backgroundContext.lineTo(targetX + 0.82, targetY + 0.34);
    backgroundContext.lineTo(poleX, targetY + 0.5);
    backgroundContext.closePath();
    backgroundContext.fillStyle = targetColor;
    backgroundContext.fill();

    backgroundContext.restore();
  }

  function drawPath(): void {
    const pathColor = getComputedStyle(canvasPath).getPropertyValue('--figure-color').trim();
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

  function drawPlayer(now: number): void {
    const pointColor = getComputedStyle(canvasPoint).getPropertyValue('--point-color').trim();
    const targetColor = getComputedStyle(canvasPoint).getPropertyValue('--target-color').trim();
    const playerPosition = getPlayerPosition(now);
    prepareContext(pointContext);

    if (goalAnimation) {
      const goalProgress = getAnimationProgress(goalAnimation, now);
      pointContext.globalAlpha = 1 - goalProgress;
      pointContext.strokeStyle = targetColor;
      pointContext.lineWidth = 0.07;
      pointContext.beginPath();
      pointContext.arc(size - 0.5, size - 0.5, 0.3 + goalProgress * 0.85, 0, 2 * Math.PI);
      pointContext.stroke();
      pointContext.closePath();
      pointContext.globalAlpha = 1;
    }

    pointContext.beginPath();
    pointContext.arc(playerPosition.x + 0.5, playerPosition.y + 0.5, 0.3, 0, 2 * Math.PI);
    pointContext.fillStyle = pointColor;
    pointContext.fill();
    pointContext.closePath();
  }

  function render(now = performance.now()): void {
    drawLabyrinth(now);
    drawPath();
    drawPlayer(now);
    renderMinimap();
    onZoomChange(viewport.getZoomPercent());
  }

  function requestRender(): void {
    if (animationFrameId !== null) return;

    animationFrameId = requestAnimationFrame(now => {
      animationFrameId = null;
      const hasActiveAnimations = updateAnimations(now);
      render(now);

      if (hasActiveAnimations) requestRender();
    });
  }

  function updateAnimations(now: number): boolean {
    if (playerAnimation && getAnimationProgress(playerAnimation, now) === 1) {
      addPathPoint(playerAnimation.x, playerAnimation.y);
      trackSuccessfulMove(playerAnimation.x, playerAnimation.y);
      playerAnimation = null;
      persistGame();
    }
    if (wallHitAnimation && getAnimationProgress(wallHitAnimation, now) === 1) {
      wallHitAnimation = null;
    }

    if (goalAnimation && getAnimationProgress(goalAnimation, now) === 1) {
      goalAnimation = null;
      openVictoryDialog();
    }

    if (isVictoryPending && !playerAnimation && !goalAnimation) {
      isVictoryPending = false;

      if (prefersReducedMotion.matches) {
        openVictoryDialog();
      } else {
        goalAnimation = { startedAt: now, duration: GOAL_DURATION };
      }
    }

    return Boolean(playerAnimation || wallHitAnimation || goalAnimation);
  }

  function addPathPoint(x: number, y: number): void {
    const row = pathBuffer.get(y) ?? new Set<number>();
    row.add(x);
    pathBuffer.set(y, row);
  }

  function trackSuccessfulMove(x = currentX, y = currentY): void {
    if (gameStats.moves !== null) gameStats.moves++;
    gameStats.visitedCells.add(y * size + x);
  }

  function getPlayerPosition(now: number): { x: number; y: number } {
    let x = currentX;
    let y = currentY;

    if (playerAnimation) {
      const progress = easeOutCubic(getAnimationProgress(playerAnimation, now));
      x = lerp(playerAnimation.fromX, playerAnimation.x, progress);
      y = lerp(playerAnimation.fromY, playerAnimation.y, progress);
    }

    if (wallHitAnimation) {
      const progress = getAnimationProgress(wallHitAnimation, now);
      const distance = Math.sin(progress * Math.PI) * 0.13;

      if (wallHitAnimation.direction === 'top') y -= distance;
      if (wallHitAnimation.direction === 'right') x += distance;
      if (wallHitAnimation.direction === 'bottom') y += distance;
      if (wallHitAnimation.direction === 'left') x -= distance;
    }

    return { x, y };
  }

  function drawPoint(direction?: PointDirection): void {
    if (checkGameState('win') || !structure.length) return;

    const previousPosition = getPlayerPosition(performance.now());
    const previousX = currentX;
    const previousY = currentY;

    if (direction) directionMap[direction](structure, size);
    const hasMoved = previousX !== currentX || previousY !== currentY;

    if (direction && !hasMoved) {
      if (!prefersReducedMotion.matches) {
        wallHitAnimation = {
          direction,
          startedAt: performance.now(),
          duration: WALL_HIT_DURATION,
        };
        requestRender();
      } else {
        render();
      }

      if (!prefersReducedMotion.matches && 'vibrate' in navigator) navigator.vibrate(12);
      return;
    }

    if (direction && hasMoved && !prefersReducedMotion.matches) {
      if (playerAnimation) {
        addPathPoint(previousX, previousY);
        trackSuccessfulMove(previousX, previousY);
      }

      playerAnimation = {
        fromX: previousPosition.x,
        fromY: previousPosition.y,
        x: currentX,
        y: currentY,
        startedAt: performance.now(),
        duration: PLAYER_MOVE_DURATION,
      };
      wallHitAnimation = null;
    }

    if (!direction || prefersReducedMotion.matches) {
      addPathPoint(currentX, currentY);
      if (direction) trackSuccessfulMove();
      persistGame();
    }
    viewport.keepCellVisible(currentX, currentY);
    requestRender();

    if (currentX === size - 1 && currentY === size - 1) {
      gameStop();
      const elapsedTime = timerStop();
      isTimerPaused = false;
      winningElapsedTime = elapsedTime;
      clearActiveGame();

      isVictoryPending = true;
    }
  }

  function openVictoryDialog(): void {
    if (resultContainer.open) return;

    updateVictoryStats(winningElapsedTime ?? getCurrentTimerValue());
    resultContainer.showModal();
    const nextLevelButton = resultContainer.querySelector<HTMLButtonElement>('#next-level');
    const newLevelButton = resultContainer.querySelector<HTMLButtonElement>('#new-level');
    (nextLevelButton?.hidden ? newLevelButton : nextLevelButton)?.focus();
  }

  function updateVictoryStats(elapsedTime: number): void {
    const sizeElement = resultContainer.querySelector<HTMLElement>('#result-size');
    const timeElement = resultContainer.querySelector<HTMLElement>('#result-time');
    const bestTimeElement = resultContainer.querySelector<HTMLElement>('#result-best-time');

    if (sizeElement) sizeElement.textContent = `${size} × ${size}`;
    if (timeElement) timeElement.textContent = formatTime(elapsedTime);
    if (bestTimeElement) bestTimeElement.textContent = formatTime(getTimer());

    const movesElement = resultContainer.querySelector<HTMLElement>('#result-moves');
    const visitedElement = resultContainer.querySelector<HTMLElement>('#result-visited');
    const explorationElement = resultContainer.querySelector<HTMLElement>('#result-exploration');
    const shortestPathElement = resultContainer.querySelector<HTMLElement>('#result-shortest-path');
    const efficiencyElement = resultContainer.querySelector<HTMLElement>('#result-efficiency');
    const totalCells = size * size;
    const exploration = getExplorationPercent(gameStats, totalCells);
    const efficiency = getEfficiency(gameStats);

    if (movesElement) {
      movesElement.textContent = gameStats.moves?.toString() ?? '—';
    }
    if (visitedElement) {
      visitedElement.textContent = `${gameStats.visitedCells.size} / ${totalCells}`;
    }
    if (explorationElement) {
      explorationElement.textContent = `${exploration}%`;
    }
    if (shortestPathElement) {
      shortestPathElement.textContent = gameStats.shortestPathLength?.toString() ?? '—';
    }
    if (efficiencyElement) {
      efficiencyElement.textContent = efficiency === null ? '—' : `${efficiency}%`;
    }
  }

  function resetGameState(): void {
    pathBuffer.clear();
    playerAnimation = null;
    wallHitAnimation = null;
    goalAnimation = null;
    isVictoryPending = false;
    winningElapsedTime = null;
    if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    if (saveTimeoutId !== null) clearTimeout(saveTimeoutId);
    saveTimeoutId = null;
    if (resultContainer.open) resultContainer.close();
    timerStop(false);
    isTimerPaused = false;
  }

  async function startNewLabyrinth(): Promise<void> {
    const requestId = ++generationId;
    size = Number(getLabyrinthSize());
    viewport = new Viewport(size);
    structure = new Uint8Array();
    currentX = 0;
    currentY = 0;
    gameStats = createGameStats();
    winningElapsedTime = null;
    clearActiveGame();
    resetGameState();
    setCanvasSize();
    viewport.fit();
    onZoomChange(viewport.getZoomPercent());
    gameStart();

    timerStart();
    isTimerPaused = false;

    const generatedLabyrinth = await generateLabyrinth(size);
    if (requestId !== generationId) return;

    structure = generatedLabyrinth.structure;
    gameStats.shortestPathLength = generatedLabyrinth.shortestPathLength;
    minimapRenderer.setMaze(structure, size);
    updateMinimapVisibility();
    drawPoint();
    canvasPoint.focus({ preventScroll: true });
  }

  function restoreLabyrinth(savedGame: RestoredGame): void {
    size = savedGame.size;
    setLabyrinthSize(size);
    viewport = new Viewport(size);
    currentX = savedGame.playerX;
    currentY = savedGame.playerY;
    winningElapsedTime = null;
    resetGameState();
    savedGame.pathBuffer.forEach((columns, y) => pathBuffer.set(y, new Set(columns)));
    structure = savedGame.structure;
    gameStats = {
      moves: savedGame.moves,
      visitedCells: savedGame.visitedCells,
      shortestPathLength: savedGame.shortestPathLength,
    };
    minimapRenderer.setMaze(structure, size);
    setCanvasSize();
    viewport.restore(savedGame.viewport);
    updateMinimapVisibility();
    gameStart();
    timerStart(savedGame.elapsedSeconds);
    isTimerPaused = false;
    render();
    canvasPoint.focus({ preventScroll: true });

    if (gameStats.shortestPathLength === null) {
      void calculateShortestPathLength(structure.slice(), size).then(shortestPathLength => {
        gameStats.shortestPathLength = shortestPathLength;
        persistGame();
      });
    }
  }

  function getPointerPosition(event: PointerEvent | WheelEvent): { x: number; y: number } {
    const rect = canvasPoint.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function centerViewportFromMinimap(event: PointerEvent): void {
    const rect = minimap.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * size;
    const y = ((event.clientY - rect.top) / rect.height) * size;

    viewport.centerOn(x, y);
    render();
    schedulePersist();
  }

  minimap.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    isMinimapDragging = true;
    minimap.setPointerCapture(event.pointerId);
    centerViewportFromMinimap(event);
  });

  minimap.addEventListener('pointermove', event => {
    if (!isMinimapDragging) return;

    centerViewportFromMinimap(event);
  });

  function finishMinimapPointer(event: PointerEvent): void {
    isMinimapDragging = false;
    if (minimap.hasPointerCapture(event.pointerId)) minimap.releasePointerCapture(event.pointerId);
  }

  minimap.addEventListener('pointerup', finishMinimapPointer);
  minimap.addEventListener('pointercancel', finishMinimapPointer);

  minimapToggle.addEventListener('click', () => {
    setMinimapVisibility(!isMinimapEnabled);
  });

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
        schedulePersist();
      }
      pinchDistance = pinchData.distance;
      hasPinched = true;
      return;
    }

    if (Math.hypot(x - pointer.startX, y - pointer.startY) >= PAN_THRESHOLD) hasDragged = true;
    if (hasDragged) {
      viewport.panBy(x - previousX, y - previousY);
      render();
      schedulePersist();
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
      schedulePersist();
    },
    { passive: false },
  );

  function zoomAtPlayer(factor: number): void {
    const playerScreenX = viewport.offsetX + currentX * viewport.scale;
    const playerScreenY = viewport.offsetY + currentY * viewport.scale;

    viewport.zoomAt(playerScreenX, playerScreenY, factor);
    render();
    schedulePersist();
  }

  function fitToScreen(): void {
    viewport.fit();
    render();
    schedulePersist();
  }

  window.addEventListener('resize', () => {
    setCanvasSize();
    render();
    schedulePersist();
  });

  window.addEventListener('pagehide', () => {
    pauseTimer();
    persistGame();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      pauseTimer();
      persistGame();
    } else {
      resumeTimer();
    }
  });

  document.addEventListener('themechange', () => {
    minimapRenderer.invalidateTheme();
    render();
  });
  prefersReducedMotion.addEventListener('change', () => {
    if (!prefersReducedMotion.matches) return;

    playerAnimation = null;
    wallHitAnimation = null;
    if (goalAnimation) {
      goalAnimation = null;
      openVictoryDialog();
    }
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
      zoomAtPlayer(ZOOM_STEP);
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      zoomAtPlayer(1 / ZOOM_STEP);
    } else if (event.key === '0') {
      event.preventDefault();
      fitToScreen();
    }
  });

  const savedGame = loadActiveGame();
  if (savedGame) {
    restoreLabyrinth(savedGame);
  } else {
    await startNewLabyrinth();
  }

  return {
    redrawLabyrinth: startNewLabyrinth,
    drawPoint,
    zoomIn: () => zoomAtPlayer(ZOOM_STEP),
    zoomOut: () => zoomAtPlayer(1 / ZOOM_STEP),
    fitToScreen,
    setMinimapVisibility,
  };
}

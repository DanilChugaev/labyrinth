import type { Viewport } from '../game/Viewport.ts';

interface MinimapState {
  playerX: number;
  playerY: number;
  pathBuffer: Map<number, Set<number>>;
}

export class MinimapRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly baseCanvas = document.createElement('canvas');
  private readonly baseContext = this.baseCanvas.getContext('2d')!;
  private structure = new Uint8Array();
  private size = 0;
  private pixelSize = 0;
  private devicePixelRatio = 1;
  private shouldRedrawBase = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d')!;
  }

  setMaze(structure: Uint8Array, size: number): void {
    this.structure = structure;
    this.size = size;
    this.shouldRedrawBase = true;
  }

  invalidateTheme(): void {
    this.shouldRedrawBase = true;
  }

  render(viewport: Viewport, state: MinimapState): void {
    if (!this.structure.length || this.size === 0) return;

    this.resize();
    if (this.shouldRedrawBase) this.drawBase();

    this.context.clearRect(0, 0, this.pixelSize, this.pixelSize);
    this.context.drawImage(this.baseCanvas, 0, 0);

    const scale = this.pixelSize / this.size;
    const styles = getComputedStyle(this.canvas);
    const pathColor = styles.getPropertyValue('--figure-color').trim();
    const pointColor = styles.getPropertyValue('--point-color').trim();
    const targetColor = styles.getPropertyValue('--target-color').trim();
    const focusColor = styles.getPropertyValue('--border-focus').trim();

    this.context.fillStyle = pathColor;
    this.context.globalAlpha = 0.5;
    state.pathBuffer.forEach((columns, y) => {
      columns.forEach(x =>
        this.context.fillRect(x * scale, y * scale, Math.max(scale, 1), Math.max(scale, 1)),
      );
    });
    this.context.globalAlpha = 1;

    this.context.fillStyle = targetColor;
    this.context.fillRect(
      (this.size - 1) * scale,
      (this.size - 1) * scale,
      Math.max(scale * 1.5, 3 * this.devicePixelRatio),
      Math.max(scale * 1.5, 3 * this.devicePixelRatio),
    );

    const bounds = viewport.getWorldBounds();
    this.context.fillStyle = 'rgba(255, 255, 255, 0.18)';
    this.context.fillRect(
      bounds.minX * scale,
      bounds.minY * scale,
      Math.max((bounds.maxX - bounds.minX) * scale, 1),
      Math.max((bounds.maxY - bounds.minY) * scale, 1),
    );
    this.context.strokeStyle = focusColor;
    this.context.lineWidth = Math.max(this.devicePixelRatio, 1);
    this.context.strokeRect(
      bounds.minX * scale,
      bounds.minY * scale,
      Math.max((bounds.maxX - bounds.minX) * scale, this.context.lineWidth),
      Math.max((bounds.maxY - bounds.minY) * scale, this.context.lineWidth),
    );

    this.context.beginPath();
    this.context.arc(
      (state.playerX + 0.5) * scale,
      (state.playerY + 0.5) * scale,
      Math.max(scale * 0.9, 3 * this.devicePixelRatio),
      0,
      2 * Math.PI,
    );
    this.context.fillStyle = pointColor;
    this.context.fill();
  }

  private resize(): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const nextDevicePixelRatio = window.devicePixelRatio || 1;
    const nextPixelSize = Math.round(Math.min(width, height) * nextDevicePixelRatio);

    if (this.pixelSize === nextPixelSize && this.devicePixelRatio === nextDevicePixelRatio) return;

    this.pixelSize = nextPixelSize;
    this.devicePixelRatio = nextDevicePixelRatio;
    this.canvas.width = nextPixelSize;
    this.canvas.height = nextPixelSize;
    this.baseCanvas.width = nextPixelSize;
    this.baseCanvas.height = nextPixelSize;
    this.shouldRedrawBase = true;
  }

  private drawBase(): void {
    const styles = getComputedStyle(this.canvas);
    const backgroundColor = styles.getPropertyValue('--bg-canvas').trim();
    const wallColor = styles.getPropertyValue('--border-canvas-wall').trim();
    const scale = this.pixelSize / this.size;

    this.baseContext.clearRect(0, 0, this.pixelSize, this.pixelSize);
    this.baseContext.fillStyle = backgroundColor;
    this.baseContext.fillRect(0, 0, this.pixelSize, this.pixelSize);
    this.baseContext.strokeStyle = wallColor;
    this.baseContext.lineWidth = Math.max(this.devicePixelRatio * 0.6, 0.5);
    this.baseContext.beginPath();

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const borders = this.structure[y * this.size + x];

        if ((borders & 1) !== 0) {
          this.baseContext.moveTo(x * scale, y * scale);
          this.baseContext.lineTo((x + 1) * scale, y * scale);
        }
        if ((borders & 8) !== 0) {
          this.baseContext.moveTo(x * scale, y * scale);
          this.baseContext.lineTo(x * scale, (y + 1) * scale);
        }
        if (x === this.size - 1 && (borders & 2) !== 0) {
          this.baseContext.moveTo((x + 1) * scale, y * scale);
          this.baseContext.lineTo((x + 1) * scale, (y + 1) * scale);
        }
        if (y === this.size - 1 && (borders & 4) !== 0) {
          this.baseContext.moveTo(x * scale, (y + 1) * scale);
          this.baseContext.lineTo((x + 1) * scale, (y + 1) * scale);
        }
      }
    }

    this.baseContext.stroke();
    this.baseContext.closePath();
    this.shouldRedrawBase = false;
  }
}

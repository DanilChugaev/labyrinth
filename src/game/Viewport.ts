export class Viewport {
  private readonly worldSize: number;
  private width = 1;
  private height = 1;
  private minScale = 1;
  private maxScale = 1;

  scale = 1;
  offsetX = 0;
  offsetY = 0;

  constructor(worldSize: number) {
    this.worldSize = worldSize;
  }

  setSize(width: number, height: number, shouldFit = false): void {
    this.width = width;
    this.height = height;
    this.minScale = Math.min(width, height) / this.worldSize;
    this.maxScale = Math.max(this.minScale, Math.min(72, this.minScale * 16));

    if (shouldFit) {
      this.fit();
      return;
    }

    this.scale = this.clampScale(this.scale);
    this.clampPosition();
  }

  fit(): void {
    this.scale = this.minScale;
    this.offsetX = (this.width - this.worldPixelSize) / 2;
    this.offsetY = (this.height - this.worldPixelSize) / 2;
  }

  zoomAt(screenX: number, screenY: number, factor: number): void {
    const worldX = (screenX - this.offsetX) / this.scale;
    const worldY = (screenY - this.offsetY) / this.scale;
    const nextScale = this.clampScale(this.scale * factor);

    if (nextScale === this.scale) return;

    this.scale = nextScale;
    this.offsetX = screenX - worldX * this.scale;
    this.offsetY = screenY - worldY * this.scale;
    this.clampPosition();
  }

  panBy(deltaX: number, deltaY: number): void {
    this.offsetX += deltaX;
    this.offsetY += deltaY;
    this.clampPosition();
  }

  keepCellVisible(x: number, y: number): void {
    const marginX = this.width * 0.2;
    const marginY = this.height * 0.2;
    const screenX = this.offsetX + (x + 0.5) * this.scale;
    const screenY = this.offsetY + (y + 0.5) * this.scale;

    if (screenX < marginX) this.offsetX += marginX - screenX;
    if (screenX > this.width - marginX) this.offsetX -= screenX - (this.width - marginX);
    if (screenY < marginY) this.offsetY += marginY - screenY;
    if (screenY > this.height - marginY) this.offsetY -= screenY - (this.height - marginY);

    this.clampPosition();
  }

  getZoomPercent(): number {
    return Math.round((this.scale / this.minScale) * 100);
  }

  getVisibleBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
    return {
      minX: Math.max(0, Math.floor(-this.offsetX / this.scale) - 1),
      maxX: Math.min(this.worldSize - 1, Math.ceil((this.width - this.offsetX) / this.scale) + 1),
      minY: Math.max(0, Math.floor(-this.offsetY / this.scale) - 1),
      maxY: Math.min(this.worldSize - 1, Math.ceil((this.height - this.offsetY) / this.scale) + 1),
    };
  }

  screenToCell(screenX: number, screenY: number): { x: number; y: number } | null {
    const x = Math.floor((screenX - this.offsetX) / this.scale);
    const y = Math.floor((screenY - this.offsetY) / this.scale);

    if (x < 0 || y < 0 || x >= this.worldSize || y >= this.worldSize) return null;

    return { x, y };
  }

  private get worldPixelSize(): number {
    return this.worldSize * this.scale;
  }

  private clampScale(scale: number): number {
    return Math.min(Math.max(scale, this.minScale), this.maxScale);
  }

  private clampPosition(): void {
    const worldPixelSize = this.worldPixelSize;

    this.offsetX = this.clampOffset(this.offsetX, this.width, worldPixelSize);
    this.offsetY = this.clampOffset(this.offsetY, this.height, worldPixelSize);
  }

  private clampOffset(offset: number, viewportSize: number, worldPixelSize: number): number {
    if (worldPixelSize <= viewportSize) return (viewportSize - worldPixelSize) / 2;

    return Math.min(0, Math.max(viewportSize - worldPixelSize, offset));
  }
}

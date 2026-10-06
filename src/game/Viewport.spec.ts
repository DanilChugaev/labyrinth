import { describe, expect, it } from 'vitest';
import { Viewport } from './Viewport.ts';

describe('Viewport', () => {
  it('должен вписывать лабиринт в viewport', () => {
    const viewport = new Viewport(10);
    viewport.setSize(200, 100, true);

    expect(viewport.scale).toBe(10);
    expect(viewport.offsetX).toBe(50);
    expect(viewport.offsetY).toBe(0);
  });

  it('должен ограничивать центрирование границами лабиринта', () => {
    const viewport = new Viewport(100);
    viewport.setSize(100, 100, true);
    viewport.zoomAt(50, 50, 4);
    viewport.centerOn(-10, -10);

    expect(viewport.getWorldBounds()).toMatchObject({ minX: 0, minY: 0 });
  });

  it('должен сохранить и восстановить положение камеры', () => {
    const viewport = new Viewport(100);
    viewport.setSize(200, 200, true);
    viewport.zoomAt(100, 100, 3);
    viewport.centerOn(70, 30);
    const snapshot = viewport.getSnapshot();

    const restoredViewport = new Viewport(100);
    restoredViewport.setSize(200, 200, true);
    restoredViewport.restore(snapshot);

    expect(restoredViewport.getSnapshot()).toEqual(snapshot);
  });
});

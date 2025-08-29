import type { Labyrinth } from './types.ts';
import { runWorker } from './worker/runWorker.ts';

export async function generateLabyrinth(size: number): Promise<Labyrinth> {
  const worker = new Worker('src/worker/worker.ts', { type: 'module' });

  return await runWorker<number, Labyrinth>(worker, size);
}

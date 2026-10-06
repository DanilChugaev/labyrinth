import { runWorker } from './worker/runWorker.ts';
import type { GeneratedLabyrinth, WorkerRequest } from './worker/worker.ts';

export async function generateLabyrinth(size: number): Promise<GeneratedLabyrinth> {
  const worker = new Worker(new URL('./worker/worker.ts', import.meta.url), { type: 'module' });

  return await runWorker<WorkerRequest, GeneratedLabyrinth>(worker, { type: 'generate', size });
}

export async function calculateShortestPathLength(
  structure: Uint8Array,
  size: number,
): Promise<number | null> {
  const worker = new Worker(new URL('./worker/worker.ts', import.meta.url), { type: 'module' });

  return await runWorker<WorkerRequest, number | null>(worker, {
    type: 'shortest-path',
    size,
    structure,
  });
}

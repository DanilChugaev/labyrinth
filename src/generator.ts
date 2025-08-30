import { runWorker } from './worker/runWorker.ts';

export async function generateLabyrinth(size: number): Promise<Uint8Array> {
  const worker = new Worker('src/worker/worker.ts', { type: 'module' });

  return await runWorker<number, Uint8Array>(worker, size);
}

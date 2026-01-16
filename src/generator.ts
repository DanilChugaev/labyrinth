import { runWorker } from './worker/runWorker.ts';

export async function generateLabyrinth(size: number): Promise<Uint8Array> {
  const worker = new Worker(new URL('./worker/worker.ts', import.meta.url), { type: 'module' });

  return await runWorker<number, Uint8Array>(worker, size);
}

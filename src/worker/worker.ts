import { findShortestPathLength } from '../game/pathfinding.ts';
import { generateStructure } from './generateStructure.ts';

self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  if (event.data.type === 'generate') {
    const structure = generateStructure(event.data.size);
    self.postMessage({
      structure,
      shortestPathLength: findShortestPathLength(structure, event.data.size),
    } satisfies GeneratedLabyrinth);
    return;
  }

  self.postMessage(findShortestPathLength(event.data.structure, event.data.size));
});

export interface GeneratedLabyrinth {
  structure: Uint8Array;
  shortestPathLength: number | null;
}

export type WorkerRequest =
  | { type: 'generate'; size: number }
  | { type: 'shortest-path'; size: number; structure: Uint8Array };

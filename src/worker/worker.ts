import { generateStructure } from './generateStructure.ts';

self.addEventListener('message', (event: { data: number }) => {
  self.postMessage(generateStructure(event.data));
});

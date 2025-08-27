import { createBorders } from './createBorders.ts';

self.addEventListener('message', event => {
  self.postMessage(createBorders(event.data.obj, event.data.size));
});

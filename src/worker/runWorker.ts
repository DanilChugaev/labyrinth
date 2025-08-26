export function runWorker<D, R>(worker: Worker, data: D): Promise<R> {
  return new Promise((resolve, reject) => {
    worker.onmessage = (event: MessageEvent) => {
      resolve(event.data);
    };

    worker.onerror = (error: ErrorEvent) => {
      reject(error);
    };

    worker.postMessage(data);
  });
}

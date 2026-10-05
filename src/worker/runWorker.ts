export function runWorker<D, R>(worker: Worker, data: D): Promise<R> {
  return new Promise((resolve, reject) => {
    worker.onmessage = (event: MessageEvent<R>) => {
      worker.terminate();
      resolve(event.data);
    };

    worker.onerror = (error: ErrorEvent) => {
      worker.terminate();
      reject(error);
    };

    worker.postMessage(data);
  });
}

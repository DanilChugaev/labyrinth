import type { Heap } from '../types.ts';

export class PriorityQueue {
  private heap: Heap[] = [];

  private swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (this.heap[parent].weight > this.heap[index].weight) {
        this.swap(parent, index);
        index = parent;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number) {
    const length = this.heap.length;

    while (true) {
      let min = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.heap[left].weight < this.heap[min].weight) {
        min = left;
      }

      if (right < length && this.heap[right].weight < this.heap[min].weight) {
        min = right;
      }

      if (min !== index) {
        this.swap(index, min);
        index = min;
      } else {
        break;
      }
    }
  }

  enqueue(item: Heap) {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): Heap | undefined {
    if (this.heap.length === 0) return undefined;

    const min = this.heap[0];
    const end = this.heap.pop()!;

    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.bubbleDown(0);
    }

    return min;
  }
}

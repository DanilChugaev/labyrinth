interface Heap {
  weight: number;
  idx: number; // индекс клетки y * size + x
  prevIdx: number; // индекс предыдущей клетки prevY * size + prevX
}

export class PriorityQueue {
  private weights: Uint32Array;
  private indexes: Uint32Array;
  private prevIndexes: Uint32Array;
  private size: number;
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
    this.weights = new Uint32Array(this.maxSize);
    this.indexes = new Uint32Array(this.maxSize);
    this.prevIndexes = new Uint32Array(this.maxSize);
    this.size = 0;
  }

  private swap(i: number, j: number) {
    [this.weights[i], this.weights[j]] = [this.weights[j], this.weights[i]];
    [this.indexes[i], this.indexes[j]] = [this.indexes[j], this.indexes[i]];
    [this.prevIndexes[i], this.prevIndexes[j]] = [this.prevIndexes[j], this.prevIndexes[i]];
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (this.weights[parent] > this.weights[index]) {
        this.swap(parent, index);
        index = parent;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number) {
    while (true) {
      let min = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < this.size && this.weights[left] < this.weights[min]) {
        min = left;
      }

      if (right < this.size && this.weights[right] < this.weights[min]) {
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
    const index = this.size++;

    this.weights[index] = item.weight;
    this.indexes[index] = item.idx;
    this.prevIndexes[index] = item.prevIdx;

    this.bubbleUp(index);
  }

  dequeue(): Heap | undefined {
    if (this.size === 0) return undefined;

    const min = {
      weight: this.weights[0],
      idx: this.indexes[0],
      prevIdx: this.prevIndexes[0],
    };

    this.size--;

    if (this.size > 0) {
      this.weights[0] = this.weights[this.size];
      this.indexes[0] = this.indexes[this.size];
      this.prevIndexes[0] = this.prevIndexes[this.size];

      this.bubbleDown(0);
    }

    return min;
  }
}

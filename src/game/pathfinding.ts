const directions = [
  { dx: 0, dy: -1, border: 1 },
  { dx: 1, dy: 0, border: 2 },
  { dx: 0, dy: 1, border: 4 },
  { dx: -1, dy: 0, border: 8 },
];

export function findShortestPathLength(structure: Uint8Array, size: number): number | null {
  const totalCells = size * size;
  if (structure.length !== totalCells) return null;

  const distances = new Int32Array(totalCells);
  distances.fill(-1);
  const queue = new Uint32Array(totalCells);
  let head = 0;
  let tail = 0;

  queue[tail++] = 0;
  distances[0] = 0;

  while (head < tail) {
    const index = queue[head++];
    if (index === totalCells - 1) return distances[index];

    const x = index % size;
    const y = Math.floor(index / size);

    for (const direction of directions) {
      if ((structure[index] & direction.border) !== 0) continue;

      const nextX = x + direction.dx;
      const nextY = y + direction.dy;
      if (nextX < 0 || nextY < 0 || nextX >= size || nextY >= size) continue;

      const nextIndex = nextY * size + nextX;
      if (distances[nextIndex] !== -1) continue;

      distances[nextIndex] = distances[index] + 1;
      queue[tail++] = nextIndex;
    }
  }

  return null;
}

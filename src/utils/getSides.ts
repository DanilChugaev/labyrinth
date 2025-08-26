export function getSides(y: number, x: number) {
  return {
    top: y - 1,
    right: x + 1,
    bottom: y + 1,
    left: x - 1,
  };
}

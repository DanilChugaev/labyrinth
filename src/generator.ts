function getRandomNumber(min: number, max: number): number {
  // Ensure min and max are integers and min <= max
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getArr() {
  const size = 10
  const length = size*size
  const arr = []

  for (let i = 0; i < length; i++) {
    arr[i] = getRandomNumber(1, 9)
  }

  return arr
}
import { getArr } from './generator.ts'

export function setupCanvas(element: HTMLCanvasElement) {
  const { innerWidth: windowWidth, innerHeight: windowHeight } = window;

  const canvasSize = windowWidth < windowHeight ? windowWidth - 48 : windowHeight - 48 - 56 - 16;

  element.width = canvasSize;
  element.height = canvasSize;

  const ctx = element.getContext("2d")!;
  const size = 15
  const arr = getArr(size);

  const cellSize = canvasSize / size;
  ctx.font = "16px serif";


  let k = 0
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      ctx.fillStyle = "#29a3c3";
      ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
      ctx.strokeStyle = "#2b4b9e";
      ctx.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
      ctx.fillStyle = "rgb(0,0,0)";
      ctx.fillText(String(arr[k++]), x*cellSize + 10, y*cellSize + 30);
    }
  }
}

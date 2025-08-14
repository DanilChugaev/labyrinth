import { generateLabyrinth } from './generator.ts'
import type { Labyrinth } from './types.ts';

export function setupCanvas(element: HTMLCanvasElement) {
  const { innerWidth: windowWidth, innerHeight: windowHeight } = window;

  const canvasSize = windowWidth < windowHeight ? windowWidth - 48 : windowHeight - 48 - 56 - 16;

  element.width = canvasSize;
  element.height = canvasSize;

  const ctx = element.getContext("2d")!;
  const size = 15
  const obj: Labyrinth = generateLabyrinth(size);

  const cellSize = canvasSize / size;
  ctx.font = "16px serif";

  /**
   * проход по массиву надо другой сделать
   * типа есть 2 массива - исходный и массив с посещенными вершинами
   * берем первый элемент массива - это будет стартовая точка
   * смотрим его соседей neighbour
   * top neighbour[y-1][x] = undefined
   * right neighbour[y][x+1] = число
   * bottom neighbour[y+1][x] = число
   * left neighbour[y][x-1] = undefined
   * возможно исходный массив надо сделать двумерным
   */
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      ctx.fillStyle = "#29a3c3";
      ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
      ctx.strokeStyle = "#2b4b9e";
      ctx.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
      ctx.fillStyle = "rgb(0,0,0)";
      ctx.fillText(String(obj[y][x].weight), x*cellSize + 10, y*cellSize + 30);
    }
  }
}

export interface Cell {
  y: number;
  x: number;
  weight: number;
  neighbours: Labyrinth;
}

export type Y = number
export type X = number
export type Labyrinth = Record<Y, Record<X, Cell>>
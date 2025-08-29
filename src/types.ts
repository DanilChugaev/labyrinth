export interface Border {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export type Y = number;
export type X = number;

export interface Cell {
  y: Y;
  x: X;
  weight: number;
  isVisited: boolean;
  borders?: Border;
}

export type Labyrinth = Record<Y, Record<X, Cell>>;

export interface Heap {
  weight: number;
  y: Y;
  x: X;
  prevY: number;
  prevX: number;
}

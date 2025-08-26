import { UniqueRandomNumberGenerator } from './utils/UniqueRandomNumberGenerator.ts';

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
  neighbours?: Labyrinth;
  borders?: Border;
}

export type Labyrinth = Record<Y, Record<X, Cell>>;

export interface NeighbourGeneratorParams {
  obj: Labyrinth;
  y: number;
  x: number;
  generator: UniqueRandomNumberGenerator;
}

export interface MinWeightVertex {
  value: Cell | undefined;
}

export interface PrevCoordVertex {
  y: Y;
  x: X;
}

import type { PointDirection } from '../types.ts';

export interface Position {
  x: number;
  y: number;
}

export interface PlayerAnimation extends Position {
  fromX: number;
  fromY: number;
  startedAt: number;
  duration: number;
}

export interface WallHitAnimation {
  direction: PointDirection;
  startedAt: number;
  duration: number;
}

export interface GoalAnimation {
  startedAt: number;
  duration: number;
}

export function getAnimationProgress(
  animation: Pick<PlayerAnimation | WallHitAnimation | GoalAnimation, 'startedAt' | 'duration'>,
  now: number,
): number {
  return Math.min(Math.max((now - animation.startedAt) / animation.duration, 0), 1);
}

export function easeOutCubic(progress: number): number {
  return 1 - (1 - progress) ** 3;
}

export function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

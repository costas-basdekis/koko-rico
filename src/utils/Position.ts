import { CustomMap } from "./CustomMap";

export interface Position {
  x: number;
  y: number;
}

export function getPositionKey(position: Position): string {
  return `${position.x},${position.y}`;
}

export function getPositionsKey(positions: Position[]): string {
  return positions.map(getPositionKey).join("|");
}

export function positionsEqual(left: Position, right: Position): boolean {
  return left === right || (left.x === right.x && left.y === right.y);
}

export function positionDistance(left: Position, right: Position): number {
  const dX = right.x - left.x;
  const dY = right.y - left.y;
  return Math.sqrt(dX * dX + dY * dY);
}

export class PositionMap<V> extends CustomMap.makeType(getPositionKey)<V> {}

export class PositionsMap<V> extends CustomMap.makeType(getPositionsKey)<V> {}

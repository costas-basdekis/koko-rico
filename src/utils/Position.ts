export interface Position {
  x: number;
  y: number;
}

export function positionsEqual(left: Position, right: Position): boolean {
  return left.x === right.x && left.y === right.y;
}

export interface Position {
  x: number;
  y: number;
}

export function getPositionKey(position: Position): string {
  return `${position.x},${position.y}`;
}

export function positionsEqual(left: Position, right: Position): boolean {
  return (left === right) || (left.x === right.x && left.y === right.y);
}

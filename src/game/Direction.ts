import { Position } from "../utils";

export enum Direction {
  Left = "left",
  Right = "right",
  Up = "up",
  Down = "down",
}

export function getPositionsDirection(from: Position, to: Position): Direction | null {
  if (from.x < to.x) {
    return Direction.Right;
  } else if (from.x > to.x) {
    return Direction.Left;
  } else if (from.y < to.y) {
    return Direction.Down;
  } else if (from.y > to.y) {
    return Direction.Up;
  }
  return null;
}

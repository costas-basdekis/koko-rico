import { Position } from "../utils";

export class Robot {
  position: Position;
  index: number;

  constructor(position: Position, index: number) {
    this.position = position;
    this.index = index;
  }
}

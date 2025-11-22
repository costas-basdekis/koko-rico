import { Position } from "../utils";

export class Robot {
  position: Position;
  index: number;

  static deserialise({
    position,
    index,
  }: ReturnType<Robot["serialise"]>): Robot {
    return new Robot(position, index);
  }

  constructor(position: Position, index: number) {
    this.position = position;
    this.index = index;
  }

  serialise(): {
    position: Position;
    index: number;
  } {
    return {
      position: this.position,
      index: this.index,
    };
  }

  moveTo(newPosition: Position): Robot {
    return new Robot(newPosition, this.index);
  }
}

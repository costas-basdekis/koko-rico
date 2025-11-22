import _ from "underscore";
import { Position, PositionMap } from "../utils";

export type Walls = PositionMap<boolean>;

export type WallType = "left" | "top";

export class Field {
  width: number;
  height: number;
  topWalls: Walls;
  leftWalls: Walls;

  static makeForSize(width: number, height: number): Field {
    return new Field(
      width,
      height,
      new PositionMap(
        _.range(height + 1).flatMap((y) =>
          _.range(width).map(
            (x) => [{ x, y }, y === 0 || y === height] as [Position, boolean]
          )
        )
      ),
      new PositionMap(
        _.range(height).flatMap((y) =>
          _.range(width + 1).map(
            (x) => [{ x, y }, x === 0 || x === width] as [Position, boolean]
          )
        )
      )
    );
  }

  static deserialise({
    width,
    height,
    topWalls,
    leftWalls,
  }: ReturnType<Field["serialise"]>): Field {
    return new Field(
      width,
      height,
      PositionMap.deserialise<boolean>(topWalls),
      PositionMap.deserialise<boolean>(leftWalls),
    );
  }

  constructor(
    width: number,
    height: number,
    topWalls: Walls,
    leftWalls: Walls
  ) {
    this.width = width;
    this.height = height;
    this.topWalls = topWalls;
    this.leftWalls = leftWalls;
  }

  serialise(): {
    width: number;
    height: number;
    topWalls: ReturnType<PositionMap<boolean>["serialise"]>;
    leftWalls: ReturnType<PositionMap<boolean>["serialise"]>;
  } {
    return {
      width: this.width,
      height: this.height,
      topWalls: this.topWalls.serialise(),
      leftWalls: this.leftWalls.serialise(),
    }
  }

  private _change({
    topWalls = this.topWalls,
    leftWalls = this.leftWalls,
  }: {
    topWalls?: PositionMap<boolean>;
    leftWalls?: PositionMap<boolean>;
  }) {
    const field = new Field(
      this.width,
      this.height,
      topWalls,
      leftWalls
    );
    field._positions = this._positions;
    return field;
  }

  toggleWall(position: Position, type: WallType): Field {
    let topWalls = this.topWalls;
    let leftWalls = this.leftWalls;
    if (type === "left") {
      leftWalls = new PositionMap(leftWalls);
      leftWalls.set(position, !leftWalls.get(position));
    } else {
      topWalls = new PositionMap(topWalls);
      const previous = topWalls.get(position);
      topWalls.set(position, !previous);
    }
    return this._change({ topWalls, leftWalls });
  }

  private _positions?: Position[] = undefined;

  get positions(): Position[] {
    if (!this._positions) {
      this._positions = _.range(this.width).flatMap((x) =>
        _.range(this.height).map((y) => ({ x, y }))
      );
    }
    return this._positions!;
  }
}

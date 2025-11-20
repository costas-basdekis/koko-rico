import { Position, PositionMap, positionsEqual } from "../utils";
import { Direction } from "./Direction";
import { WallType } from "./Field";
import { Game } from "./Game";
import { Robot } from "./Robot";

export interface OtherPositionsWalls {
  leftWalls: PositionMap<boolean>;
  topWalls: PositionMap<boolean>;
}

export class NextMoveEvaluator {
  game: Game;
  robot: Robot;
  leftWallsCrossed?: PositionMap<boolean>;
  topWallsCrossed?: PositionMap<boolean>;

  constructor(game: Game, robot: Robot, leftWallsCrossed?: PositionMap<boolean>, topWallsCrossed?: PositionMap<boolean>) {
    this.game = game;
    this.robot = robot;
    this.robot = game.robots[0];
    this.leftWallsCrossed = leftWallsCrossed;
    this.topWallsCrossed = topWallsCrossed;
  }

  getOtherPositionsWalls(otherPositions?: Position[]): OtherPositionsWalls {
    const leftWalls = new PositionMap<boolean>();
    const topWalls = new PositionMap<boolean>();
    if (otherPositions) {
      for (const otherPosition of otherPositions) {
        leftWalls.set({x: otherPosition.x, y: otherPosition.y}, true);
        leftWalls.set({x: otherPosition.x + 1, y: otherPosition.y}, true);
        topWalls.set({x: otherPosition.x, y: otherPosition.y}, true);
        topWalls.set({x: otherPosition.x, y: otherPosition.y + 1}, true);
      }
    }
    return {leftWalls, topWalls};
  }

  static offsetsByDirection: Map<Direction, [WallType, number]> = new Map([
    [Direction.Left, ["left", 0]],
    [Direction.Right, ["left", 1]],
    [Direction.Up, ["top", 0]],
    [Direction.Down, ["top", 1]],
  ]);

  getNextPositions(position: Position, otherPositions?: Position[], otherPositionsWalls?: OtherPositionsWalls): Position[] {
    if (!otherPositionsWalls) {
      otherPositionsWalls = this.getOtherPositionsWalls(otherPositions);
    }
    const nextPositions: Position[] = [];
    for (const direction of NextMoveEvaluator.offsetsByDirection.keys()) {
      const nextPosition = this.getNextPositionAtDirection(position, direction as Direction, otherPositions, otherPositionsWalls);
      if (nextPosition) {
        nextPositions.push(nextPosition);
      }
    }
    return nextPositions;
  }

  getNextPositionAtDirection(position: Position, direction: Direction, otherPositions?: Position[], otherPositionsWalls?: OtherPositionsWalls): Position | null {
    if (!otherPositionsWalls) {
      otherPositionsWalls = this.getOtherPositionsWalls(otherPositions);
    }
    const [wallType, wallIndexOffset] = NextMoveEvaluator.offsetsByDirection.get(direction)!;
    const leftWall = wallType === "left";
    const walls = leftWall ? this.game.field.leftWalls : this.game.field.topWalls;
    const otherWalls = leftWall ? otherPositionsWalls.leftWalls : otherPositionsWalls.topWalls;
    const positionOffset = wallIndexOffset * 2 - 1;
    const nextPosition = {x: position.x, y: position.y};
    const wallPosition = {x: position.x, y: position.y};
    while (true) {
      if (leftWall) {
        wallPosition.x = nextPosition.x;
        wallPosition.x += wallIndexOffset;
      } else {
        wallPosition.y = nextPosition.y;
        wallPosition.y += wallIndexOffset;
      }
      if (walls.get(wallPosition) || otherWalls.get(wallPosition)) {
        break;
      }
      if (leftWall) {
        nextPosition.x += positionOffset;
      } else {
        nextPosition.y += positionOffset;
      }
      if (leftWall) {
        if (this.leftWallsCrossed) {
          this.leftWallsCrossed.set({x: nextPosition.x + (1 - wallIndexOffset), y: nextPosition.y}, true);
        }
      } else {
        if (this.topWallsCrossed) {
          this.topWallsCrossed.set({x: nextPosition.x, y: nextPosition.y + (1 - wallIndexOffset)}, true);
        }
      }
    }
    if (positionsEqual(nextPosition, position)) {
      return null;
    }
    return nextPosition;
  }
}

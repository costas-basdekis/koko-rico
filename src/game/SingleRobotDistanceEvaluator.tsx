import { Position, PositionMap, positionsEqual } from "../utils";
import { Direction } from "./Direction";
import { WallType } from "./Field";
import { Game } from "./Game";
import { Robot } from "./Robot";

export class SingleRobotDistanceEvaluator {
  game: Game;
  robot: Robot;
  otherRobots: Robot[];
  leftWallsCrossed?: PositionMap<boolean>;
  topWallsCrossed?: PositionMap<boolean>;

  constructor(game: Game, robot?: Robot, leftWallsCrossed?: PositionMap<boolean>, topWallsCrossed?: PositionMap<boolean>) {
    this.game = game;
    this.robot = robot || game.robots[0];
    this.otherRobots = game.robots.filter(other => other !== this.robot);
    this.robot = game.robots[0];
    this.leftWallsCrossed = leftWallsCrossed;
    this.topWallsCrossed = topWallsCrossed;
  }

  evaluate(): PositionMap<number> {
    const distanceMap: PositionMap<number> = new PositionMap();
    distanceMap.set(this.robot.position, 0);
    const queue: [Position, number][] = [[this.robot.position, 0]];
    while (queue.length) {
      const [[position, distance]] = queue.splice(0, 1);
      const nextDistance = distance + 1;
      const nextPositions = this.getNextPositions(position);
      for (const nextPosition of nextPositions) {
        if (distanceMap.has(nextPosition)) {
          continue;
        }
        distanceMap.set(nextPosition, nextDistance);
        queue.push([nextPosition, nextDistance]);
      }
    }
    return distanceMap;
  }

  static offsetsByDirection: Map<Direction, [WallType, number]> = new Map([
    [Direction.Left, ["left", 0]],
    [Direction.Right, ["left", 1]],
    [Direction.Up, ["top", 0]],
    [Direction.Down, ["top", 1]],
  ]);

  getNextPositions(position: Position): Position[] {
    const nextPositions: Position[] = [];
    for (const direction of SingleRobotDistanceEvaluator.offsetsByDirection.keys()) {
      const nextPosition = this.getNextPositionAtDirection(position, direction as Direction);
      if (nextPosition) {
        nextPositions.push(nextPosition);
      }
    }
    return nextPositions;
  }

  getNextPositionAtDirection(position: Position, direction: Direction, otherRobots?: Robot[]): Position | null {
    if (!otherRobots) {
      otherRobots = this.game.robots.filter(other => other !== this.robot);
    }
    const [wallType, wallIndexOffset] = SingleRobotDistanceEvaluator.offsetsByDirection.get(direction)!;
    const positionOffset = wallIndexOffset * 2 - 1;
    const nextPosition = { ...position };
    while (true) {
      const walls =
        wallType === "left" ? this.game.field.leftWalls : this.game.field.topWalls;
      const wallPosition = { ...nextPosition };
      if (wallType === "left") {
        wallPosition.x += wallIndexOffset;
      } else {
        wallPosition.y += wallIndexOffset;
      }
      if (walls.get(wallPosition)) {
        break;
      }
      if (wallType === "left") {
        nextPosition.x += positionOffset;
      } else {
        nextPosition.y += positionOffset;
      }
      if (this.otherRobots.find(other => positionsEqual(other.position, nextPosition))) {
        if (wallType === "left") {
          nextPosition.x -= positionOffset;
        } else {
          nextPosition.y -= positionOffset;
        }
        break;
      }
      if (wallType === "left") {
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

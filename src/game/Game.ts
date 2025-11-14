import { Position, PositionMap, positionsEqual } from "../utils";
import { Direction } from "./Direction";
import { Field, WallType } from "./Field";
import { Robot } from "./Robot";

export class Game {
  field: Field;
  robots: Robot[];

  static makeForSizeAndRobots(
    width: number,
    height: number,
    robotPositions: { x: number; y: number }[]
  ): Game {
    return new Game(
      Field.makeForSize(width, height),
      robotPositions.map((position, index) => new Robot(position, index))
    );
  }

  constructor(field: Field, robots: Robot[]) {
    this.field = field;
    this.robots = robots;
  }

  change({
    field = this.field,
    robots = this.robots,
  }: {
    field?: Field;
    robots?: Robot[];
  }) {
    return new Game(field, robots);
  }

  toggleWall(position: Position, type: WallType): Game {
    return this.change({ field: this.field.toggleWall(position, type) });
  }

  moveRobot(robot: Robot, newPosition: Position): Game {
    if (!this.robots.includes(robot)) {
      throw new Error("Robot is not part of the game");
    }
    return this.change({robots: this.robots.map(oldRobot => oldRobot === robot ? oldRobot.moveTo(newPosition) : oldRobot)});
  }

  calculateReachableRobotPositions(robot: Robot, leftWallsCrossed?: PositionMap<boolean>, topWallsCrossed?: PositionMap<boolean>): PositionMap<number> {
    const distanceMap: PositionMap<number> = new PositionMap();
    distanceMap.set(robot.position, 0);
    const queue: [Position, number][] = [[robot.position, 0]];
    while (queue.length) {
      const [[position, distance]] = queue.splice(0, 1);
      const nextDistance = distance + 1;
      const nextPositions = this.getNextPositions(position, robot, leftWallsCrossed, topWallsCrossed);
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

  getNextPositions(position: Position, ignoreRobot: Robot, leftWallsCrossed?: PositionMap<boolean>, topWallsCrossed?: PositionMap<boolean>): Position[] {
    const nextPositions: Position[] = [];
    for (const direction of Game.offsetsByDirection.keys()) {
      const nextPosition = this.getNextPositionAtDirection(position, direction as Direction, ignoreRobot, leftWallsCrossed, topWallsCrossed);
      if (nextPosition) {
        nextPositions.push(nextPosition);
      }
    }
    return nextPositions;
  }

  getNextPositionAtDirection(position: Position, direction: Direction, ignoreRobot: Robot, leftWallsCrossed?: PositionMap<boolean>, topWallsCrossed?: PositionMap<boolean>): Position | null {
    const otherRobots = this.robots.filter(robot => robot !== ignoreRobot);
    const [wallType, wallIndexOffset] = Game.offsetsByDirection.get(direction)!;
    const positionOffset = wallIndexOffset * 2 - 1;
    const nextPosition = { ...position };
    while (true) {
      const walls =
        wallType === "left" ? this.field.leftWalls : this.field.topWalls;
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
      if (otherRobots.find(robot => positionsEqual(robot.position, nextPosition))) {
        if (wallType === "left") {
          nextPosition.x -= positionOffset;
        } else {
          nextPosition.y -= positionOffset;
        }
        break;
      }
      if (wallType === "left") {
        if (leftWallsCrossed) {
          leftWallsCrossed.set({x: nextPosition.x + (1 - wallIndexOffset), y: nextPosition.y}, true);
        }
      } else {
        if (topWallsCrossed) {
          topWallsCrossed.set({x: nextPosition.x, y: nextPosition.y + (1 - wallIndexOffset)}, true);
        }
      }
    }
    if (positionsEqual(nextPosition, position)) {
      return null;
    }
    return nextPosition;
  }
}

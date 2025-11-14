import { Position, PositionMap } from "../utils";
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

  calculateReachableRobotPositions(robot: Robot): PositionMap<number> {
    const distanceMap: PositionMap<number> = new PositionMap();
    distanceMap.set(robot.position, 0);
    const queue: [Position, number][] = [[robot.position, 0]];
    while (queue.length) {
      const [[position, distance]] = queue.splice(0, 1);
      const nextDistance = distance + 1;
      const nextPositions = this.getNextPositions(position, robot);
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

  static directionOffsets: [WallType, number][] = [
    ["left", 0],
    ["left", 1],
    ["top", 0],
    ["top", 1],
  ];

  getNextPositions(position: Position, ignoreRobot: Robot): Position[] {
    const nextPositions: Position[] = [];
    for (const [wallType, wallIndexOffset] of Game.directionOffsets) {
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
          nextPosition.x += wallIndexOffset * 2 - 1;
        } else {
          nextPosition.y += wallIndexOffset * 2 - 1;
        }
      }
      if (nextPosition.x === position.x && nextPosition.y === position.y) {
        continue;
      }
      nextPositions.push(nextPosition);
    }
    return nextPositions;
  }
}

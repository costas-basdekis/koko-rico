import _ from "underscore";
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
  
  pickRandomWalls(count: number): Game {
    const newField = Field.makeForSize(this.field.width, this.field.height);
    const position = { x: 0, y: 0 };
    for (const _i of _.range(count)) {
      while (true) {
        const type = ["left", "top"][_.random(0, 1)] as WallType;
        if (type === "left") {
          position.x = _.random(1, this.field.width - 1);
          position.y = _.random(0, this.field.width - 1);
          console.log(type, position);
          if (newField.leftWalls.get(position)) {
            continue;
          }
          newField.leftWalls.set(position, true);
          break;
        } else {
          position.x = _.random(0, this.field.width - 1);
          position.y = _.random(1, this.field.width - 1);
          console.log(type, position);
          if (newField.topWalls.get(position)) {
            continue;
          }
          newField.topWalls.set(position, true);
          break;
        }
      }
    }
    return this.change({field: newField});
  }

  pickRandomCrossedWalls(count: number, minMaxMoveCount?: number): Game {
    let newGame = this.change({field: Field.makeForSize(this.field.width, this.field.height)});
    while (true) {
      for (const _i of _.range(count)) {
        const leftWallsCrossed = new PositionMap<boolean>();
        const topWallsCrossed = new PositionMap<boolean>();
        newGame.calculateReachableRobotPositions(newGame.robots[0], leftWallsCrossed, topWallsCrossed);
        const wallsCrossed: [WallType, Position][] = [
          ...Array.from(leftWallsCrossed.entries()).filter(([, contains]) => contains).map(([position]) => ["left", position] as [WallType, Position]),
          ...Array.from(topWallsCrossed.entries()).filter(([, contains]) => contains).map(([position]) => ["top", position] as [WallType, Position]),
        ];
        if (!wallsCrossed.length) {
          break;
        }
        const [wallType, position] = wallsCrossed[_.random(0, wallsCrossed.length - 1)];
        newGame = newGame.toggleWall(position, wallType);
      }
      if (minMaxMoveCount === undefined) {
        break;
      }
      if (!newGame.robots.length) {
        throw new Error("Game has no robots and minMaxMoveCount was provided");
      }
      const distanceMap = newGame.calculateReachableRobotPositions(newGame.robots[0]);
      const maxMoveCount = Math.max(...distanceMap.values());
      if (maxMoveCount >= minMaxMoveCount) {
        break;
      }
    }
    return newGame;
  }
}

import _ from "underscore";
import { getPositionKey, Position, PositionMap, positionsEqual } from "../utils";
import { Direction } from "./Direction";
import { Field, WallType } from "./Field";
import { Robot } from "./Robot";
import { SingleRobotDistanceEvaluator } from "./SingleRobotDistanceEvaluator";
import { MultiRobotDistanceEvaluator } from "./MultiRobotDistanceEvaluator";

export interface RobotPathEntry {
  previousPosition: Position;
  position: Position;
  robotIndex: number;
}

export type RobotPath = RobotPathEntry[];

export interface NextPositionEntry {
  nextPosition: Position;
  isUndo: boolean;
}

export type NextPositionEntries = NextPositionEntry[];

export type NextPositionEntriesMap = Map<number, NextPositionEntries>;

export class Game {
  field: Field;
  robots: Robot[];
  initialRobots: Robot[];
  path: RobotPath;
  singleRobotDistanceMap?: PositionMap<number> = undefined;
  multiRobotDistanceMap?: PositionMap<number> = undefined;

  static makeForSizeAndRobots(
    width: number,
    height: number,
    robotPositions: { x: number; y: number }[],
  ): Game {
    const robots = robotPositions.map((position, index) => new Robot(position, index));
    return new Game(
      Field.makeForSize(width, height),
      robots,
      robots,
      [],
    );
  }

  constructor(field: Field, robots: Robot[], initialRobots: Robot[], path: RobotPath) {
    this.field = field;
    this.robots = robots;
    this.initialRobots = initialRobots;
    this.path = path;
  }

  change({
    field = this.field,
    robots = this.robots,
    path = this.path,
  }: {
    field?: Field;
    robots?: Robot[];
    path?: RobotPath;
  }) {
    return new Game(field, robots, this.initialRobots, path);
  }

  toggleWall(position: Position, type: WallType): Game {
    return this.change({ field: this.field.toggleWall(position, type) });
  }

  moveRobot(robot: Robot, newPosition: Position, isUndo: boolean): Game {
    if (!this.robots.includes(robot)) {
      throw new Error("Robot is not part of the game");
    }
    if (isUndo) {
      if (this.path.length === 0) {
        throw new Error("Cannot undo move: no moves in path");
      }
      const {previousPosition, robotIndex} = this.path[this.path.length - 1];
      if (!positionsEqual(previousPosition, newPosition)) {
        throw new Error(`Cannot undo ${JSON.stringify(newPosition)} as it doesn't match previous position ${JSON.stringify(previousPosition)}`);
      }
      if (robotIndex !== robot.index) {
        throw new Error(`Cannot undo robot #${robot.index} as the last robot move was by #${robotIndex}`);
      }
    }
    return this.change({
      robots: this.robots.map(oldRobot => oldRobot === robot ? oldRobot.moveTo(newPosition) : oldRobot),
      path: isUndo ? this.path.slice(0, this.path.length - 1) : [...this.path, {previousPosition: robot.position, position: newPosition, robotIndex: robot.index}],
    });
  }

  resetRobots(): Game {
    return this.change({robots: this.initialRobots, path: []});
  }

  getNextRobotsPositionEntries(): NextPositionEntriesMap{
    return new Map(this.robots.map(robot => [robot.index, this.getNextRobotPositionEntries(robot)]));
  }

  getNextRobotPositionEntries(robot: Robot): NextPositionEntries {
    let nextPositionEntries: {nextPosition: Position, isUndo: boolean}[]; 
    if (this.robots.length === 1) {
      nextPositionEntries = new SingleRobotDistanceEvaluator(this, robot).getNextPositions(robot.position).map(nextPosition => ({nextPosition, isUndo: false}));
    } else if (this.robots.length > 1) {
      nextPositionEntries = new MultiRobotDistanceEvaluator(this, robot).getNextPositions(robot.position, this.robots.filter(other => other !== robot).map(other => other.position)).map(nextPosition => ({nextPosition, isUndo: false}));
    } else {
      nextPositionEntries = [];
    }
    if (this.path.length) {
      const {previousPosition, robotIndex} = this.path[this.path.length - 1];
      if (robotIndex === robot.index) {
        const directionFilter = Array.from(Game.directionFilterMap.values()).find(filter => filter(previousPosition, robot.position));
        if (directionFilter) {
          const nextPositionEntry = nextPositionEntries.find(nextPositionEntry => directionFilter(nextPositionEntry.nextPosition, robot.position));
          if (nextPositionEntry) {
            nextPositionEntry.nextPosition = previousPosition
            nextPositionEntry.isUndo = true;
          }
        }
      }
    }
    return nextPositionEntries;
  }

  static directionFilterMap: Map<Direction, (left: Position, right: Position) => boolean> = new Map([
    [Direction.Left, (left, right) => left.x < right.x],
    [Direction.Right, (left, right) => left.x > right.x],
    [Direction.Up, (left, right) => left.y < right.y],
    [Direction.Down, (left, right) => left.y > right.y],
  ]);

  moveRobotInDirection(robot: Robot, direction: Direction, nextRobotsPositionEntries: NextPositionEntriesMap = this.getNextRobotsPositionEntries()): Game {
    const nextPositionEntry = this.getRobotMoveInDirection(robot, direction, nextRobotsPositionEntries);
    if (!nextPositionEntry) {
      return this;
    }
    return this.moveRobot(robot, nextPositionEntry.nextPosition, nextPositionEntry.isUndo);
  }

  getRobotMoveInDirection(robot: Robot, direction: Direction, nextRobotsPositionEntries: NextPositionEntriesMap = this.getNextRobotsPositionEntries()): NextPositionEntry | null {
    const nextRobotPositionEntries = nextRobotsPositionEntries.get(robot.index)!;
    const directionFilter = Game.directionFilterMap.get(direction)!;
    const nextPositionEntry = nextRobotPositionEntries.find(({nextPosition}) => directionFilter(nextPosition, robot.position));
    if (!nextPositionEntry) {
      return null;
    }
    return nextPositionEntry;
  }

  undoMoveRobot(): Game {
    if (!this.path.length) {
      return this;
    }
    const {previousPosition, robotIndex} = this.path[this.path.length - 1];
    return this.moveRobot(this.robots[robotIndex], previousPosition, true);
  }

  addRobots(newPositions: Position[]): any {
    return this.change({robots: [...this.robots, ...newPositions.map((position, index) => new Robot(position, this.robots.length + index))]});
  }

  removeRobots(count: number): any {
    return this.change({robots: this.robots.slice(0, this.robots.length - count), path: []});
  }

  calculateReachableSingleRobotPositions(robot: Robot, leftWallsCrossed?: PositionMap<boolean>, topWallsCrossed?: PositionMap<boolean>): PositionMap<number> {
    if (leftWallsCrossed || topWallsCrossed) {
      this.singleRobotDistanceMap = undefined;
    }
    if (!this.singleRobotDistanceMap) {
      this.singleRobotDistanceMap = new SingleRobotDistanceEvaluator(this, robot, leftWallsCrossed, topWallsCrossed).evaluate();
    }
    return this.singleRobotDistanceMap;
  }

  calculateReachableMultiRobotPositions(robot: Robot, leftWallsCrossed?: PositionMap<boolean>, topWallsCrossed?: PositionMap<boolean>, distanceLimit?: number): PositionMap<number> {
    if (leftWallsCrossed || topWallsCrossed) {
      this.multiRobotDistanceMap = undefined;
    }
    if (!this.multiRobotDistanceMap) {
      this.multiRobotDistanceMap = new MultiRobotDistanceEvaluator(this, robot, leftWallsCrossed, topWallsCrossed).evaluate(distanceLimit);
    }
    return this.multiRobotDistanceMap;
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

  pickRandomCrossedWalls(count: number, minMaxMoveCount?: number, multiRobot: boolean = false): Game {
    let newGame = this.change({field: Field.makeForSize(this.field.width, this.field.height), path: []});
    while (true) {
      for (const _i of _.range(count)) {
        const leftWallsCrossed = new PositionMap<boolean>();
        const topWallsCrossed = new PositionMap<boolean>();
        if (multiRobot) {
          newGame.calculateReachableMultiRobotPositions(newGame.robots[0], leftWallsCrossed, topWallsCrossed, minMaxMoveCount);
        } else {
          newGame.calculateReachableSingleRobotPositions(newGame.robots[0], leftWallsCrossed, topWallsCrossed);
        }
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
      let distanceMap: PositionMap<number>;
      if (multiRobot) {
        distanceMap = newGame.calculateReachableMultiRobotPositions(newGame.robots[0], undefined, undefined, minMaxMoveCount);
      } else {
        distanceMap = newGame.calculateReachableSingleRobotPositions(newGame.robots[0]);
      }
      const maxMoveCount = Math.max(...distanceMap.values());
      if (maxMoveCount >= minMaxMoveCount) {
        if (multiRobot) {
          newGame.multiRobotDistanceMap = distanceMap;
        } else {
          newGame.singleRobotDistanceMap = distanceMap;
        }
        break;
      }
    }
    return newGame;
  }
}

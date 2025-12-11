import _ from "underscore";
import { Position, PositionMap, positionsEqual } from "../utils";
import { Direction, getPositionsDirection } from "./Direction";
import { Field, WallType } from "./Field";
import { Robot } from "./Robot";
import { SingleRobotDistanceEvaluator } from "./SingleRobotDistanceEvaluator";
import { MultiRobotDistanceEvaluator } from "./MultiRobotDistanceEvaluator";
import { GameFormat, LatestGameFormat, migrate } from "./GameMigrations";

export interface RobotPathEntry {
  previousPosition: Position;
  position: Position;
  robotIndex: number;
}

export type RobotPath = RobotPathEntry[];

export interface NextPositionEntry {
  nextPosition: Position;
  direction: Direction;
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
  singleRobotDistanceMapDistance?: number = undefined;
  multiRobotDistanceMap?: PositionMap<number> = undefined;
  multiRobotDistanceMapDistance?: number = undefined;

  static getDefaultSilverAndBronzeTargetDistances(
    targetDistance: number,
  ): [number, number] {
    const step = Math.max(1, Math.round(targetDistance * 0.2));
    return [targetDistance + step, targetDistance + step * 2];
  }

  static makeForSizeAndRobots(
    width: number,
    height: number,
    robotPositions: { x: number; y: number }[],
  ): Game {
    const robots = robotPositions.map(
      (position, index) => new Robot(position, index),
    );
    return new Game(Field.makeForSize(width, height), robots, robots, []);
  }

  static deserialise(serialised: GameFormat): Game {
    const latestVersionSerialised = migrate(serialised);
    return this.deserialiseLatestVersion(latestVersionSerialised);
  }

  static deserialiseLatestVersion({
    field,
    robots,
    initialRobots,
    path,
  }: LatestGameFormat): Game {
    return new Game(
      Field.deserialise(field),
      robots.map((robot) => Robot.deserialise(robot)),
      initialRobots.map((robot) => Robot.deserialise(robot)),
      path,
    );
  }

  constructor(
    field: Field,
    robots: Robot[],
    initialRobots: Robot[],
    path: RobotPath,
  ) {
    this.field = field;
    this.robots = robots;
    this.initialRobots = initialRobots;
    this.path = path;
  }

  serialise(): LatestGameFormat {
    return {
      version: 4,
      field: this.field.serialise(),
      robots: this.robots.map((robot) => robot.serialise()),
      initialRobots: this.initialRobots.map((robot) => robot.serialise()),
      path: this.path,
    };
  }

  change({
    field = this.field,
    robots = this.robots,
    path = this.path,
  }: Partial<Pick<Game, "field" | "robots" | "path">>) {
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
      const { previousPosition, robotIndex } = this.path[this.path.length - 1];
      if (!positionsEqual(previousPosition, newPosition)) {
        throw new Error(
          `Cannot undo ${JSON.stringify(newPosition)} as it doesn't match previous position ${JSON.stringify(previousPosition)}`,
        );
      }
      if (robotIndex !== robot.index) {
        throw new Error(
          `Cannot undo robot #${robot.index} as the last robot move was by #${robotIndex}`,
        );
      }
    }
    let newGame = this.change({
      robots: this.robots.map((oldRobot) =>
        oldRobot === robot ? oldRobot.moveTo(newPosition) : oldRobot,
      ),
      path: isUndo
        ? this.path.slice(0, this.path.length - 1)
        : [
            ...this.path,
            {
              previousPosition: robot.position,
              position: newPosition,
              robotIndex: robot.index,
            },
          ],
    });
    return newGame;
  }

  resetRobots(): Game {
    return this.change({ robots: this.initialRobots, path: [] });
  }

  getNextRobotsPositionEntries(): NextPositionEntriesMap {
    return new Map(
      this.robots.map((robot) => [
        robot.index,
        this.getNextRobotPositionEntries(robot),
      ]),
    );
  }

  getNextRobotPositionEntries(robot: Robot): NextPositionEntries {
    let nextPositionEntries: NextPositionEntries;
    if (this.robots.length === 1) {
      nextPositionEntries = new SingleRobotDistanceEvaluator(this, robot)
        .getNextPositions(robot.position)
        .map((nextPosition) => ({
          nextPosition,
          direction: getPositionsDirection(robot.position, nextPosition)!,
          isUndo: false,
        }));
    } else if (this.robots.length > 1) {
      nextPositionEntries = new MultiRobotDistanceEvaluator(this, robot)
        .getNextPositions(
          robot.position,
          this.robots
            .filter((other) => other !== robot)
            .map((other) => other.position),
        )
        .map((nextPosition) => ({
          nextPosition,
          direction: getPositionsDirection(robot.position, nextPosition)!,
          isUndo: false,
        }));
    } else {
      nextPositionEntries = [];
    }
    if (this.path.length) {
      const { previousPosition, robotIndex } = this.path[this.path.length - 1];
      const previousDirection = getPositionsDirection(
        robot.position,
        previousPosition,
      )!;
      if (robotIndex === robot.index) {
        const nextPositionEntry = nextPositionEntries.find(
          ({ direction }) => direction === previousDirection,
        );
        if (nextPositionEntry) {
          nextPositionEntry.nextPosition = previousPosition;
          nextPositionEntry.isUndo = true;
        }
      }
    }
    return nextPositionEntries;
  }

  static directionFilterMap: Map<
    Direction,
    (left: Position, right: Position) => boolean
  > = new Map([
    [Direction.Left, (left, right) => left.x < right.x],
    [Direction.Right, (left, right) => left.x > right.x],
    [Direction.Up, (left, right) => left.y < right.y],
    [Direction.Down, (left, right) => left.y > right.y],
  ]);

  moveRobotInDirection(
    robot: Robot,
    direction: Direction,
    nextRobotsPositionEntries: NextPositionEntriesMap = this.getNextRobotsPositionEntries(),
  ): Game {
    const nextPositionEntry = this.getRobotMoveInDirection(
      robot,
      direction,
      nextRobotsPositionEntries,
    );
    if (!nextPositionEntry) {
      return this;
    }
    return this.moveRobot(
      robot,
      nextPositionEntry.nextPosition,
      nextPositionEntry.isUndo,
    );
  }

  getRobotMoveInDirection(
    robot: Robot,
    direction: Direction,
    nextRobotsPositionEntries: NextPositionEntriesMap = this.getNextRobotsPositionEntries(),
  ): NextPositionEntry | null {
    const nextRobotPositionEntries = nextRobotsPositionEntries.get(
      robot.index,
    )!;
    const directionFilter = Game.directionFilterMap.get(direction)!;
    const nextPositionEntry = nextRobotPositionEntries.find(
      ({ nextPosition }) => directionFilter(nextPosition, robot.position),
    );
    if (!nextPositionEntry) {
      return null;
    }
    return nextPositionEntry;
  }

  undoMoveRobot(): Game {
    if (!this.path.length) {
      return this;
    }
    const { previousPosition, robotIndex } = this.path[this.path.length - 1];
    return this.moveRobot(this.robots[robotIndex], previousPosition, true);
  }

  getUndoStack(): Game[] {
    if (!this.path.length) {
      return [];
    }
    let currentGame = this.undoMoveRobot();
    const undoStack = [currentGame];
    while (currentGame.path.length) {
      currentGame = currentGame.undoMoveRobot();
      undoStack.unshift(currentGame);
    }
    return undoStack;
  }

  addRobots(newPositions: Position[]): any {
    return this.change({
      robots: [
        ...this.robots,
        ...newPositions.map(
          (position, index) => new Robot(position, this.robots.length + index),
        ),
      ],
    });
  }

  removeRobots(count: number): any {
    return this.change({
      robots: this.robots.slice(0, this.robots.length - count),
      path: [],
    });
  }

  calculateReachableSingleRobotPositions(
    robot: Robot,
    distanceLimit: number,
    leftWallsCrossed?: PositionMap<boolean>,
    topWallsCrossed?: PositionMap<boolean>,
  ): PositionMap<number> {
    if (leftWallsCrossed || topWallsCrossed) {
      this.singleRobotDistanceMap = undefined;
    }
    if (
      this.singleRobotDistanceMapDistance !== distanceLimit ||
      !this.singleRobotDistanceMap ||
      leftWallsCrossed ||
      topWallsCrossed
    ) {
      this.singleRobotDistanceMap = new SingleRobotDistanceEvaluator(
        this,
        robot,
        leftWallsCrossed,
        topWallsCrossed,
      ).evaluate(distanceLimit);
      this.singleRobotDistanceMapDistance = distanceLimit;
    }
    return this.singleRobotDistanceMap;
  }

  calculateReachableMultiRobotPositions(
    robot: Robot,
    distanceLimit: number,
    leftWallsCrossed?: PositionMap<boolean>,
    topWallsCrossed?: PositionMap<boolean>,
  ): PositionMap<number> {
    if (leftWallsCrossed || topWallsCrossed) {
      this.multiRobotDistanceMap = undefined;
    }
    if (
      this.multiRobotDistanceMapDistance != distanceLimit ||
      !this.multiRobotDistanceMap ||
      leftWallsCrossed ||
      topWallsCrossed
    ) {
      this.multiRobotDistanceMap = new MultiRobotDistanceEvaluator(
        this,
        robot,
        leftWallsCrossed,
        topWallsCrossed,
      ).evaluate(distanceLimit);
    }
    return this.multiRobotDistanceMap;
  }
}

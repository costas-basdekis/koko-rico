import _ from "underscore";
import { Position, PositionMap } from "../utils";
import { Field, WallType } from "./Field";
import { Game } from "./Game";
import { LatestGameFormat } from "./GameMigrations";

export interface GameBackgroundRequest {
  serialised: any;
  count: number;
  desiredTargetDistance: number;
}

export type GameBackgroundResponse =
  | { success: false; error: string }
  | { success: true; serialised: LatestGameFormat };

export class GameBuilder {
  pickRandomWalls(game: Game, count: number): Game {
    const newField = Field.makeForSize(game.field.width, game.field.height);
    const position = { x: 0, y: 0 };
    for (const _i of _.range(count)) {
      while (true) {
        const type = ["left", "top"][_.random(0, 1)] as WallType;
        if (type === "left") {
          position.x = _.random(1, game.field.width - 1);
          position.y = _.random(0, game.field.width - 1);
          if (newField.leftWalls.get(position)) {
            continue;
          }
          newField.leftWalls.set(position, true);
          break;
        } else {
          position.x = _.random(0, game.field.width - 1);
          position.y = _.random(1, game.field.width - 1);
          if (newField.topWalls.get(position)) {
            continue;
          }
          newField.topWalls.set(position, true);
          break;
        }
      }
    }
    return game.change({ field: newField });
  }

  pickRandomCrossedWalls(
    game: Game,
    count: number,
    minMaxMoveCount: number,
    multiRobot: boolean = false,
  ): Game {
    let newGame = game.change({
      field: Field.makeForSize(game.field.width, game.field.height),
      path: [],
    });
    while (true) {
      for (const _i of _.range(count)) {
        const leftWallsCrossed = new PositionMap<boolean>();
        const topWallsCrossed = new PositionMap<boolean>();
        if (multiRobot) {
          newGame.calculateReachableMultiRobotPositions(
            newGame.robots[0],
            minMaxMoveCount,
            leftWallsCrossed,
            topWallsCrossed,
          );
        } else {
          newGame.calculateReachableSingleRobotPositions(
            newGame.robots[0],
            minMaxMoveCount,
            leftWallsCrossed,
            topWallsCrossed,
          );
        }
        const wallsCrossed: [WallType, Position][] = [
          ...Array.from(leftWallsCrossed.entries())
            .filter(([, contains]) => contains)
            .map(([position]) => ["left", position] as [WallType, Position]),
          ...Array.from(topWallsCrossed.entries())
            .filter(([, contains]) => contains)
            .map(([position]) => ["top", position] as [WallType, Position]),
        ];
        if (!wallsCrossed.length) {
          break;
        }
        const [wallType, position] =
          wallsCrossed[_.random(0, wallsCrossed.length - 1)];
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
        distanceMap = newGame.calculateReachableMultiRobotPositions(
          newGame.robots[0],
          minMaxMoveCount,
          undefined,
          undefined,
        );
      } else {
        distanceMap = newGame.calculateReachableSingleRobotPositions(
          newGame.robots[0],
          minMaxMoveCount,
        );
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

  pickRandomCrossedWallsProgressively(
    game: Game,
    count: number,
    minMaxMoveCount: number,
  ): Game {
    const multiRobot = game.robots.length > 1;
    let newGame = game.change({
      field: Field.makeForSize(game.field.width, game.field.height),
      path: [],
    });
    const stepCount = count < 4 ? 1 : count < 9 ? 2 : 3;
    while (true) {
      let previousLeftWallsCrossed = new PositionMap<boolean>();
      let previousTopWallsCrossed = new PositionMap<boolean>();
      for (const _i of _.range(0, count, stepCount)) {
        const pickCount = Math.min(_i + stepCount, count) - _i;
        const leftWallsCrossed = new PositionMap<boolean>();
        const topWallsCrossed = new PositionMap<boolean>();
        if (multiRobot) {
          newGame.calculateReachableMultiRobotPositions(
            newGame.robots[0],
            Math.min(minMaxMoveCount, _i + pickCount),
            leftWallsCrossed,
            topWallsCrossed,
          );
        } else {
          newGame.calculateReachableSingleRobotPositions(
            newGame.robots[0],
            minMaxMoveCount,
            leftWallsCrossed,
            topWallsCrossed,
          );
        }
        let wallsCrossed: [WallType, Position][] = [
          ...Array.from(leftWallsCrossed.entries())
            .filter(([, contains]) => contains)
            .filter(([position]) => !previousLeftWallsCrossed.get(position))
            .map(([position]) => ["left", position] as [WallType, Position]),
          ...Array.from(topWallsCrossed.entries())
            .filter(([, contains]) => contains)
            .filter(([position]) => !previousTopWallsCrossed.get(position))
            .map(([position]) => ["top", position] as [WallType, Position]),
        ];
        previousLeftWallsCrossed = leftWallsCrossed;
        previousTopWallsCrossed = topWallsCrossed;
        if (wallsCrossed.length < pickCount) {
          wallsCrossed = [
            ...Array.from(leftWallsCrossed.entries())
              .filter(([, contains]) => contains)
              .map(([position]) => ["left", position] as [WallType, Position]),
            ...Array.from(topWallsCrossed.entries())
              .filter(([, contains]) => contains)
              .map(([position]) => ["top", position] as [WallType, Position]),
          ];
        }
        if (wallsCrossed.length < pickCount) {
          break;
        }
        for (const _j of _.range(pickCount)) {
          const [[wallType, position]] = wallsCrossed.splice(
            _.random(0, wallsCrossed.length - 1),
            1,
          );
          newGame = newGame.toggleWall(position, wallType);
        }
      }
      if (!newGame.robots.length) {
        throw new Error("Game has no robots and minMaxMoveCount was provided");
      }
      let distanceMap: PositionMap<number>;
      if (multiRobot) {
        distanceMap = newGame.calculateReachableMultiRobotPositions(
          newGame.robots[0],
          minMaxMoveCount,
          undefined,
          undefined,
        );
      } else {
        distanceMap = newGame.calculateReachableSingleRobotPositions(
          newGame.robots[0],
          minMaxMoveCount,
        );
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

  backgroundPuzzleGeneration({
    desiredTargetDistance,
    count,
    serialised,
  }: GameBackgroundRequest): GameBackgroundResponse {
    try {
      let game = Game.deserialise(serialised);
      game = this.pickRandomCrossedWallsProgressively(
        game,
        count,
        desiredTargetDistance,
      );
      game = game.pickTargets(desiredTargetDistance);
      return { success: true, serialised: game.serialise() };
    } catch (e) {
      return { success: false, error: `${e}` };
    }
  }
}

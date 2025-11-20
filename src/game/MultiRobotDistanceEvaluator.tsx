import _ from "underscore";
import { getPositionKey, Position, PositionMap, positionsEqual } from "../utils";
import { Direction } from "./Direction";
import { Game } from "./Game";
import { Robot } from "./Robot";
import { SingleRobotDistanceEvaluator } from "./SingleRobotDistanceEvaluator";

export interface OtherPositionsWalls {
  leftWalls: PositionMap<boolean>;
  topWalls: PositionMap<boolean>;
}

export class MultiRobotDistanceEvaluator {
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

  evaluate(distanceLimit: number = 10): PositionMap<number> {
    const distanceMap: PositionMap<number> = new PositionMap();
    distanceMap.set(this.robot.position, 0);
    const distanceMapByKey: Map<string, number> = new Map();
    const initialOtherPositions = this.game.robots.filter(other => other !== this.robot).map(other => other.position);
    distanceMapByKey.set(this.getPositionsKey(this.robot.position, initialOtherPositions), 0);
    const queue: {position: Position, otherPositions: Position[], distance: number}[] = [{position: this.robot.position, otherPositions: initialOtherPositions, distance: 0}];
    const otherPositionIndexes = _.range(initialOtherPositions.length);
    while (queue.length) {
      const [{position, otherPositions, distance}] = queue.splice(0, 1);
      const nextDistance = distance + 1;
      const otherPositionsWalls = this.getOtherPositionsWalls(otherPositions);
      const nextPositions = this.getNextPositions(position, otherPositions, otherPositionsWalls);
      for (const nextPosition of nextPositions) {
        const nextKey = this.getPositionsKey(nextPosition, otherPositions);
        if (distanceMapByKey.has(nextKey)) {
          continue;
        }
        distanceMapByKey.set(nextKey, nextDistance);
        if (!distanceMap.has(nextPosition)) {
          distanceMap.set(nextPosition, nextDistance);
        }
        if (nextDistance < distanceLimit) {
          queue.push({position: nextPosition, otherPositions, distance: nextDistance});
        }
      }
      for (const otherPositionIndex of otherPositionIndexes) {
        const otherPosition = otherPositions[otherPositionIndex];
        const otherPositionsForNextPositions = Array.from(otherPositions);
        otherPositionsForNextPositions[otherPositionIndex] = position;
        const nextPositions = this.getNextPositions(otherPosition, otherPositionsForNextPositions);
        for (const nextOtherPosition of nextPositions) {
          const nextOtherPositions = Array.from(otherPositionsForNextPositions);
          nextOtherPositions[otherPositionIndex] = nextOtherPosition;
          const nextKey = this.getPositionsKey(position, nextOtherPositions);
          if (distanceMapByKey.has(nextKey)) {
            continue;
          }
          distanceMapByKey.set(nextKey, nextDistance);
          if (nextDistance < distanceLimit) {
            queue.push({position, otherPositions: nextOtherPositions, distance: nextDistance});
          }
        }
      }
    }
    return distanceMap;
  }

  getPositionsKey(position: Position, otherPositions: Position[]): string {
    let key = getPositionKey(position);
    for (const otherPosition of otherPositions) {
      key += `|${getPositionKey(otherPosition)}`;
    }
    return key;
  }

  getOtherPositionsWalls(otherPositions: Position[]): OtherPositionsWalls {
    const leftWalls = new PositionMap<boolean>();
    const topWalls = new PositionMap<boolean>();
    for (const otherPosition of otherPositions) {
      leftWalls.set({x: otherPosition.x, y: otherPosition.y}, true);
      leftWalls.set({x: otherPosition.x + 1, y: otherPosition.y}, true);
      topWalls.set({x: otherPosition.x, y: otherPosition.y}, true);
      topWalls.set({x: otherPosition.x, y: otherPosition.y + 1}, true);
    }
    return {leftWalls, topWalls};
  }

  getNextPositions(position: Position, otherPositions: Position[], otherPositionsWalls?: OtherPositionsWalls): Position[] {
    if (!otherPositionsWalls) {
      otherPositionsWalls = this.getOtherPositionsWalls(otherPositions);
    }
    const nextPositions: Position[] = [];
    for (const direction of SingleRobotDistanceEvaluator.offsetsByDirection.keys()) {
      const nextPosition = this.getNextPositionAtDirection(position, direction as Direction, otherPositions, otherPositionsWalls);
      if (nextPosition) {
        nextPositions.push(nextPosition);
      }
    }
    return nextPositions;
  }

  getNextPositionAtDirection(position: Position, direction: Direction, otherPositions: Position[], otherPositionsWalls?: OtherPositionsWalls): Position | null {
    if (!otherPositionsWalls) {
      otherPositionsWalls = this.getOtherPositionsWalls(otherPositions);
    }
    const [wallType, wallIndexOffset] = SingleRobotDistanceEvaluator.offsetsByDirection.get(direction)!;
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

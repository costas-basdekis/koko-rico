import _ from "underscore";
import { getPositionKey, Position, PositionMap } from "../utils";
import { Game } from "./Game";
import { Robot } from "./Robot";
import { NextMoveEvaluator, OtherPositionsWalls } from "./NextMoveEvaluator";

export class MultiRobotDistanceEvaluator {
  game: Game;
  robot: Robot;
  leftWallsCrossed?: PositionMap<boolean>;
  topWallsCrossed?: PositionMap<boolean>;
  nextMoveEvaluator: NextMoveEvaluator;

  constructor(game: Game, robot: Robot, leftWallsCrossed?: PositionMap<boolean>, topWallsCrossed?: PositionMap<boolean>) {
    this.game = game;
    this.robot = robot;
    this.robot = game.robots[0];
    this.leftWallsCrossed = leftWallsCrossed;
    this.topWallsCrossed = topWallsCrossed;
    this.nextMoveEvaluator = new NextMoveEvaluator(game, robot, leftWallsCrossed, topWallsCrossed);
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
      const nextPositions = this.getNextPositions(position, otherPositions);
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

  getNextPositions(position: Position, otherPositions: Position[], otherPositionsWalls?: OtherPositionsWalls): Position[] {
    return this.nextMoveEvaluator.getNextPositions(position, otherPositions, otherPositionsWalls);
  }
}

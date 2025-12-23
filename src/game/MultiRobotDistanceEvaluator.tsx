import _ from "underscore";
import { CustomMap, getPositionKey, Position, PositionMap } from "../utils";
import { Game, RobotPathEntry } from "./Game";
import { Robot } from "./Robot";
import { NextMoveEvaluator, OtherPositionsWalls } from "./NextMoveEvaluator";
import { SolutionBuilder } from "./SolutionBuilder";

export interface RobotsState {
  position: Position;
  otherPositions: Position[];
}

class RobotsStateMap<V> extends CustomMap.makeType(function hasher({
  position,
  otherPositions,
}: RobotsState): string {
  return (
    getPositionKey(position) +
    "|" +
    otherPositions.map(getPositionKey).sort().join("|")
  );
})<V> {}

export class MultiRobotDistanceEvaluator {
  game: Game;
  robot: Robot;
  robotIndexMap: Map<Robot, number> = new Map();
  leftWallsCrossed?: PositionMap<boolean>;
  topWallsCrossed?: PositionMap<boolean>;
  solutionBuilder?: SolutionBuilder;
  nextMoveEvaluator: NextMoveEvaluator;

  constructor(
    game: Game,
    robot: Robot,
    leftWallsCrossed?: PositionMap<boolean>,
    topWallsCrossed?: PositionMap<boolean>,
    solutionBuilder?: SolutionBuilder,
  ) {
    this.game = game;
    this.robot = robot;
    this.robot = game.robots[0];
    this.robotIndexMap = new Map(
      game.robots.map((robot, index) => [robot, index] as [Robot, number]),
    );
    this.leftWallsCrossed = leftWallsCrossed;
    this.topWallsCrossed = topWallsCrossed;
    this.solutionBuilder = solutionBuilder;
    this.nextMoveEvaluator = new NextMoveEvaluator(
      game,
      robot,
      leftWallsCrossed,
      topWallsCrossed,
    );
  }

  evaluate(distanceLimit: number): PositionMap<number> {
    const distanceMap: PositionMap<number> = new PositionMap();
    distanceMap.set(this.robot.position, 0);
    const distanceMapByKey: RobotsStateMap<number> = new RobotsStateMap();
    const otherRobots = this.game.robots.filter(
      (other) => other !== this.robot,
    );
    const initialOtherPositions = otherRobots.map((other) => other.position);
    distanceMapByKey.set(
      { position: this.robot.position, otherPositions: initialOtherPositions },
      0,
    );
    const queue: {
      position: Position;
      otherPositions: Position[];
      distance: number;
    }[] = [
      {
        position: this.robot.position,
        otherPositions: initialOtherPositions,
        distance: 0,
      },
    ];
    const otherPositionIndexes = _.range(initialOtherPositions.length);
    while (queue.length) {
      const { position, otherPositions, distance } = queue.shift()!;
      const positions = [position, ...otherPositions];
      const nextDistance = distance + 1;
      const nextPositions = this.getNextPositions(position, otherPositions);
      for (const nextPosition of nextPositions) {
        if (
          !distanceMapByKey.setNew(
            {
              position: nextPosition,
              otherPositions,
            },
            nextDistance,
          )
        ) {
          continue;
        }
        distanceMap.setNew(nextPosition, nextDistance);
        if (this.solutionBuilder) {
          const entry = {
            previousPosition: position,
            position: nextPosition,
            robotIndex: this.robotIndexMap.get(this.robot)!,
          };
          this.solutionBuilder.addPosition(
            [nextPosition, ...otherPositions],
            positions,
            entry,
          );
        }
        if (nextDistance < distanceLimit) {
          queue.push({
            position: nextPosition,
            otherPositions,
            distance: nextDistance,
          });
        }
      }
      if (nextDistance >= distanceLimit) {
        continue;
      }
      for (const otherPositionIndex of otherPositionIndexes) {
        const otherPosition = otherPositions[otherPositionIndex];
        const otherPositionsForNextPositions = Array.from(otherPositions);
        otherPositionsForNextPositions[otherPositionIndex] = position;
        const nextPositions = this.getNextPositions(
          otherPosition,
          otherPositionsForNextPositions,
        );
        for (const nextOtherPosition of nextPositions) {
          const nextOtherPositions = Array.from(otherPositionsForNextPositions);
          nextOtherPositions[otherPositionIndex] = nextOtherPosition;
          if (
            !distanceMapByKey.setNew(
              {
                position,
                otherPositions: nextOtherPositions,
              },
              nextDistance,
            )
          ) {
            continue;
          }
          if (this.solutionBuilder) {
            const entry = {
              previousPosition: otherPosition,
              position: nextOtherPosition,
              robotIndex: this.robotIndexMap.get(
                otherRobots[otherPositionIndex],
              )!,
            };
            this.solutionBuilder.addPosition(
              [position, ...nextOtherPositions],
              positions,
              entry,
            );
          }
          queue.push({
            position,
            otherPositions: nextOtherPositions,
            distance: nextDistance,
          });
        }
      }
    }
    return distanceMap;
  }

  getNextPositions(
    position: Position,
    otherPositions: Position[],
    otherPositionsWalls?: OtherPositionsWalls,
  ): Position[] {
    return this.nextMoveEvaluator.getNextPositions(
      position,
      otherPositions,
      otherPositionsWalls,
    );
  }
}

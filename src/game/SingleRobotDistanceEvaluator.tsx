import { Position, PositionMap } from "../utils";
import { Game, RobotPathEntry } from "./Game";
import { NextMoveEvaluator } from "./NextMoveEvaluator";
import { Robot } from "./Robot";
import { SolutionBuilder } from "./SolutionBuilder";

export class SingleRobotDistanceEvaluator {
  game: Game;
  robot: Robot;
  otherRobots: Robot[];
  leftWallsCrossed?: PositionMap<boolean>;
  topWallsCrossed?: PositionMap<boolean>;
  solutionBuilder?: SolutionBuilder;
  nextMoveEvaluator: NextMoveEvaluator;

  constructor(
    game: Game,
    robot?: Robot,
    leftWallsCrossed?: PositionMap<boolean>,
    topWallsCrossed?: PositionMap<boolean>,
    solutionBuilder?: SolutionBuilder,
  ) {
    this.game = game;
    this.robot = robot || game.robots[0];
    this.otherRobots = game.robots.filter((other) => other !== this.robot);
    this.robot = game.robots[0];
    this.leftWallsCrossed = leftWallsCrossed;
    this.topWallsCrossed = topWallsCrossed;
    this.solutionBuilder = solutionBuilder;
    this.nextMoveEvaluator = new NextMoveEvaluator(
      game,
      this.robot,
      leftWallsCrossed,
      topWallsCrossed,
    );
  }

  evaluate(distanceLimit: number): PositionMap<number> {
    const distanceMap: PositionMap<number> = new PositionMap();
    distanceMap.set(this.robot.position, 0);
    const queue: [Position, number, RobotPathEntry | null][] = [
      [this.robot.position, 0, null],
    ];
    while (queue.length) {
      const [position, distance, entry] = queue.shift()!;
      const nextDistance = distance + 1;
      const nextPositions = this.getNextPositions(position);
      for (const nextPosition of nextPositions) {
        if (!distanceMap.setNew(nextPosition, nextDistance)) {
          continue;
        }
        let nextEntry: RobotPathEntry | null = null;
        if (this.solutionBuilder) {
          nextEntry = {
            previousPosition: position,
            position: nextPosition,
            robotIndex: 0,
          };
          this.solutionBuilder.addPosition(nextEntry, entry);
        }
        if (nextDistance < distanceLimit) {
          queue.push([nextPosition, nextDistance, nextEntry]);
        }
      }
    }
    return distanceMap;
  }

  getNextPositions(position: Position): Position[] {
    return this.nextMoveEvaluator.getNextPositions(position);
  }
}

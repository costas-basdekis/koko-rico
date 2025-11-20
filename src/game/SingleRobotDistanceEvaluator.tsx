import { Position, PositionMap } from "../utils";
import { Game } from "./Game";
import { NextMoveEvaluator } from "./NextMoveEvaluator";
import { Robot } from "./Robot";

export class SingleRobotDistanceEvaluator {
  game: Game;
  robot: Robot;
  otherRobots: Robot[];
  leftWallsCrossed?: PositionMap<boolean>;
  topWallsCrossed?: PositionMap<boolean>;
  nextMoveEvaluator: NextMoveEvaluator;

  constructor(game: Game, robot?: Robot, leftWallsCrossed?: PositionMap<boolean>, topWallsCrossed?: PositionMap<boolean>) {
    this.game = game;
    this.robot = robot || game.robots[0];
    this.otherRobots = game.robots.filter(other => other !== this.robot);
    this.robot = game.robots[0];
    this.leftWallsCrossed = leftWallsCrossed;
    this.topWallsCrossed = topWallsCrossed;
    this.nextMoveEvaluator = new NextMoveEvaluator(game, this.robot, leftWallsCrossed, topWallsCrossed);
  }

  evaluate(): PositionMap<number> {
    const distanceMap: PositionMap<number> = new PositionMap();
    distanceMap.set(this.robot.position, 0);
    const queue: [Position, number][] = [[this.robot.position, 0]];
    while (queue.length) {
      const [[position, distance]] = queue.splice(0, 1);
      const nextDistance = distance + 1;
      const nextPositions = this.getNextPositions(position);
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

  getNextPositions(position: Position): Position[] {
    return this.nextMoveEvaluator.getNextPositions(position);
  }
}

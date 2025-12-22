import { Position } from "../utils";
import { Game } from "./Game";
import { MultiRobotDistanceEvaluator } from "./MultiRobotDistanceEvaluator";
import { SolutionBuilder } from "./SolutionBuilder";

function positionMapEntriesCompareFn(
  a: [Position, number],
  b: [Position, number],
) {
  const aJson = JSON.stringify(a);
  const bJson = JSON.stringify(b);
  if (aJson < bJson) {
    return -1;
  } else if (aJson === bJson) {
    return 0;
  } else {
    return 1;
  }
}

describe("MultiRobotDistanceEvaluator", () => {
  describe("evaluate", () => {
    it("evaluates for small empty game", () => {
      const game = Game.makeForSizeAndRobots(3, 3, [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ]);
      expect(
        Array.from(
          new MultiRobotDistanceEvaluator(game, game.robots[0])
            .evaluate(2)
            .entries(),
        ).sort(positionMapEntriesCompareFn),
      ).toEqual(
        (
          [
            [{ x: 0, y: 0 }, 0],
            [{ x: 1, y: 0 }, 2],
            [{ x: 0, y: 1 }, 2],
            [{ x: 2, y: 0 }, 2],
            [{ x: 0, y: 2 }, 2],
          ] as [Position, number][]
        ).sort(positionMapEntriesCompareFn),
      );
    });
    it("builds solutions when solutionBuilder is provided", () => {
      const game = Game.makeForSizeAndRobots(3, 3, [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ]);
      const solutionBuilder = new SolutionBuilder();
      new MultiRobotDistanceEvaluator(
        game,
        game.robots[0],
        undefined,
        undefined,
        solutionBuilder,
      ).evaluate(2);
      expect(solutionBuilder.positionMap.size).not.toBe(0);
      expect(solutionBuilder.getSolutionFor({ x: 1, y: 0 })).toEqual([
        {
          robotIndex: 1,
          position: { x: 2, y: 0 },
          previousPosition: { x: 1, y: 0 },
        },
        {
          robotIndex: 0,
          position: { x: 1, y: 0 },
          previousPosition: { x: 0, y: 0 },
        },
      ]);
      expect(solutionBuilder.getSolutionFor({ x: 2, y: 0 })).toEqual([
        {
          robotIndex: 1,
          position: { x: 1, y: 2 },
          previousPosition: { x: 1, y: 0 },
        },
        {
          robotIndex: 0,
          position: { x: 2, y: 0 },
          previousPosition: { x: 0, y: 0 },
        },
      ]);
      expect(solutionBuilder.getSolutionFor({ x: 0, y: 1 })).not.toBeNull();
      expect(solutionBuilder.getSolutionFor({ x: 0, y: 2 })).not.toBeNull();
    });
  });
});

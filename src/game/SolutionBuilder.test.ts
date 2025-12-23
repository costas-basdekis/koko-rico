import { Game, RobotPath } from "./Game";

describe("SolutionBuilder", () => {
  describe("fillTargetSolutions", () => {
    it("fills in missing solutions for small empty game", () => {
      const game = Game.makeForSizeAndRobots(3, 3, [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ]);
      const targetPositions = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 2, y: 0 },
        { x: 0, y: 2 },
      ];
      const solutions: (RobotPath | null)[] = [null, null, null, null];
      game.fillTargetSolutions(game.robots[0], 2, targetPositions, solutions);
      expect(solutions[0]).toEqual([
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
      expect(solutions.map((solution) => solution?.length)).toEqual([
        2, 2, 2, 2,
      ]);
    });
  });
});

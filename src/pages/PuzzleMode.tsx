import _ from "underscore";
import { useCallback, useMemo, useState } from "react";
import { Game, Robot } from "../game";
import { DGame, DrawSettings } from "../components";
import { Position } from "../utils";
import { SvgContainer } from "../SvgContainer";

export function PuzzleMode() {
  const [game, setGame]: [Game, any] = useState(
    Game.makeForSizeAndRobots(21, 21, [{ x: 10, y: 10 }]).pickRandomCrossedWalls(20, 10)
  );
  const [targetPosition, targetDistance] = useMemo(() => {
    const distanceMap = game.calculateReachableRobotPositions(game.robots[0]);
    return Array.from(distanceMap.entries())
      .filter(([, distance]) => distance >= 10)
      .sort(([, leftDistance], [, rightDistance]) => leftDistance - rightDistance)[0];
  }, [game.field]);
  const [robotPath, setRobotPath] = useState<[Position, Position][]>([]);
  const [drawSettings] = useState(new DrawSettings());
  const onRobotResetClick = useCallback(() => {
    setGame(game.moveRobot(game.robots[0], { x: 10, y: 10 }));
    setRobotPath([]);
  }, [game, setGame, setRobotPath]);
  const onUndoRobotMove = useCallback(() => {
    if (!robotPath.length) {
      return;
    }
    setGame(game.moveRobot(game.robots[0], robotPath[robotPath.length - 1][0]));
    setRobotPath(robotPath.slice(0, robotPath.length - 1));
  }, [game, setGame, robotPath, setRobotPath]);
  const onRobotMoveClick = useCallback((robot: Robot, nextPosition: Position) => {
    setGame(game.moveRobot(robot, nextPosition));
    setRobotPath([...robotPath, [robot.position, nextPosition]]);
  }, [game, setGame, robotPath, setRobotPath]);
  const onRandomCrossedWallsClick = useCallback(() => {
    setGame(game.pickRandomCrossedWalls(30, 10));
  }, [game]);
  return (
    <>
      <div>
        <button onClick={onRobotResetClick}>Reset robot</button>
        <button onClick={onUndoRobotMove} disabled={!robotPath.length}>Undo move</button>
        <button onClick={onRandomCrossedWallsClick}>New Puzzle</button>
      </div>
      <div>Current moves: {robotPath.length}/{targetDistance}</div>
      <SvgContainer>
        <DrawSettings.ContextProvider value={drawSettings}>
          <DGame
            game={game}
            robotPath={robotPath}
            showRobotControls
            onRobotMoveClick={onRobotMoveClick}
            targetPosition={targetPosition}
          />
        </DrawSettings.ContextProvider>
      </SvgContainer>
    </>
  );
}

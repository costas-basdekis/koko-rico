import _ from "underscore";
import { useCallback, useMemo, useState } from "react";
import { Game, Robot } from "../game";
import { DGame } from "../components";
import { Position } from "../utils";
import { SvgContainer } from "../SvgContainer";

export function SingleRobotPuzzleMode() {
  const [game, setGame]: [Game, any] = useState(makeGame);
  const [targetPosition, targetDistance] = useMemo(() => {
    const distanceMap = game.calculateReachableSingleRobotPositions(game.robots[0]);
    return Array.from(distanceMap.entries())
      .filter(([, distance]) => distance >= 10)
      .sort(([, leftDistance], [, rightDistance]) => leftDistance - rightDistance)[0];
  }, [game.field]);
  const onRobotResetClick = useCallback(() => {
    setGame(game.resetRobots([{ x: 10, y: 10 }]));
  }, [game, setGame]);
  const onUndoRobotMove = useCallback(() => {
    setGame(game.undoMoveRobot());
  }, [game, setGame]);
  const onRobotMoveClick = useCallback((robot: Robot, nextPosition: Position, isUndo: boolean) => {
    setGame(game.moveRobot(robot, nextPosition, isUndo));
  }, [game, setGame]);
  const onRandomCrossedWallsClick = useCallback(() => {
    setGame(makeGame);
  }, [setGame]);
  return (
    <>
      <div>
        <button onClick={onRobotResetClick}>Reset robot</button>
        <button onClick={onUndoRobotMove} disabled={!game.path.length}>Undo move</button>
        <button onClick={onRandomCrossedWallsClick}>New Puzzle</button>
      </div>
      <div>Current moves: {game.path.length}/{targetDistance}</div>
      <SvgContainer gridWidth={game.field.width} gridHeight={game.field.height} ensureFitsInWindow >
        <DGame
          game={game}
          showRobotControls
          onRobotMoveClick={onRobotMoveClick}
          targetPosition={targetPosition}
        />
      </SvgContainer>
    </>
  );
}

function makeGame(): Game {
  return Game.makeForSizeAndRobots(21, 21, [{ x: 10, y: 10 }]).pickRandomCrossedWalls(20, 10);
}

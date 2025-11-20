import _ from "underscore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Game, Robot } from "../game";
import { DGame } from "../components";
import { Position, positionsEqual } from "../utils";
import { SvgContainer } from "../SvgContainer";

const TargetDistance = 10;

export function SingleRobotPuzzleMode() {
  const [game, setGame]: [Game, any] = useState(makeGame);
  const [targetPositions, targetDistance] = useMemo(() => {
    const distanceMap = game.calculateReachableSingleRobotPositions(game.robots[0]);
    const [, targetDistance] = Array.from(distanceMap.entries())
      .filter(([, distance]) => distance >= TargetDistance)
      .sort(([, leftDistance], [, rightDistance]) => leftDistance - rightDistance)[0];
    const targetPositions = Array.from(distanceMap.entries())
      .filter(([, distance]) => distance === targetDistance)
      .map(([position]) => position);
    return [targetPositions, targetDistance];
  }, [game.field]);
  const [completedTargetPositions, setCompletedTargetPositions] = useState<Position[]>([]);
  useEffect(() => {
    setCompletedTargetPositions([]);
  }, [targetPositions]);
  const onRobotResetClick = useCallback(() => {
    setGame(game.resetRobots([{ x: 10, y: 10 }]));
  }, [game, setGame]);
  const onUndoRobotMove = useCallback(() => {
    setGame(game.undoMoveRobot());
  }, [game, setGame]);
  const onRobotMoveClick = useCallback((robot: Robot, nextPosition: Position, isUndo: boolean) => {
    const newGame = game.moveRobot(robot, nextPosition, isUndo);
    setGame(newGame);
    if (!isUndo && robot.index === 0 && newGame.path.length === targetDistance) {
      const completedTargetPosition = targetPositions.find(targetPosition => positionsEqual(nextPosition, targetPosition));
      if (completedTargetPosition && !completedTargetPositions.includes(completedTargetPosition)) {
        setCompletedTargetPositions([...completedTargetPositions, completedTargetPosition]);
      }
    }
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
      <div>Current moves: {game.path.length}/{targetDistance}, {completedTargetPositions.length}/{targetPositions.length} completed</div>
      <SvgContainer gridWidth={game.field.width} gridHeight={game.field.height} ensureFitsInWindow >
        <DGame
          game={game}
          showRobotControls
          onRobotMoveClick={onRobotMoveClick}
          targetPositions={targetPositions}
          completedTargetPositions={completedTargetPositions}
        />
      </SvgContainer>
    </>
  );
}

function makeGame(): Game {
  return Game.makeForSizeAndRobots(21, 21, [{ x: 10, y: 10 }]).pickRandomCrossedWalls(20, TargetDistance);
}

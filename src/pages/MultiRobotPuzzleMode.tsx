import _ from "underscore";
import { useCallback, useMemo, useState } from "react";
import { Game, Robot } from "../game";
import { DGame } from "../components";
import { Position } from "../utils";
import { SvgContainer } from "../SvgContainer";

const TargetDistance = 10;

export function MultiRobotPuzzleMode() {
  const [game, setGame]: [Game, any] = useState(makeGame);
  const [selectedRobotIndex, setSelectedRobotIndex] = useState(0);
  const [targetPosition, targetDistance] = useMemo(() => {
    const distanceMap = game.calculateReachableMultiRobotPositions(game.robots[0]);
    return Array.from(distanceMap.entries())
      .filter(([, distance]) => distance >= TargetDistance)
      .sort(([, leftDistance], [, rightDistance]) => leftDistance - rightDistance)[0];
  }, [game.field]);
  const onRobotResetClick = useCallback(() => {
    setGame(game.resetRobots([{ x: 10, y: 10 }, {x: 5, y: 5}, {x: 15, y: 5}]));
  }, [game, setGame]);
  const onUndoRobotMove = useCallback(() => {
    setGame(game.undoMoveRobot());
  }, [game, setGame]);
  const onRobotMoveClick = useCallback((robot: Robot, nextPosition: Position, isUndo: boolean) => {
    setGame(game.moveRobot(robot, nextPosition, isUndo));
  }, [game, setGame]);
  const onRandomCrossedWallsClick = useCallback(() => {
    setGame(makeGame());
  }, [setGame]);
  return (
    <>
      <div>
        <button onClick={onRobotResetClick}>Reset robots</button>
        <button onClick={onUndoRobotMove} disabled={!game.path.length}>Undo move</button>
        <button onClick={onRandomCrossedWallsClick}>New Puzzle</button>
      </div>
      <div>Current moves: {game.path.length}/{targetDistance}</div>
      <SvgContainer gridWidth={game.field.width} gridHeight={game.field.height} ensureFitsInWindow >
        <DGame
          game={game}
          showRobotControls
          selectedRobotIndex={selectedRobotIndex}
          onSelectedRobotIndexChange={setSelectedRobotIndex}
          onRobotMoveClick={onRobotMoveClick}
          targetPosition={targetPosition}
        />
      </SvgContainer>
    </>
  );
}

function makeGame(): Game {
  return Game.makeForSizeAndRobots(21, 21, [{ x: 10, y: 10 }, {x: 5, y: 5}, {x: 15, y: 5}]).pickRandomCrossedWalls(30, TargetDistance, true);
}

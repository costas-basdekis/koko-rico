import _ from "underscore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Game, Robot } from "../game";
import { DGame } from "../components";
import { Position, positionsEqual } from "../utils";
import { SvgContainer } from "../SvgContainer";
import { UsageInstructions } from "../UsageInstructions";

const DefaultDesiredTargetDistance = 5;

export function MultiRobotPuzzleMode() {
  const [desiredTargetDistance, setDesiredTargetDistance] = useState(DefaultDesiredTargetDistance);
  const [effectiveTargetDistance, setEffectiveTargetDistance] = useState(desiredTargetDistance);
  const [game, setGame]: [Game, any] = useState(() => {
    return makeGame(desiredTargetDistance);
  });
  useEffect(() => {
    setEffectiveTargetDistance(desiredTargetDistance);
    setGame(makeGame(desiredTargetDistance));
  }, [desiredTargetDistance, setEffectiveTargetDistance, setGame]);
  const [selectedRobotIndex, setSelectedRobotIndex] = useState(0);
  const [targetPositions, targetDistance] = useMemo(() => {
    const distanceMap = game.calculateReachableMultiRobotPositions(game.robots[0]);
    const [, targetDistance] = Array.from(distanceMap.entries())
      .filter(([, distance]) => distance >= effectiveTargetDistance)
      .sort(([, leftDistance], [, rightDistance]) => leftDistance - rightDistance)[0];
    const targetPositions = Array.from(distanceMap.entries())
      .filter(([, distance]) => distance === targetDistance)
      .map(([position]) => position);
    return [targetPositions, targetDistance];
  }, [game.field, effectiveTargetDistance]);
  const [completedTargetPositions, setCompletedTargetPositions] = useState<Position[]>([]);
  useEffect(() => {
    setCompletedTargetPositions([]);
  }, [targetPositions]);
  const onRobotResetClick = useCallback(() => {
    setGame(game.resetRobots());
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
    setGame(makeGame(effectiveTargetDistance));
  }, [setGame]);
  const onDesiredTargetDistanceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setDesiredTargetDistance(newValue);
  }, [setDesiredTargetDistance]);
  return (
    <>
      <div>
        <button onClick={onRobotResetClick}>Reset robots</button>
        <button onClick={onUndoRobotMove} disabled={!game.path.length}>Undo move</button>
        <button onClick={onRandomCrossedWallsClick}>New Puzzle</button>
      </div>
      <div>
        Desired target distance:
        <input type={"number"} value={desiredTargetDistance} onChange={onDesiredTargetDistanceChange} min={1} max={20} />
      </div>
      <div>Current moves: {game.path.length}/{targetDistance}, {completedTargetPositions.length}/{targetPositions.length} completed</div>
      <UsageInstructions />
      <SvgContainer gridWidth={game.field.width} gridHeight={game.field.height} ensureFitsInWindow >
        <DGame
          game={game}
          showRobotControls
          selectedRobotIndex={selectedRobotIndex}
          onSelectedRobotIndexChange={setSelectedRobotIndex}
          onRobotMoveClick={onRobotMoveClick}
          targetPositions={targetPositions}
          completedTargetPositions={completedTargetPositions}
        />
      </SvgContainer>
    </>
  );
}

function makeGame(desiredTargetDistance: number): Game {
  return Game.makeForSizeAndRobots(21, 21, [{ x: 10, y: 10 }, {x: 5, y: 5}, {x: 15, y: 5}]).pickRandomCrossedWalls(30, desiredTargetDistance, true);
}

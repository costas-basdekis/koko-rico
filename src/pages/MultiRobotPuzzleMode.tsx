import _ from "underscore";
import { useCallback, useMemo, useState } from "react";
import { Direction, Game, Robot } from "../game";
import { DGame } from "../components";
import { Position, useSavedGame } from "../utils";
import { SvgContainer } from "../SvgContainer";
import { UsageInstructions, useShowMoveInterpreter } from "../UsageInstructions";

const DefaultDesiredTargetDistance = 5;

export function MultiRobotPuzzleMode() {
  const {game, setGame, desiredTargetDistance, setDesiredTargetDistance, effectiveTargetDistance} =
    useSavedGame("multiRobotPuzzleGame", makeGame, DefaultDesiredTargetDistance);
  const [selectedRobotIndex, setSelectedRobotIndex] = useState(0);
  const [showOnlyOneTarget, setShowOnlyOneTarget] = useState(false);
  const visibleTargetPositions = useMemo(() => {
    if (!showOnlyOneTarget) {
      return game.targetPositions;
    }
    return [
      ...game.targetPositions.filter(target => game.completedTargetPositions.includes(target)),
      ...game.targetPositions.filter(target => !game.completedTargetPositions.includes(target)).slice(0, 1),
    ];
  }, [game.targetPositions, game.completedTargetPositions, showOnlyOneTarget]);
  const onRobotResetClick = useCallback(() => {
    setGame(game.resetRobots());
  }, [game, setGame]);
  const onUndoRobotMove = useCallback(() => {
    setGame(game.undoMoveRobot());
  }, [game, setGame]);
  const onRobotMoveClick = useCallback((robot: Robot, nextPosition: Position, isUndo: boolean) => {
    setGame(game.moveRobot(robot, nextPosition, isUndo));
  }, [game, setGame]);
  const onRandomCrossedWallsClick = useCallback(() => {
    setGame(makeGame(effectiveTargetDistance));
  }, [setGame]);
  const onDesiredTargetDistanceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setDesiredTargetDistance(newValue);
  }, [setDesiredTargetDistance]);
  const onShowOnlyOneTargetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setShowOnlyOneTarget(e.target.checked);
  }, [setShowOnlyOneTarget]);
  const [showMoveInterpreter, setShowMoveInterpreter] = useShowMoveInterpreter();
  const onTouchScreenMove = useCallback((direction: Direction) => {
    const nextPositionEntry = game.getRobotMoveInDirection(game.robots[selectedRobotIndex], direction);
    if (!nextPositionEntry) {
      return;
    }
    onRobotMoveClick(game.robots[selectedRobotIndex], nextPositionEntry.nextPosition, nextPositionEntry.isUndo);
  }, [game, selectedRobotIndex, onRobotMoveClick]);
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
        <label><input type={"checkbox"} checked={showOnlyOneTarget} onChange={onShowOnlyOneTargetChange} />Show only one target</label>
      </div>
      <div>Current moves: {game.path.length}/{game.targetDistance}, {game.completedTargetPositions.length}/{game.targetPositions.length} completed</div>
      <UsageInstructions showMoveInterpreter={showMoveInterpreter} onChangeShowMoveInterpreter={setShowMoveInterpreter} />
      <SvgContainer
        gridWidth={game.field.width} 
        gridHeight={game.field.height} 
        ensureFitsInWindow 
        onTouchScreenMove={onTouchScreenMove}
        showMoveInterpreter={showMoveInterpreter}
      >
        <DGame
          game={game}
          showRobotControls
          selectedRobotIndex={selectedRobotIndex}
          onSelectedRobotIndexChange={setSelectedRobotIndex}
          onRobotMoveClick={onRobotMoveClick}
          targetPositions={visibleTargetPositions}
        />
      </SvgContainer>
    </>
  );
}

function makeGame(desiredTargetDistance: number): Game {
  return Game
    .makeForSizeAndRobots(21, 21, [{ x: 10, y: 10 }, {x: 5, y: 5}, {x: 15, y: 5}])
    .pickRandomCrossedWalls(30, desiredTargetDistance, true)
    .pickTargets(desiredTargetDistance);
}

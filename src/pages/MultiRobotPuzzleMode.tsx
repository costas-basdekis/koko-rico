import _ from "underscore";
import { useCallback, useMemo, useState } from "react";
import { Direction, Game, Robot } from "../game";
import { DGame, DrawSettings } from "../components";
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
  const onDesiredTargetDistanceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
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
  const drawSettings = DrawSettings.use();
  const restrictTouchScreenMovesTo = useMemo(() => {
    const robot = game.robots[selectedRobotIndex];
    if (!robot) {
      return {};
    }
    return Object.fromEntries(game.getNextRobotPositionEntries(robot).map(({direction}) => [direction, true]));
  }, [game, selectedRobotIndex]);
  const moveInterpreterProps = useMemo(() => {
    return {
      stroke: drawSettings.robotColours[selectedRobotIndex],
    };
  }, [drawSettings, selectedRobotIndex]);
  return (
    <>
      <div>
        <button onClick={onRobotResetClick}>Reset robots</button>
        <button onClick={onUndoRobotMove} disabled={!game.path.length}>Undo move</button>
        <button onClick={onRandomCrossedWallsClick}>New Puzzle</button>
      </div>
      <div>
        <label>
          Desired target distance:
          <select value={desiredTargetDistance} onChange={onDesiredTargetDistanceChange}>
            {_.range(1, 21).map(value => (
              <option key={value} value={value}>{value}{value === 5 ? " - Default" : value === 10 ? " - Might take too long" : ""}</option>
            ))}
          </select>
        </label>
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
        moveInterpreterProps={moveInterpreterProps}
        restrictTouchScreenMovesTo={restrictTouchScreenMovesTo}
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

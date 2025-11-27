import _ from "underscore";
import { useCallback, useMemo, useState } from "react";
import { Direction, Game, Robot } from "../game";
import { DGame, MovesCounter, TargetsCounter } from "../components";
import { Position, useSavedGame } from "../utils";
import { SvgContainer } from "../SvgContainer";
import { UsageInstructions, useShowMoveInterpreter } from "../UsageInstructions";

const DefaultDesiredTargetDistance = 5;

export function SingleRobotPuzzleMode() {
  const {game, setGame, desiredTargetDistance, setDesiredTargetDistance, effectiveTargetDistance} =
    useSavedGame("singleRobotPuzzleGame", makeGame, DefaultDesiredTargetDistance);
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
  const [showMoveInterpreter, setShowMoveInterpreter] = useShowMoveInterpreter();
  const onTouchScreenMove = useCallback((direction: Direction) => {
    const nextPositionEntry = game.getRobotMoveInDirection(game.robots[0], direction);
    if (!nextPositionEntry) {
      return;
    }
    onRobotMoveClick(game.robots[0], nextPositionEntry.nextPosition, nextPositionEntry.isUndo);
  }, [game, onRobotMoveClick]);
  const restrictTouchScreenMovesTo = useMemo(() => {
    const robot = game.robots[0];
    if (!robot) {
      return {};
    }
    return Object.fromEntries(game.getNextRobotPositionEntries(robot).map(({direction}) => [direction, true]));
  }, [game]);
  return (
    <>
      <UsageInstructions
        showMoveInterpreter={showMoveInterpreter}
        onChangeShowMoveInterpreter={setShowMoveInterpreter}
        onRobotMove={onTouchScreenMove}
        onRobotReset={game.path.length ? onRobotResetClick : undefined}
        onUndoRobotMove={game.path.length ? onUndoRobotMove : undefined}
        onNewPuzzle={onRandomCrossedWallsClick}
        askForNewPuzzleConfirmation={game.completedTargetPositions.length !== game.targetPositions.length}
      />
      <div>
        <MovesCounter game={game} />
        <TargetsCounter
          game={game}
          showOnlyOneTarget={showOnlyOneTarget}
          onShowOnlyOneTargetChange={setShowOnlyOneTarget}
          desiredTargetDistance={desiredTargetDistance}
          onDesiredTargetDistanceChange={setDesiredTargetDistance}
        />
      </div>
      <SvgContainer
        gridWidth={game.field.width}
        gridHeight={game.field.height}
        ensureFitsInWindow
        onTouchScreenMove={onTouchScreenMove}
        showMoveInterpreter={showMoveInterpreter}
        restrictTouchScreenMovesTo={restrictTouchScreenMovesTo}
      >
        <DGame
          game={game}
          showRobotControls
          onRobotMoveClick={onRobotMoveClick}
          onRobotResetClick={onRobotResetClick}
          onNewGameClick={onRandomCrossedWallsClick}
          targetPositions={visibleTargetPositions}
        />
      </SvgContainer>
    </>
  );
}

function makeGame(desiredTargetDistance: number): Game {
  return Game
    .makeForSizeAndRobots(21, 21, [{ x: 10, y: 10 }])
    .pickRandomCrossedWalls(20, desiredTargetDistance)
    .pickTargets(desiredTargetDistance);
}

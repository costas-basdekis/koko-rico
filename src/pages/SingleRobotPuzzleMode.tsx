import _ from "underscore";
import { useCallback, useMemo, useRef, useState } from "react";
import { Direction, Game, Robot } from "../game";
import { Position } from "../utils";
import {
  DGame,
  MovesCounter,
  TargetsCounter,
  UsageInstructions,
  useShowMoveInterpreter,
  SvgContainer,
} from "../components/";
import { PuzzleService, useSavedGame } from "../hooks";

const DefaultDesiredTargetDistance = 5;

export function SingleRobotPuzzleMode() {
  const {
    game,
    redoStack,
    onReset,
    onUndo,
    onRedo,
    onRobotMove,
    onNewGame,
    gameLoading,
    desiredTargetDistance,
    setDesiredTargetDistance,
  } = useSavedGame(
    "singleRobotPuzzleGame",
    makeInitialGame,
    makeBackgroundGame,
    DefaultDesiredTargetDistance,
  );
  const [showOnlyOneTarget, setShowOnlyOneTarget] = useState(false);
  const visibleTargetPositions = useMemo(() => {
    if (!showOnlyOneTarget) {
      return game.targetPositions;
    }
    return [
      ...game.targetPositions.filter((target) =>
        game.completedTargetPositions.includes(target),
      ),
      ...game.targetPositions
        .filter((target) => !game.completedTargetPositions.includes(target))
        .slice(0, 1),
    ];
  }, [game.targetPositions, game.completedTargetPositions, showOnlyOneTarget]);
  const [showMoveInterpreter, setShowMoveInterpreter] =
    useShowMoveInterpreter();
  const onTouchScreenMove = useCallback(
    (direction: Direction) => {
      const nextPositionEntry = game.getRobotMoveInDirection(
        game.robots[0],
        direction,
      );
      if (!nextPositionEntry) {
        return;
      }
      onRobotMove(
        game.robots[0],
        nextPositionEntry.nextPosition,
        nextPositionEntry.isUndo,
      );
    },
    [game, onRobotMove],
  );
  const restrictTouchScreenMovesTo = useMemo(() => {
    const robot = game.robots[0];
    if (!robot) {
      return {};
    }
    return Object.fromEntries(
      game
        .getNextRobotPositionEntries(robot)
        .map(({ direction }) => [direction, true]),
    );
  }, [game]);
  const onShowSettingsRef = useRef<(() => void) | undefined>();
  return (
    <>
      <UsageInstructions
        gameLoading={gameLoading}
        showMoveInterpreter={showMoveInterpreter}
        onChangeShowMoveInterpreter={setShowMoveInterpreter}
        onRobotMove={onTouchScreenMove}
        onRobotReset={game.path.length ? onReset : undefined}
        onUndoRobotMove={game.path.length ? onUndo : undefined}
        onRedoRobotMove={redoStack.length ? onRedo : undefined}
        onNewPuzzle={onNewGame}
        askForNewPuzzleConfirmation={
          game.completedTargetPositions.length !== game.targetPositions.length
        }
        onShowSettingsRef={onShowSettingsRef}
        showOnlyOneTarget={showOnlyOneTarget}
        onShowOnlyOneTargetChange={setShowOnlyOneTarget}
        desiredTargetDistance={desiredTargetDistance}
        onDesiredTargetDistanceChange={setDesiredTargetDistance}
      />
      <div>
        <MovesCounter game={game} />
        <TargetsCounter game={game} />
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
          onUndoRobotMove={onUndo}
          onRedoRobotMove={onRedo}
          onRobotMoveClick={onRobotMove}
          onRobotResetClick={onReset}
          onNewGameClick={onNewGame}
          targetPositions={visibleTargetPositions}
          onShowSettings={onShowSettingsRef.current}
        />
      </SvgContainer>
    </>
  );
}

function makeInitialGame(): Game {
  return Game.makeForSizeAndRobots(21, 21, [{ x: 10, y: 10 }]);
}

function makeBackgroundGame(
  desiredTargetDistance: number,
  puzzleService: PuzzleService,
  setGameOrError: (gameOrError: Game | string) => void,
) {
  puzzleService.request(
    {
      serialised: makeInitialGame().serialise(),
      count: 20,
      desiredTargetDistance,
    },
    setGameOrError,
  );
}

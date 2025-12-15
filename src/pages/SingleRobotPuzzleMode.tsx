import _ from "underscore";
import { useCallback, useMemo, useRef, useState } from "react";
import { Direction, Game, GameTargets } from "../game";
import {
  DGame,
  MovesCounter,
  TargetsCounter,
  UsageInstructions,
  useShowMoveInterpreter,
  SvgContainer,
  SimplePuzzleSettingsDialog,
} from "../components/";
import { PuzzleService, useSavedGame } from "../hooks";

const DefaultDesiredTargetDistance = 5;

export function SingleRobotPuzzleMode() {
  const {
    game,
    gameTargets,
    history,
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
      return gameTargets.targetPositions;
    }
    return [gameTargets.getOneTarget()];
  }, [gameTargets, showOnlyOneTarget]);
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
  const [onShowSettings, setOnShowSettings] = useState<
    (() => void) | undefined
  >(undefined);
  return (
    <>
      <UsageInstructions
        gameLoading={gameLoading}
        showMoveInterpreter={showMoveInterpreter}
        onChangeShowMoveInterpreter={setShowMoveInterpreter}
        onRobotMove={onTouchScreenMove}
        onRobotReset={history.canUndo() ? onReset : undefined}
        onUndoRobotMove={history.canUndo() ? onUndo : undefined}
        undoRobotIndex={1}
        onRedoRobotMove={history.canRedo() ? onRedo : undefined}
        redoRobotIndex={1}
        onNewPuzzle={onNewGame}
        askForNewPuzzleConfirmation={
          gameTargets.completedTargetPositions.length !==
          gameTargets.targetPositions.length
        }
        onShowSettings={onShowSettings}
      />
      <SimplePuzzleSettingsDialog
        onShowSettingsRef={setOnShowSettings}
        showOnlyOneTarget={showOnlyOneTarget}
        onShowOnlyOneTargetChange={setShowOnlyOneTarget}
        desiredTargetDistance={desiredTargetDistance}
        onDesiredTargetDistanceChange={setDesiredTargetDistance}
      />
      <div>
        <MovesCounter game={game} gameTargets={gameTargets} />
        <br />
        <TargetsCounter gameTargets={gameTargets} />
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
          gameTargets={gameTargets}
          showRobotControls
          onUndoRobotMove={onUndo}
          onRedoRobotMove={onRedo}
          onRobotMoveClick={onRobotMove}
          onRobotResetClick={onReset}
          onNewGameClick={onNewGame}
          targetPositions={visibleTargetPositions}
          onShowSettings={onShowSettings}
        />
      </SvgContainer>
    </>
  );
}

function makeInitialGame(): { game: Game; gameTargets: GameTargets } {
  return {
    game: Game.makeForSizeAndRobots(21, 21, [{ x: 10, y: 10 }]),
    gameTargets: GameTargets.empty(),
  };
}

function makeBackgroundGame(
  desiredTargetDistance: number,
  puzzleService: PuzzleService,
  setGameOrError: (
    gameOrError: { game: Game; gameTargets: GameTargets } | string,
  ) => void,
) {
  puzzleService.request(
    {
      serialised: makeInitialGame().game.serialise(),
      count: 20,
      desiredTargetDistance,
    },
    setGameOrError,
  );
}

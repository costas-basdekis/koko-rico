import _ from "underscore";
import { useCallback, useMemo, useState } from "react";
import { Direction, Game, GameTargets } from "../game";
import {
  DGame,
  MovesCounter,
  TargetsCounter,
  UsageInstructions,
  SvgContainer,
  SimplePuzzleSettingsDialog,
  useShowSettingsDialog,
  ShowSolutionConfirmationDialog,
} from "../components/";
import { useSavedGame, useSettings } from "../hooks";
import { PuzzleService } from "../utils";

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
  const [settings, setSettings] = useSettings();
  const visibleTargetPositions = useMemo(() => {
    if (!settings.showOnlyOneTarget) {
      return gameTargets.targetPositions;
    }
    return [gameTargets.getOneTarget()];
  }, [gameTargets, settings.showOnlyOneTarget]);
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
  const [showSettingsDialog, setShowSettingsDialog] = useShowSettingsDialog();
  const [targetIndexForSolution, setTargetIndexForSolution] = useState<
    number | null
  >(null);
  const onSolutionCancel = useCallback(() => {
    setTargetIndexForSolution(null);
  }, [setTargetIndexForSolution]);
  const onSolutionConfirm = useCallback(() => {
    if (targetIndexForSolution === null) {
      return;
    }
    setTargetIndexForSolution(null);
  }, [targetIndexForSolution]);
  return (
    <>
      <UsageInstructions
        gameLoading={gameLoading}
        showMoveInterpreter={settings.showMoveInterpreter}
        onChangeShowMoveInterpreter={setSettings.setShowMoveInterpreter}
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
        onShowSettings={showSettingsDialog}
      />
      <SimplePuzzleSettingsDialog
        setShowSettingsDialog={setShowSettingsDialog}
        settings={settings}
        setSettings={setSettings}
        desiredTargetDistance={desiredTargetDistance}
        onDesiredTargetDistanceChange={setDesiredTargetDistance}
      />
      <ShowSolutionConfirmationDialog
        open={targetIndexForSolution !== null}
        onConfirm={onSolutionConfirm}
        onCancel={onSolutionCancel}
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
        showMoveInterpreter={settings.showMoveInterpreter}
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
          showPathIcons={settings.showPathIcons}
          targetPositions={visibleTargetPositions}
          onShowSettings={showSettingsDialog}
          showSolutionIcons={settings.showSolutionIcons}
          onSolutionClick={setTargetIndexForSolution}
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

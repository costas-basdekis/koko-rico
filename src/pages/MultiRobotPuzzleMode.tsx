import _ from "underscore";
import { useCallback, useMemo, useState } from "react";
import { Direction, Game, GameTargets } from "../game";
import {
  ButtonRow,
  DGame,
  DrawSettings,
  MovesCounter,
  TargetsCounter,
  UsageInstructions,
  SvgContainer,
  SimplePuzzleSettingsDialog,
  useShowSettingsDialog,
  ShowSolutionConfirmationDialog,
} from "../components";
import { PuzzleService, useSavedGame, useSettings } from "../hooks";

const DefaultDesiredTargetDistance = 5;

export function MultiRobotPuzzleMode() {
  const {
    game,
    setGame,
    gameTargets,
    history,
    onReset,
    onUndo,
    onRedo,
    onRobotMove,
    gameLoading,
    onNewGame,
    desiredTargetDistance,
    setDesiredTargetDistance,
    findingSolution,
    onFindSolution,
  } = useSavedGame(
    "multiRobotPuzzleGame",
    makeInitialGame,
    makeBackgroundGame,
    DefaultDesiredTargetDistance,
  );
  const [selectedRobotIndex, setSelectedRobotIndex] = useState(0);
  const onSelectedRobotIndexChange = useCallback(
    (index: number) => {
      setSelectedRobotIndex((index + game.robots.length) % game.robots.length);
    },
    [setSelectedRobotIndex, game.robots.length],
  );
  const [
    { showMoveInterpreter, showOnlyOneTarget, showSolutionIcons },
    { setShowMoveInterpreter, setShowOnlyOneTarget, setShowSolutionIcons },
  ] = useSettings();
  const visibleTargetPositions = useMemo(() => {
    if (!showOnlyOneTarget) {
      return gameTargets.targetPositions;
    }
    return [gameTargets.getOneTarget()];
  }, [gameTargets, showOnlyOneTarget]);
  const onTouchScreenMove = useCallback(
    (direction: Direction) => {
      const nextPositionEntry = game.getRobotMoveInDirection(
        game.robots[selectedRobotIndex],
        direction,
      );
      if (!nextPositionEntry) {
        return;
      }
      onRobotMove(
        game.robots[selectedRobotIndex],
        nextPositionEntry.nextPosition,
        nextPositionEntry.isUndo,
      );
    },
    [game, selectedRobotIndex, onRobotMove],
  );
  const drawSettings = DrawSettings.use();
  const restrictTouchScreenMovesTo = useMemo(() => {
    const robot = game.robots[selectedRobotIndex];
    if (!robot) {
      return {};
    }
    return Object.fromEntries(
      game
        .getNextRobotPositionEntries(robot)
        .map(({ direction }) => [direction, true]),
    );
  }, [game, selectedRobotIndex]);
  const moveInterpreterProps = useMemo(() => {
    return {
      stroke: drawSettings.robotColours[selectedRobotIndex],
    };
  }, [drawSettings, selectedRobotIndex]);
  const [showSettingsDialog, setShowSettingsDialog] = useShowSettingsDialog();
  const onTargetPathClick = useCallback(
    (targetIndex: number) => {
      const targetPath = gameTargets.completedTargetPaths[targetIndex];
      if (!targetPath) {
        return;
      }
      setGame(history.first.applyRobotPath(targetPath));
    },
    [gameTargets, setGame, history],
  );
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
    const newGameTargets = gameTargets.concedeTarget(targetIndexForSolution);
    const targetPath =
      newGameTargets.completedTargetPaths[targetIndexForSolution];
    if (targetPath) {
      setGame(history.first.applyRobotPath(targetPath), newGameTargets);
    }
    setTargetIndexForSolution(null);
  }, [targetIndexForSolution, setTargetIndexForSolution, gameTargets, history]);
  return (
    <>
      <UsageInstructions
        gameLoading={gameLoading}
        showMoveInterpreter={showMoveInterpreter}
        onChangeShowMoveInterpreter={setShowMoveInterpreter}
        selectedRobotIndex={selectedRobotIndex}
        robotCount={game.robots.length}
        onSelectedRobotIndexChange={onSelectedRobotIndexChange}
        onRobotMove={onTouchScreenMove}
        onRobotReset={history.canUndo() ? onReset : undefined}
        onUndoRobotMove={history.canUndo() ? onUndo : undefined}
        undoRobotIndex={game.getUndoRobotIndex()}
        onRedoRobotMove={history.canRedo() ? onRedo : undefined}
        redoRobotIndex={history.getRedoItem()?.getUndoRobotIndex()}
        onNewPuzzle={onNewGame}
        askForNewPuzzleConfirmation={
          gameTargets.completedTargetPositions.length !==
          gameTargets.targetPositions.length
        }
        onShowSettings={showSettingsDialog}
      />
      <SimplePuzzleSettingsDialog
        setShowSettingsDialog={setShowSettingsDialog}
        showOnlyOneTarget={showOnlyOneTarget}
        onShowOnlyOneTargetChange={setShowOnlyOneTarget}
        desiredTargetDistance={desiredTargetDistance}
        onDesiredTargetDistanceChange={setDesiredTargetDistance}
        showSolutionIcons={showSolutionIcons}
        onShowSolutionIconsChange={setShowSolutionIcons}
      />
      <ShowSolutionConfirmationDialog
        open={targetIndexForSolution !== null}
        hasSolution={
          targetIndexForSolution !== null &&
          gameTargets.solutions[targetIndexForSolution] !== null
        }
        findingSolution={findingSolution}
        onFindSolution={onFindSolution}
        onConfirm={onSolutionConfirm}
        onCancel={onSolutionCancel}
      />
      <ButtonRow>
        <MovesCounter game={game} gameTargets={gameTargets} />
        <br />
        <TargetsCounter gameTargets={gameTargets} />
      </ButtonRow>
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
          gameTargets={gameTargets}
          showRobotControls
          selectedRobotIndex={selectedRobotIndex}
          onSelectedRobotIndexChange={setSelectedRobotIndex}
          onUndoRobotMove={onUndo}
          onRedoRobotMove={onRedo}
          onRobotMoveClick={onRobotMove}
          onRobotResetClick={onReset}
          onNewGameClick={onNewGame}
          onShowSettings={showSettingsDialog}
          targetPositions={visibleTargetPositions}
          onTargetPathClick={onTargetPathClick}
          showSolutionIcons={showSolutionIcons}
          onSolutionClick={setTargetIndexForSolution}
        />
      </SvgContainer>
    </>
  );
}

function makeInitialGame(): { game: Game; gameTargets: GameTargets } {
  return {
    game: Game.makeForSizeAndRobots(21, 21, [
      { x: 10, y: 10 },
      { x: 5, y: 5 },
      { x: 15, y: 5 },
    ]),
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
      count: 30,
      desiredTargetDistance,
    },
    setGameOrError,
  );
}

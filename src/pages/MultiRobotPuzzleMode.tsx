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
} from "../components";
import { PuzzleService, useSavedGame, useSettings } from "../hooks";

const DefaultDesiredTargetDistance = 5;

export function MultiRobotPuzzleMode() {
  const {
    game,
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
    { showMoveInterpreter, showOnlyOneTarget },
    { setShowMoveInterpreter, setShowOnlyOneTarget },
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
  const [onShowSettings, setOnShowSettings] = useState<
    (() => void) | undefined
  >(undefined);
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
        onShowSettings={onShowSettings}
      />
      <SimplePuzzleSettingsDialog
        onShowSettingsRef={setOnShowSettings}
        showOnlyOneTarget={showOnlyOneTarget}
        onShowOnlyOneTargetChange={setShowOnlyOneTarget}
        desiredTargetDistance={desiredTargetDistance}
        onDesiredTargetDistanceChange={setDesiredTargetDistance}
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
          onShowSettings={onShowSettings}
          targetPositions={visibleTargetPositions}
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

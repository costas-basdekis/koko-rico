import _ from "underscore";
import { useCallback, useMemo, useRef, useState } from "react";
import { Direction, Game, GameTargets } from "../game";
import {
  ButtonRow,
  DGame,
  DrawSettings,
  MovesCounter,
  TargetsCounter,
  UsageInstructions,
  useShowMoveInterpreter,
  SvgContainer,
  SimplePuzzleSettingsDialog,
} from "../components";
import { PuzzleService, useSavedGame } from "../hooks";

const DefaultDesiredTargetDistance = 5;

export function MultiRobotPuzzleMode() {
  const {
    game,
    redoStack,
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
  const [showOnlyOneTarget, setShowOnlyOneTarget] = useState(false);
  const visibleTargetPositions = useMemo(() => {
    if (!showOnlyOneTarget) {
      return game.targetPositions;
    }
    if (
      game.targetPositions.length ===
      game.completedTargetPositions.length +
        game.silverTargetPositions.length +
        game.bronzeTargetPositions.length
    ) {
      return [
        game.bronzeTargetPositions[0] ??
          game.silverTargetPositions[0] ??
          game.completedTargetPositions[0],
      ];
    }
    return game.targetPositions
      .filter(
        (target) =>
          !(
            game.completedTargetPositions.includes(target) ||
            game.silverTargetPositions.includes(target) ||
            game.bronzeTargetPositions.includes(target)
          ),
      )
      .slice(0, 1);
  }, [game.targetPositions, game.completedTargetPositions, showOnlyOneTarget]);
  const [showMoveInterpreter, setShowMoveInterpreter] =
    useShowMoveInterpreter();
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
        onSelectedRobotIndexChange={onSelectedRobotIndexChange}
        onRobotMove={onTouchScreenMove}
        onRobotReset={game.path.length ? onReset : undefined}
        onUndoRobotMove={game.path.length ? onUndo : undefined}
        onRedoRobotMove={redoStack.length ? onRedo : undefined}
        onNewPuzzle={onNewGame}
        askForNewPuzzleConfirmation={
          game.completedTargetPositions.length !== game.targetPositions.length
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
        <MovesCounter game={game} />
        <br />
        <TargetsCounter game={game} />
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

function makeInitialGame(): Game {
  return Game.makeForSizeAndRobots(21, 21, [
    { x: 10, y: 10 },
    { x: 5, y: 5 },
    { x: 15, y: 5 },
  ]);
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
      serialised: makeInitialGame().serialise(),
      count: 30,
      desiredTargetDistance,
    },
    setGameOrError,
  );
}

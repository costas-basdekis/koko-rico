import _ from "underscore";
import { useCallback, useMemo, useState } from "react";
import { Direction, Game, Robot } from "../game";
import {
  DGame,
  DrawSettings,
  MovesCounter,
  TargetsCounter,
} from "../components";
import { Position } from "../utils";
import { SvgContainer } from "../SvgContainer";
import {
  UsageInstructions,
  useShowMoveInterpreter,
} from "../UsageInstructions";
import { PuzzleService, useSavedGame } from "../hooks";

const DefaultDesiredTargetDistance = 5;

export function MultiRobotPuzzleMode() {
  const {
    game,
    setGame,
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
    return [
      ...game.targetPositions.filter((target) =>
        game.completedTargetPositions.includes(target),
      ),
      ...game.targetPositions
        .filter((target) => !game.completedTargetPositions.includes(target))
        .slice(0, 1),
    ];
  }, [game.targetPositions, game.completedTargetPositions, showOnlyOneTarget]);
  const onRobotResetClick = useCallback(() => {
    setGame(game.resetRobots());
  }, [game, setGame]);
  const onUndoRobotMove = useCallback(() => {
    setGame(game.undoMoveRobot());
  }, [game, setGame]);
  const onRobotMoveClick = useCallback(
    (robot: Robot, nextPosition: Position, isUndo: boolean) => {
      setGame(game.moveRobot(robot, nextPosition, isUndo));
    },
    [game, setGame],
  );
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
      onRobotMoveClick(
        game.robots[selectedRobotIndex],
        nextPositionEntry.nextPosition,
        nextPositionEntry.isUndo,
      );
    },
    [game, selectedRobotIndex, onRobotMoveClick],
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
  return (
    <>
      <UsageInstructions
        gameLoading={gameLoading}
        showMoveInterpreter={showMoveInterpreter}
        onChangeShowMoveInterpreter={setShowMoveInterpreter}
        selectedRobotIndex={selectedRobotIndex}
        onSelectedRobotIndexChange={onSelectedRobotIndexChange}
        onRobotMove={onTouchScreenMove}
        onRobotReset={game.path.length ? onRobotResetClick : undefined}
        onUndoRobotMove={game.path.length ? onUndoRobotMove : undefined}
        onNewPuzzle={onNewGame}
        askForNewPuzzleConfirmation={
          game.completedTargetPositions.length !== game.targetPositions.length
        }
      />
      <div className={"button-row"}>
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
        moveInterpreterProps={moveInterpreterProps}
        restrictTouchScreenMovesTo={restrictTouchScreenMovesTo}
      >
        <DGame
          game={game}
          showRobotControls
          selectedRobotIndex={selectedRobotIndex}
          onSelectedRobotIndexChange={setSelectedRobotIndex}
          onRobotMoveClick={onRobotMoveClick}
          onRobotResetClick={onRobotResetClick}
          onNewGameClick={onNewGame}
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
  setGameOrError: (gameOrError: Game | string) => void,
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

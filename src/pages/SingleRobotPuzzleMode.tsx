import _ from "underscore";
import { useCallback, useMemo, useState } from "react";
import { Direction, Game, Robot } from "../game";
import { DGame, MovesCounter, TargetsCounter } from "../components";
import { Position } from "../utils";
import { SvgContainer } from "../SvgContainer";
import {
  UsageInstructions,
  useShowMoveInterpreter,
} from "../UsageInstructions";
import { PuzzleService, useSavedGame } from "../hooks";

const DefaultDesiredTargetDistance = 5;

export function SingleRobotPuzzleMode() {
  const {
    game,
    setGame,
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
        game.robots[0],
        direction,
      );
      if (!nextPositionEntry) {
        return;
      }
      onRobotMoveClick(
        game.robots[0],
        nextPositionEntry.nextPosition,
        nextPositionEntry.isUndo,
      );
    },
    [game, onRobotMoveClick],
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
  return (
    <>
      <UsageInstructions
        gameLoading={gameLoading}
        showMoveInterpreter={showMoveInterpreter}
        onChangeShowMoveInterpreter={setShowMoveInterpreter}
        onRobotMove={onTouchScreenMove}
        onRobotReset={game.path.length ? onRobotResetClick : undefined}
        onUndoRobotMove={game.path.length ? onUndoRobotMove : undefined}
        onNewPuzzle={onNewGame}
        askForNewPuzzleConfirmation={
          game.completedTargetPositions.length !== game.targetPositions.length
        }
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
          onNewGameClick={onNewGame}
          targetPositions={visibleTargetPositions}
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

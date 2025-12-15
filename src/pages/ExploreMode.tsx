import _ from "underscore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Game, WallType, Robot, Direction, GameBuilder } from "../game";
import {
  loadGameFromLocalStorage,
  Position,
  PositionMap,
  positionsEqual,
  saveGameToLocalStorage,
} from "../utils";
import {
  DGame,
  DrawSettings,
  UsageInstructions,
  SvgContainer,
  SettingsDialog,
} from "../components";
import { useSettings } from "../hooks";

export function ExploreMode() {
  const [game, setGame]: [Game, any] = useState(
    () =>
      loadGameFromLocalStorage("exploreGame")?.game ??
      Game.makeForSizeAndRobots(21, 21, [{ x: 10, y: 10 }]),
  );
  useEffect(() => {
    saveGameToLocalStorage("exploreGame", game, null);
  }, [game]);
  const [selectedRobotIndex, setSelectedRobotIndex] = useState(0);
  const onSelectedRobotIndexChange = useCallback(
    (index: number) => {
      setSelectedRobotIndex((index + game.robots.length) % game.robots.length);
    },
    [setSelectedRobotIndex, game.robots.length],
  );
  const onGhostWallClick = useCallback(
    (position: Position, type: WallType) => {
      const newGame = game.toggleWall(position, type);
      setGame(newGame);
    },
    [game],
  );
  const onRobotResetClick = useCallback(() => {
    setGame(game.resetRobots());
  }, [game, setGame]);
  const onUndoRobotMove = useCallback(() => {
    setGame(game.undoMoveRobot());
  }, [game, setGame]);
  const onRandomCrossedWallsClick = useCallback(() => {
    setGame(
      new GameBuilder().pickRandomCrossedWallsProgressively(game, 30, 10),
    );
  }, [game]);
  const [distanceMap, setDistanceMap] = useState<PositionMap<number> | null>(
    null,
  );
  const [desiredMaxDistance, setDesiredMaxDistance] = useState(10);
  const onDistanceMapChange = useCallback(
    (newDistanceMap: PositionMap<number> | null) => {
      setDistanceMap(newDistanceMap);
    },
    [setDistanceMap],
  );
  const maxDistance = useMemo(() => {
    if (!distanceMap) {
      return null;
    }
    return Math.max(...distanceMap.values());
  }, [distanceMap]);
  const onRobotMoveClick = useCallback(
    (robot: Robot, nextPosition: Position, isUndo: boolean) => {
      setGame(game.moveRobot(robot, nextPosition, isUndo));
    },
    [game, setGame],
  );
  const onRobotCountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const robotCount = parseInt(e.target.value, 10);
      if (robotCount < game.robots.length) {
        setGame(game.removeRobots(game.robots.length - robotCount));
      } else if (robotCount > game.robots.length) {
        const newPositions: Position[] = [];
        for (let i = game.robots.length; i < robotCount; i++) {
          const position = { x: 10, y: 10 };
          while (
            game.robots.some((robot) =>
              positionsEqual(robot.position, position),
            )
          ) {
            position.x = Math.floor(Math.random() * game.field.width);
            position.y = Math.floor(Math.random() * game.field.height);
          }
          newPositions.push(position);
        }
        setGame(game.addRobots(newPositions));
      }
    },
    [game, setGame],
  );
  const [{ showMoveInterpreter }, { setShowMoveInterpreter }] = useSettings();
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
  const [onShowSettings, setOnShowSettings] = useState<
    (() => void) | undefined
  >(undefined);
  return (
    <>
      <UsageInstructions
        showMoveInterpreter={showMoveInterpreter}
        onChangeShowMoveInterpreter={setShowMoveInterpreter}
        selectedRobotIndex={selectedRobotIndex}
        robotCount={game.robots.length}
        onSelectedRobotIndexChange={
          game.robots.length > 1 ? onSelectedRobotIndexChange : undefined
        }
        onRobotMove={onTouchScreenMove}
        onRobotReset={game.path.length ? onRobotResetClick : undefined}
        onUndoRobotMove={game.path.length ? onUndoRobotMove : undefined}
        undoRobotIndex={game.getUndoRobotIndex()}
        onNewPuzzle={onRandomCrossedWallsClick}
        onShowSettings={onShowSettings}
      />
      <ExploreSettingsDialog
        onShowSettingsRef={setOnShowSettings}
        game={game}
        onRobotCountChange={onRobotCountChange}
        desiredMaxDistance={desiredMaxDistance}
        onDesiredTargetDistanceChange={setDesiredMaxDistance}
      />
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
          showDistances
          maxDistance={desiredMaxDistance}
          showGhostWalls
          onGhostWallClick={onGhostWallClick}
          onDistanceMapChange={onDistanceMapChange}
          showRobotControls
          selectedRobotIndex={selectedRobotIndex}
          onSelectedRobotIndexChange={setSelectedRobotIndex}
          onRobotResetClick={onRobotResetClick}
          onNewGameClick={onRandomCrossedWallsClick}
          onRobotMoveClick={onRobotMoveClick}
        />
      </SvgContainer>
    </>
  );
}

interface ExploreSettingsDialogProps {
  onShowSettingsRef?: (onShowSettings?: () => void) => void;
  game: Game;
  onRobotCountChange: React.ChangeEventHandler;
  desiredMaxDistance: number;
  onDesiredTargetDistanceChange: (desiredTargetDistance: number) => void;
}

function ExploreSettingsDialog({
  onShowSettingsRef,
  game,
  onRobotCountChange,
  desiredMaxDistance,
  onDesiredTargetDistanceChange,
}: ExploreSettingsDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const onDialogOpen = useCallback(() => {
    setDialogOpen(true);
  }, [setDialogOpen]);
  useEffect(() => {
    onShowSettingsRef?.(() => {
      return onDialogOpen;
    });
    return () => {
      onShowSettingsRef?.(undefined);
    };
  }, [onShowSettingsRef, onDialogOpen]);
  const innerOnDesiredTargetDistanceChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = parseInt(e.target.value, 10);
      onDesiredTargetDistanceChange?.(newValue);
    },
    [onDesiredTargetDistanceChange],
  );
  const options = useMemo(() => {
    return _.range(2, 40 + 1).map((value) => (
      <option key={value} value={value}>
        {value}
        {value === 10 ? " - Default" : value === 11 ? " - Slow" : ""}
      </option>
    ));
  }, [20]);
  return (
    <SettingsDialog open={dialogOpen} onSetOpen={setDialogOpen}>
      <label>
        <input
          type={"radio"}
          value={"1"}
          onChange={onRobotCountChange}
          checked={game.robots.length === 1}
        />
        1 robot
      </label>
      <label>
        <input
          type={"radio"}
          value={"2"}
          onChange={onRobotCountChange}
          checked={game.robots.length === 2}
        />
        2 robots
      </label>
      <label>
        <input
          type={"radio"}
          value={"3"}
          onChange={onRobotCountChange}
          checked={game.robots.length === 3}
        />
        3 robots
      </label>
      <br />
      {
        <label>
          Distance:
          <select
            value={desiredMaxDistance}
            onChange={innerOnDesiredTargetDistanceChange}
          >
            {options}
          </select>
        </label>
      }
    </SettingsDialog>
  );
}

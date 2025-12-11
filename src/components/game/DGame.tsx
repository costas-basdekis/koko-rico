import { useCallback, useEffect, useMemo } from "react";
import {
  Direction,
  Game,
  GameTargets,
  NextPositionEntriesMap,
  Robot,
  WallType,
} from "../../game";
import { Position, PositionMap } from "../../utils";
import { DField } from "./DField";
import { DFieldDistances } from "./DFieldDistances";
import { DRobot } from "./DRobot";
import { useHotkeys } from "react-hotkeys-hook";

export interface DGameProps {
  game: Game;
  gameTargets?: GameTargets;
  showDistances?: boolean;
  maxDistance?: number;
  showGhostWalls?: boolean;
  onGhostWallClick?: (position: Position, type: WallType) => void;
  onDistanceMapChange?: (distanceMap: PositionMap<number> | null) => void;
  showRobotControls?: boolean;
  selectedRobotIndex?: number;
  onSelectedRobotIndexChange?: (index: number) => void;
  onRobotMoveClick?: (
    robot: Robot,
    nextPosition: Position,
    isUndo: boolean,
  ) => void;
  onUndoRobotMove?: () => void;
  onRedoRobotMove?: () => void;
  onRobotResetClick?: () => void;
  onNewGameClick?: () => void;
  onShowSettings?: () => void;
  targetPositions?: Position[];
}

const directionFilterMap: Map<
  Direction,
  (left: Position, right: Position) => boolean
> = new Map([
  [Direction.Left, (left, right) => left.x < right.x],
  [Direction.Right, (left, right) => left.x > right.x],
  [Direction.Up, (left, right) => left.y < right.y],
  [Direction.Down, (left, right) => left.y > right.y],
]);

const hotkeyDirectionMap: Map<string, Direction> = new Map([
  ["left", Direction.Left],
  ["right", Direction.Right],
  ["up", Direction.Up],
  ["down", Direction.Down],
]);

export function DGame({
  game,
  gameTargets,
  showDistances = false,
  maxDistance,
  showGhostWalls = false,
  onGhostWallClick,
  onDistanceMapChange,
  showRobotControls = false,
  selectedRobotIndex = 0,
  onSelectedRobotIndexChange,
  onUndoRobotMove,
  onRedoRobotMove,
  onRobotMoveClick,
  onRobotResetClick,
  onNewGameClick,
  onShowSettings,
  targetPositions = gameTargets?.targetPositions,
}: DGameProps) {
  const distanceMap = useMemo(() => {
    if (!showDistances || maxDistance === undefined) {
      return null;
    }
    if (!game.robots.length) {
      return null;
    }
    if (game.robots.length === 1) {
      return game.calculateReachableSingleRobotPositions(
        game.robots[selectedRobotIndex],
        maxDistance,
      );
    } else {
      return game.calculateReachableMultiRobotPositions(
        game.robots[selectedRobotIndex],
        maxDistance,
      );
    }
  }, [game, showDistances, maxDistance, selectedRobotIndex]);
  useEffect(() => {
    onDistanceMapChange?.(distanceMap);
  }, [distanceMap]);
  const nextRobotsPositionEntries: NextPositionEntriesMap = useMemo(() => {
    if (!showRobotControls) {
      return new Map();
    }
    return game.getNextRobotsPositionEntries();
  }, [game, showRobotControls]);
  const robotPositions = useMemo(() => {
    if (!showRobotControls) {
      return undefined;
    }
    return new Map(game.robots.map((robot) => [robot.index, robot.position]));
  }, [game, showRobotControls]);
  const onRobotNextPositionClick = useCallback(
    (robot: Robot, nextPosition: Position, isUndo: boolean) => {
      onRobotMoveClick?.(robot, nextPosition, isUndo);
    },
    [onRobotMoveClick],
  );
  const onDirectionKeyPress = useCallback(
    (direction: Direction) => {
      if (!onRobotMoveClick) {
        return;
      }
      if (!game.robots[selectedRobotIndex]) {
        return;
      }
      const nextRobotPositionEntry = game.getRobotMoveInDirection(
        game.robots[selectedRobotIndex],
        direction,
        nextRobotsPositionEntries,
      );
      if (!nextRobotPositionEntry) {
        return;
      }
      onRobotMoveClick?.(
        game.robots[selectedRobotIndex],
        nextRobotPositionEntry.nextPosition,
        nextRobotPositionEntry.isUndo,
      );
    },
    [game, nextRobotsPositionEntries, onRobotMoveClick, selectedRobotIndex],
  );
  useHotkeys(
    ["left", "right", "up", "down", "b", "shift+b", "u", "r", "t", "n", "s"],
    (e, { hotkey }) => {
      e.preventDefault();
      if (hotkey === "b") {
        onSelectedRobotIndexChange?.(
          (selectedRobotIndex + 1) % game.robots.length,
        );
      } else if (hotkey === "shift+b") {
        onSelectedRobotIndexChange?.(
          (selectedRobotIndex - 1 + game.robots.length) % game.robots.length,
        );
      } else if (hotkey === "u") {
        onUndoRobotMove?.();
      } else if (hotkey === "r") {
        onRedoRobotMove?.();
      } else if (hotkey === "t") {
        onRobotResetClick?.();
      } else if (hotkey === "n") {
        onNewGameClick?.();
      } else if (hotkey === "s") {
        onShowSettings?.();
      } else {
        onDirectionKeyPress?.(hotkeyDirectionMap.get(hotkey)!);
      }
    },
    [onDirectionKeyPress, onSelectedRobotIndexChange, onRobotMoveClick],
  );
  const onRobotSelect = useCallback((robot: Robot) => {
    onSelectedRobotIndexChange?.(robot.index);
  }, []);
  return (
    <g className={"game"}>
      <DField
        field={game.field}
        robots={game.robots}
        selectedRobotIndex={selectedRobotIndex}
        path={game.path}
        showGhostWalls={showGhostWalls}
        onGhostWallClick={onGhostWallClick}
        robotPositions={robotPositions}
        nextRobotsPositionEntries={
          showRobotControls ? nextRobotsPositionEntries : undefined
        }
        onRobotMoveClick={onRobotNextPositionClick}
        gameTargets={gameTargets}
        targetPositions={targetPositions}
      />
      {distanceMap ? (
        <DFieldDistances field={game.field} distanceMap={distanceMap} />
      ) : null}
      <g className={"robots"}>
        {game.robots.map((robot) => (
          <DRobot
            key={robot.index}
            robot={robot}
            isSelected={robot.index === selectedRobotIndex}
            onSelect={onSelectedRobotIndexChange ? onRobotSelect : undefined}
          />
        ))}
      </g>
    </g>
  );
}

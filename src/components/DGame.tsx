import { useCallback, useEffect, useMemo } from "react";
import { Direction, Game, Robot, WallType } from "../game";
import { Position, PositionMap } from "../utils";
import { DField } from "./DField";
import { DFieldDistances } from "./DFieldDistances";
import { DRobot } from "./DRobot";
import { useHotkeys } from "react-hotkeys-hook";

export interface DGameProps {
  game: Game;
  showDistances?: boolean;
  showGhostWalls?: boolean;
  onGhostWallClick?: (position: Position, type: WallType) => void;
  onDistanceMapChange?: (distanceMap: PositionMap<number> | null) => void;
  showRobotControls?: boolean;
  onRobotMoveClick?: (robot: Robot, nextPosition: Position, isUndo: boolean) => void;
  targetPosition?: Position;
}

const directionFilterMap: Map<Direction, (left: Position, right: Position) => boolean> = new Map([
  [Direction.Left, (left, right) => left.x < right.x],
  [Direction.Right, (left, right) => left.x > right.x],
  [Direction.Up, (left, right) => left.y < right.y],
  [Direction.Down, (left, right) => left.y > right.y],
]);

const hotkeyDirectionMap: Map<string, Direction> = new Map([
  ['left', Direction.Left],
  ['right', Direction.Right],
  ['up', Direction.Up],
  ['down', Direction.Down],
]);

export function DGame({
  game,
  showDistances = false,
  showGhostWalls = false,
  onGhostWallClick,
  onDistanceMapChange,
  showRobotControls = false,
  onRobotMoveClick,
  targetPosition,
}: DGameProps) {
  const distanceMap = useMemo(() => {
    if (!showDistances) {
      return null;
    }
    if (!game.robots.length) {
      return null;
    }
    if (game.robots.length === 1) {
      return game.calculateReachableSingleRobotPositions(game.robots[0]);
    } else {
      return game.calculateReachableMultiRobotPositions(game.robots[0]);
    }
  }, [game, showDistances]);
  useEffect(() => {
    onDistanceMapChange?.(distanceMap);
  }, [distanceMap]);
  const nextRobotsPositionEntries: Map<number, {nextPosition: Position, isUndo: boolean}[]> = useMemo(() => {
    if (!showRobotControls) {
      return new Map();
    }
    return game.getNextRobotsPositionEntries();
  }, [game, showRobotControls]);
  const robotPositions = useMemo(() => {
    if (!showRobotControls) {
      return undefined;
    }
    return new Map(game.robots.map(robot => [robot.index, robot.position]));
  }, [game, showRobotControls]);
  const onRobotNextPositionClick = useCallback((robot: Robot, nextPosition: Position, isUndo: boolean) => {
    onRobotMoveClick?.(robot, nextPosition, isUndo)
  }, [onRobotMoveClick]);
  const onDirectionKeyPress = useCallback((direction: Direction) => {
    if (!onRobotMoveClick) {
      return;
    }
    if (!game.robots[0]) {
      return;
    }
    const nextRobotPositionEntry = game.getRobotMoveInDirection(game.robots[0], direction, nextRobotsPositionEntries);
    if (!nextRobotPositionEntry) {
      return;
    }
    onRobotMoveClick?.(game.robots[0], nextRobotPositionEntry.nextPosition, nextRobotPositionEntry.isUndo);
  }, [game, nextRobotsPositionEntries, onRobotMoveClick]);
  useHotkeys(['left', 'right', 'up', 'down'], (e, {hotkey}) => {
    e.preventDefault();
    onDirectionKeyPress(hotkeyDirectionMap.get(hotkey)!);
  }, [onDirectionKeyPress]);
  return (
    <g className={"game"}>
      <DField
        field={game.field}
        robots={game.robots}
        path={game.path}
        showGhostWalls={showGhostWalls}
        onGhostWallClick={onGhostWallClick}
        robotPositions={robotPositions}
        nextRobotsPositionEntries={showRobotControls ? nextRobotsPositionEntries : undefined}
        onRobotMoveClick={onRobotNextPositionClick}
        targetPosition={targetPosition}
      />
      {distanceMap ? (
        <DFieldDistances field={game.field} distanceMap={distanceMap} />
      ) : null}
      <g className={"robots"}>
        {game.robots.map((robot) => (
          <DRobot key={robot.index} robot={robot} />
        ))}
      </g>
    </g>
  );
}

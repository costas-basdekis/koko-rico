import { useCallback, useEffect, useMemo } from "react";
import { Direction, Game, Robot, WallType } from "../game";
import { Position, PositionMap } from "../utils";
import { DField } from "./DField";
import { DFieldDistances } from "./DFieldDistances";
import { DRobot } from "./DRobot";
import { useHotkeys } from "react-hotkeys-hook";

export interface DGameProps {
  game: Game;
  robotPath?: [Position, Position][];
  showDistances?: boolean;
  showGhostWalls?: boolean;
  onGhostWallClick?: (position: Position, type: WallType) => void;
  onDistanceMapChange?: (distanceMap: PositionMap<number> | null) => void;
  showRobotControls?: boolean;
  onRobotMoveClick?: (robot: Robot, nextPosition: Position, undo: boolean) => void;
  targetPosition?: Position;
}

const directionFilterMap: Map<Direction, (left: Position, right: Position) => boolean> = new Map([
  [Direction.Left, (left, right) => left.x < right.x],
  [Direction.Right, (left, right) => left.x > right.x],
  [Direction.Up, (left, right) => left.y < right.y],
  [Direction.Down, (left, right) => left.y > right.y],
]);

export function DGame({
  game,
  robotPath,
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
    return game.calculateReachableRobotPositions(game.robots[0]);
  }, [game, showDistances]);
  useEffect(() => {
    onDistanceMapChange?.(distanceMap);
  }, [distanceMap]);
  const nextRobotPositionEntries = useMemo(() => {
    if (!showRobotControls) {
      return [];
    }
    if (!game.robots[0]) {
      return [];
    }
    const robot = game.robots[0];
    const rawNextPositions = Object.values(Direction)
      .map(direction => game.getNextPositionAtDirection(robot.position, direction as Direction, robot))
      .filter(nextPosition => nextPosition) as Position[];
    const nextPositionEntries: {nextPosition: Position, isUndo: boolean}[] = rawNextPositions.map(nextPosition => ({nextPosition, isUndo: false}));
    if (robotPath?.length) {
      const [previousPosition] = robotPath[robotPath.length - 1];
      const directionFilter = Array.from(directionFilterMap.values()).find(filter => filter(previousPosition, robot.position));
      if (directionFilter) {
        const nextPositionEntry = nextPositionEntries.find(nextPositionEntry => directionFilter(nextPositionEntry.nextPosition, robot.position));
        if (nextPositionEntry) {
          nextPositionEntry.nextPosition = previousPosition
          nextPositionEntry.isUndo = true;
        }
      }
    }
    return nextPositionEntries;
  }, [game, game.robots[0], showRobotControls, robotPath]);
  const onRobotNextPositionClick = useCallback((nextPosition: Position, isUndo: boolean) => {
    onRobotMoveClick?.(game.robots[0], nextPosition, isUndo)
  }, [game.robots[0], onRobotMoveClick]);
  const onDirectionKeyPress = useCallback((direction: Direction) => {
    if (!game.robots[0]) {
      return;
    }
    const directionFilter = directionFilterMap.get(direction)!;
    const nextPositionEntry = nextRobotPositionEntries.find(({nextPosition}) => directionFilter(nextPosition, game.robots[0].position));
    if (!nextPositionEntry) {
      return;
    }
    onRobotMoveClick?.(game.robots[0], nextPositionEntry.nextPosition, nextPositionEntry.isUndo);
  }, [game, nextRobotPositionEntries, onRobotMoveClick]);
  useHotkeys('left', (e) => {
    e.preventDefault();
    onDirectionKeyPress(Direction.Left);
  });
  useHotkeys('right', (e) => {
    e.preventDefault();
    onDirectionKeyPress(Direction.Right);
  });
  useHotkeys('up', (e) => {
    e.preventDefault();
    onDirectionKeyPress(Direction.Up);
  });
  useHotkeys('down', (e) => {
    e.preventDefault();
    onDirectionKeyPress(Direction.Down);
  });
  return (
    <g className={"game"}>
      <DField
        field={game.field}
        robotPath={robotPath}
        showGhostWalls={showGhostWalls}
        onGhostWallClick={onGhostWallClick}
        robotPosition={game.robots[0].position}
        nextRobotPositionEntries={showRobotControls ? nextRobotPositionEntries : undefined}
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

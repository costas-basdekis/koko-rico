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
  const nextRobotPositions = useMemo(() => {
    if (!showRobotControls) {
      return [];
    }
    if (!game.robots[0]) {
      return [];
    }
    const robot = game.robots[0];
    return Object.values(Direction)
      .map(direction => game.getNextPositionAtDirection(robot.position, direction as Direction, robot))
      .filter(nextPosition => nextPosition) as Position[];
  }, [game, game.robots[0], showRobotControls]);
  const onRobotNextPositionClick = useCallback((nextPosition: Position) => {
    onRobotMoveClick?.(game.robots[0], nextPosition, false)
  }, [game.robots[0], onRobotMoveClick]);
  const onDirectionKeyPress = useCallback((direction: Direction) => {
    if (!game.robots[0]) {
      return;
    }
    const directionFilter = directionFilterMap.get(direction)!;
    const position = game.robots[0].position;
    if (robotPath?.length) {
      const [previousPosition, currentPosition] = robotPath[robotPath.length - 1];
      if (directionFilter(previousPosition, currentPosition)) {
        onRobotMoveClick?.(game.robots[0], previousPosition, true);
        return;
      }
    }
    const nextPosition = nextRobotPositions.find(nextPosition => directionFilter(nextPosition, position));
    if (!nextPosition) {
      return;
    }
    onRobotMoveClick?.(game.robots[0], nextPosition, false);
  }, [game, robotPath, nextRobotPositions, onRobotMoveClick]);
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
        nextRobotPositions={showRobotControls ? nextRobotPositions : undefined}
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

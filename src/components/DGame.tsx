import { useCallback, useEffect, useMemo } from "react";
import { Direction, Game, Robot, WallType } from "../game";
import { Position, PositionMap } from "../utils";
import { DField } from "./DField";
import { DFieldDistances } from "./DFieldDistances";
import { DRobot } from "./DRobot";

export interface DGameProps {
  game: Game;
  robotPath?: [Position, Position][];
  showDistances?: boolean;
  onGhostWallClick?: (position: Position, type: WallType) => void;
  onDistanceMapChange?: (distanceMap: PositionMap<number> | null) => void;
  showRobotControls?: boolean;
  onRobotMoveClick?: (robot: Robot, nextPosition: Position) => void;
  targetPosition?: Position;
}

export function DGame({
  game,
  robotPath,
  showDistances = false,
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
    onRobotMoveClick?.(game.robots[0], nextPosition)
  }, [game.robots[0], onRobotMoveClick]);
  return (
    <g className={"game"}>
      <DField
        field={game.field}
        robotPath={robotPath}
        showGhostWalls
        onGhostWallClick={onGhostWallClick}
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

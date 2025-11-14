import { useEffect, useMemo } from "react";
import { Game, WallType } from "../game";
import { Position, PositionMap } from "../utils";
import { DField } from "./DField";
import { DFieldDistances } from "./DFieldDistances";
import { DRobot } from "./DRobot";

export interface DGameProps {
  game: Game;
  showDistances?: boolean;
  onGhostWallClick?: (position: Position, type: WallType) => void;
  onDistanceMapChange?: (distanceMap: PositionMap<number> | null) => void;
}

export function DGame({
  game,
  showDistances = false,
  onGhostWallClick,
  onDistanceMapChange,
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
  return (
    <g className={"game"}>
      <DField
        field={game.field}
        showGhostWalls
        onGhostWallClick={onGhostWallClick}
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

import { useCallback } from "react";
import _ from "underscore";
import { Walls, WallType } from "../game";
import { Position } from "../utils";
import { DrawSettings } from "./DrawSettings";

export interface DWallsProps {
  walls: Walls;
  type: WallType;
  showGhosts?: boolean;
  onGhostClick?: (position: Position, type: WallType) => void;
  unclickableIndexes?: number[];
}

export function DWalls({
  walls,
  type,
  showGhosts = false,
  onGhostClick,
  unclickableIndexes = [],
}: DWallsProps) {
  return (
    <g className={`${type}-walls`}>
      {Array.from(walls.entries()).map(([position, contains]) => (
        <DWallCell
          key={`${position.x},${position.y}`}
          position={position}
          contains={contains}
          clickable={
            showGhosts &&
            !unclickableIndexes.includes(
              type === "left" ? position.x : position.y
            )
          }
          type={type}
          onGhostClick={onGhostClick}
        />
      ))}
    </g>
  );
}

interface DWallCellProps {
  position: Position;
  contains: boolean;
  clickable: boolean;
  type: WallType;
  onGhostClick?: (position: Position, type: WallType) => void;
}

function DWallCell({
  position,
  contains,
  clickable,
  type,
  onGhostClick,
}: DWallCellProps) {
  const drawSettings = DrawSettings.use();
  const onClick = useCallback(() => {
    onGhostClick?.(position, type);
  }, [onGhostClick, position, type]);
  if (!contains && !clickable) {
    return null;
  }
  const { x, y } = position;
  return (
    <polyline
      className={`grid-wall ${clickable ? "clickable" : ""} ${
        clickable && !contains ? "ghost" : ""
      }`}
      points={`${drawSettings.getXYPositionStr(
        x,
        y
      )} ${drawSettings.getXYPositionStr(
        x + (type === "top" ? 1 : 0),
        y + (type === "left" ? 1 : 0)
      )}`}
      onClick={clickable ? onClick : undefined}
      onTouchEnd={clickable ? onClick : undefined}
    />
  );
}

import { Field, WallType } from "../game";
import { Position } from "../utils";
import { DGrid } from "./DGrid";
import { DRobotPath } from "./DRobotPath";
import { DWalls } from "./DWalls";

export interface DFieldProps {
  field: Field;
  robotPath?: [Position, Position][];
  showGhostWalls?: boolean;
  onGhostWallClick?: (position: Position, type: WallType) => void;
  nextRobotPositions?: Position[];
  onRobotMoveClick?: (nextPosition: Position) => void;
  targetPosition?: Position;
}

export function DField({
  field,
  robotPath,
  showGhostWalls = false,
  onGhostWallClick,
  nextRobotPositions,
  onRobotMoveClick,
  targetPosition,
}: DFieldProps) {
  return (
    <g className={"field"}>
      <DGrid field={field} targetPosition={targetPosition} />
      {robotPath ? <DRobotPath robotPath={robotPath} /> : null}
      <DGrid field={field} nextRobotPositions={nextRobotPositions} onlyNextRobotPositions onRobotMoveClick={onRobotMoveClick} targetPosition={targetPosition} />
      <DWalls
        key={"top"}
        walls={field.topWalls}
        type={"top"}
        showGhosts={showGhostWalls}
        onGhostClick={onGhostWallClick}
        unclickableIndexes={[0, field.height]}
      />
      <DWalls
        key={"left"}
        walls={field.leftWalls}
        type={"left"}
        showGhosts={showGhostWalls}
        onGhostClick={onGhostWallClick}
        unclickableIndexes={[0, field.width]}
      />
    </g>
  );
}

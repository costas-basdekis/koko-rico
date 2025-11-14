import { Field, WallType } from "../game";
import { Position } from "../utils";
import { DGrid } from "./DGrid";
import { DWalls } from "./DWalls";

export interface DFieldProps {
  field: Field;
  showGhostWalls?: boolean;
  onGhostWallClick?: (position: Position, type: WallType) => void;
}

export function DField({
  field,
  showGhostWalls = false,
  onGhostWallClick,
}: DFieldProps) {
  return (
    <g className={"field"}>
      <DGrid field={field} />
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

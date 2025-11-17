import { useCallback, useMemo } from "react";
import { Field, WallType } from "../game";
import { makeAndRegisterSvgDef, registerSvgDef } from "../SvgDefs";
import { getPositionKey, Position } from "../utils";
import { DGrid } from "./DGrid";
import { DrawSettings } from "./DrawSettings";
import { DRobotPath } from "./DRobotPath";
import { DWalls } from "./DWalls";
import { ReactComponent as RawNextPositionArrowUp } from "./next-position-arrow-up.svg";

export const NextPositionArrowUp = makeAndRegisterSvgDef("next-position-arrow-up", <RawNextPositionArrowUp />);

export interface DFieldProps {
  field: Field;
  robotPath?: [Position, Position][];
  showGhostWalls?: boolean;
  onGhostWallClick?: (position: Position, type: WallType) => void;
  robotPosition?: Position,
  nextRobotPositionEntries?: {nextPosition: Position, isUndo: boolean}[];
  onRobotMoveClick?: (nextPosition: Position, isUndo: boolean) => void;
  targetPosition?: Position;
}

export function DField({
  field,
  robotPath,
  showGhostWalls = false,
  onGhostWallClick,
  nextRobotPositionEntries,
  robotPosition,
  onRobotMoveClick,
  targetPosition,
}: DFieldProps) {
  return (
    <g className={"field"}>
      <DGrid field={field} targetPosition={targetPosition} />
      {robotPath ? <DRobotPath robotPath={robotPath} /> : null}
      <g className={"next-positions"}>
        {robotPosition ? nextRobotPositionEntries?.map(({nextPosition, isUndo}) => <DNextPosition key={getPositionKey(nextPosition)} position={robotPosition} nextPosition={nextPosition} isUndo={isUndo} onRobotMoveClick={onRobotMoveClick} />) : null}
      </g>
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

export interface DNextPositionProps {
  position: Position;
  nextPosition: Position;
  isUndo: boolean;
  onRobotMoveClick?: (nextPosition: Position, isUndo: boolean) => void;
}

export function DNextPosition({position, nextPosition, isUndo, onRobotMoveClick}: DNextPositionProps) {
  const drawSettings = DrawSettings.use();
  const transform = useMemo(() => {
    const rotation = (
      nextPosition.x > position.x ? 90
      : nextPosition.x < position.x ? 270
      : nextPosition.y > position.y ? 180
      : 0
    )
    return (
      `translate(${drawSettings.getXPosition(nextPosition.x) + drawSettings.width / 2} ${drawSettings.getYPosition(nextPosition.y) + drawSettings.height / 2})`
      + ` scale(${drawSettings.width / 20})`
      + ` rotate(${rotation})`
    );
  }, [drawSettings, position, nextPosition]);
  const onClick = useCallback(() => {
    onRobotMoveClick?.(nextPosition, isUndo);
  }, [nextPosition, onRobotMoveClick]);
  return (
    <>
      <rect
        className={"next-position-hitbox"}
        x={drawSettings.getXPosition(nextPosition.x)}
        y={drawSettings.getYPosition(nextPosition.y)}
        width={drawSettings.width}
        height={drawSettings.height}
        onClick={onClick}
        onTouchStart={onClick}
      />
      <NextPositionArrowUp
        className={`next-position-arrow ${isUndo ? "undo" : ""}`}
        transform={transform}
      />
    </>
  );
}

import _ from "underscore";
import { Field } from "../game";
import { DrawSettings } from "./DrawSettings";
import { Position, positionsEqual } from "../utils";
import { useCallback } from "react";

export interface DGridProps {
  field: Field;
  nextRobotPositions?: Position[];
  onRobotMoveClick?: (nextPosition: Position) => void;
}

export function DGrid({ field, nextRobotPositions, onRobotMoveClick }: DGridProps) {
  return (
    <g className={"grid"}>
      {_.range(field.width).map((x) =>
        _.range(field.height).map((y) => (
          <DGridCell
            key={`${x},${y}`}
            x={x}
            y={y}
            showRobotControls={!!nextRobotPositions?.find(position => positionsEqual({x, y}, position))}
            onRobotMoveClick={onRobotMoveClick}
          />
        ))
      )}
    </g>
  );
}

export interface DGridCellProps {
  x: number;
  y: number;
  showRobotControls?: boolean;
  onRobotMoveClick?: (nextPosition: Position) => void;
}

export function DGridCell({ x, y, showRobotControls, onRobotMoveClick }: DGridCellProps) {
  const onClick = useCallback(() => {
    onRobotMoveClick?.({x, y});
  }, [x, y, onRobotMoveClick]);
  const drawSettings = DrawSettings.use();
  return (
    <rect
      key={`${x},${y}`}
      className={`grid-square ${showRobotControls ? "robot-next-position" : ""}`}
      x={drawSettings.xOffset + drawSettings.width * x}
      y={drawSettings.yOffset + drawSettings.height * y}
      width={drawSettings.width}
      height={drawSettings.height}
      onClick={showRobotControls ? onClick : undefined}
    />
  );
}

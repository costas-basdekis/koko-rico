import _ from "underscore";
import { Field } from "../game";
import { DrawSettings } from "./DrawSettings";
import { Position, positionsEqual } from "../utils";
import { useCallback } from "react";

export interface DGridProps {
  field: Field;
  nextRobotPositions?: Position[];
  onlyNextRobotPositions?: boolean,
  onRobotMoveClick?: (nextPosition: Position) => void;
  targetPosition?: Position;
}

export function DGrid({ field, nextRobotPositions, onlyNextRobotPositions = false, onRobotMoveClick, targetPosition }: DGridProps) {
  return (
    <g className={"grid"}>
      {_.range(field.width).map((x) =>
        _.range(field.height).map((y) => {
          const showRobotControls = !!nextRobotPositions?.find(position => positionsEqual({x, y}, position));
          if (onlyNextRobotPositions && !showRobotControls) {
            return null;
          }
          return (
            <DGridCell
              key={`${x},${y}`}
              x={x}
              y={y}
              showRobotControls={showRobotControls}
              onRobotMoveClick={onRobotMoveClick}
              isTarget={targetPosition ? positionsEqual({x, y}, targetPosition) : false}
            />
          );
        })
      )}
    </g>
  );
}

export interface DGridCellProps {
  x: number;
  y: number;
  showRobotControls?: boolean;
  onRobotMoveClick?: (nextPosition: Position) => void;
  isTarget?: boolean;
}

export function DGridCell({ x, y, showRobotControls, onRobotMoveClick, isTarget = false }: DGridCellProps) {
  const onClick = useCallback(() => {
    onRobotMoveClick?.({x, y});
  }, [x, y, onRobotMoveClick]);
  const drawSettings = DrawSettings.use();
  return (
    <rect
      key={`${x},${y}`}
      className={`grid-square ${showRobotControls ? "robot-next-position" : ""} ${isTarget ? "target-position" : ""}`}
      x={drawSettings.xOffset + drawSettings.width * x}
      y={drawSettings.yOffset + drawSettings.height * y}
      width={drawSettings.width}
      height={drawSettings.height}
      onClick={showRobotControls ? onClick : undefined}
      onTouchStart={showRobotControls ? onClick : undefined}
    />
  );
}

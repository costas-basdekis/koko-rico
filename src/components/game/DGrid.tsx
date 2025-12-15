import "./DGrid.css";
import _ from "underscore";
import { Field, GameTargets } from "../../game";
import { DrawSettings } from "./DrawSettings";
import { Position, positionsEqual } from "../../utils";
import { useCallback, useMemo } from "react";

export interface DGridProps {
  field: Field;
  nextRobotPositions?: Position[];
  onlyNextRobotPositions?: boolean;
  onRobotMoveClick?: (nextPosition: Position) => void;
  gameTargets?: GameTargets;
  targetPositions?: Position[];
}

export function DGrid({
  field,
  nextRobotPositions,
  onlyNextRobotPositions = false,
  onRobotMoveClick,
  gameTargets,
  targetPositions,
}: DGridProps) {
  return (
    <g className={"grid"}>
      {_.range(field.width).map((x) =>
        _.range(field.height).map((y) => {
          const showRobotControls = !!nextRobotPositions?.find((position) =>
            positionsEqual({ x, y }, position),
          );
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
              gameTargets={gameTargets}
              targetPositions={targetPositions}
            />
          );
        }),
      )}
    </g>
  );
}

export interface DGridCellProps {
  x: number;
  y: number;
  showRobotControls?: boolean;
  onRobotMoveClick?: (nextPosition: Position) => void;
  gameTargets?: GameTargets;
  targetPositions?: Position[];
}

export function DGridCell({
  x,
  y,
  showRobotControls,
  onRobotMoveClick,
  gameTargets,
  targetPositions = gameTargets?.targetPositions,
}: DGridCellProps) {
  const onClick = useCallback(() => {
    onRobotMoveClick?.({ x, y });
  }, [x, y, onRobotMoveClick]);
  const drawSettings = DrawSettings.use();
  const isTarget = useMemo(() => {
    return (
      targetPositions?.some((target) => positionsEqual({ x, y }, target)) ??
      false
    );
  }, [x, y, targetPositions]);
  const isTargetCompleted = useMemo(() => {
    if (!isTarget) {
      return false;
    }
    return (
      gameTargets?.completedTargetPositions.some((completedTarget) =>
        positionsEqual({ x, y }, completedTarget),
      ) ?? false
    );
  }, [x, y, gameTargets?.completedTargetPositions, isTarget]);
  const isSilverTargetCompleted = useMemo(() => {
    if (!isTarget || isTargetCompleted) {
      return false;
    }
    return (
      gameTargets?.silverTargetPositions?.some((completedTarget) =>
        positionsEqual({ x, y }, completedTarget),
      ) ?? false
    );
  }, [x, y, gameTargets?.silverTargetPositions, isTarget, isTargetCompleted]);
  const isBronzeTargetCompleted = useMemo(() => {
    if (!isTarget || isTargetCompleted || isSilverTargetCompleted) {
      return false;
    }
    return (
      gameTargets?.bronzeTargetPositions?.some((completedTarget) =>
        positionsEqual({ x, y }, completedTarget),
      ) ?? false
    );
  }, [
    x,
    y,
    gameTargets?.bronzeTargetPositions,
    isTarget,
    isTargetCompleted,
    isSilverTargetCompleted,
  ]);
  return (
    <rect
      key={`${x},${y}`}
      className={[
        "grid-square",
        `${showRobotControls ? "robot-next-position" : ""}`,
        `${isTarget ? "target-position" : ""}`,
        `${isTargetCompleted ? "completed-target-position" : ""}`,
        `${isSilverTargetCompleted ? "silver-target-position" : ""}`,
        `${isBronzeTargetCompleted ? "bronze-target-position" : ""}`,
      ].join(" ")}
      x={drawSettings.xOffset + drawSettings.width * x}
      y={drawSettings.yOffset + drawSettings.height * y}
      width={drawSettings.width}
      height={drawSettings.height}
      onClick={showRobotControls ? onClick : undefined}
      onTouchStart={showRobotControls ? onClick : undefined}
    />
  );
}

import "./DGrid.css";
import _ from "underscore";
import { Field, GameTargets, RobotPath } from "../../game";
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
  targetPaths?: { [key: number]: RobotPath | null };
  showPathIcons?: boolean;
  onTargetPathClick?: (targetIndex: number) => void;
  showSolutionIcons?: boolean;
  onSolutionClick?: (targetIndex: number) => void;
}

export function DGrid({
  field,
  nextRobotPositions,
  onlyNextRobotPositions = false,
  onRobotMoveClick,
  gameTargets,
  targetPositions,
  targetPaths,
  showPathIcons,
  onTargetPathClick,
  showSolutionIcons,
  onSolutionClick,
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
              targetPaths={targetPaths}
              showPathIcons={showPathIcons}
              onTargetPathClick={onTargetPathClick}
              showSolutionIcons={showSolutionIcons}
              onSolutionClick={onSolutionClick}
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
  targetPaths?: { [key: number]: RobotPath | null };
  showPathIcons?: boolean;
  onTargetPathClick?: (targetIndex: number) => void;
  showSolutionIcons?: boolean;
  onSolutionClick?: (targetIndex: number) => void;
}

export function DGridCell({
  x,
  y,
  showRobotControls,
  onRobotMoveClick,
  gameTargets,
  targetPositions = gameTargets?.targetPositions,
  targetPaths,
  showPathIcons,
  onTargetPathClick,
  showSolutionIcons,
  onSolutionClick,
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
  const isTargetConceded = useMemo(() => {
    if (!isTarget) {
      return false;
    }
    return (
      gameTargets?.concededTargetPositions.some((concededTarget) =>
        positionsEqual({ x, y }, concededTarget),
      ) ?? false
    );
  }, [x, y, gameTargets?.completedTargetPositions, isTarget]);
  const isTargetCompleted = useMemo(() => {
    if (!isTarget || isTargetConceded) {
      return false;
    }
    return (
      gameTargets?.completedTargetPositions.some((completedTarget) =>
        positionsEqual({ x, y }, completedTarget),
      ) ?? false
    );
  }, [x, y, gameTargets?.completedTargetPositions, isTarget]);
  const isSilverTargetCompleted = useMemo(() => {
    if (!isTarget || isTargetConceded || isTargetCompleted) {
      return false;
    }
    return (
      gameTargets?.silverTargetPositions?.some((completedTarget) =>
        positionsEqual({ x, y }, completedTarget),
      ) ?? false
    );
  }, [x, y, gameTargets?.silverTargetPositions, isTarget, isTargetCompleted]);
  const isBronzeTargetCompleted = useMemo(() => {
    if (
      !isTarget ||
      isTargetConceded ||
      isTargetCompleted ||
      isSilverTargetCompleted
    ) {
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
  const drawPosition = useMemo(() => {
    return {
      x: drawSettings.xOffset + drawSettings.width * x,
      y: drawSettings.yOffset + drawSettings.height * y,
    };
  }, [x, y, drawSettings]);
  let contents = null;
  const targetIndex = useMemo(() => {
    if (!isTarget || !targetPositions) {
      return -1;
    }
    return targetPositions.findIndex((target) =>
      positionsEqual({ x, y }, target),
    );
  }, [isTarget, targetPositions, x, y]);
  const targetPath = useMemo(() => {
    if (!targetPaths || targetIndex === undefined || targetIndex === -1) {
      return null;
    }
    return targetPaths[targetIndex];
  }, [targetIndex, targetPaths]);
  const onTargetPathHandlerClick = useCallback(() => {
    if (targetIndex === -1) {
      return;
    }
    onTargetPathClick?.(targetIndex);
  }, [targetIndex, onTargetPathClick]);
  const onSolutionHandlerClick = useCallback(() => {
    if (targetIndex === -1) {
      return;
    }
    onSolutionClick?.(targetIndex);
  }, [targetIndex, onSolutionClick]);
  if (targetPath && showPathIcons && onTargetPathClick) {
    contents = (
      <text
        className={"target-path-handle"}
        x={drawPosition.x + drawSettings.width / 2}
        y={drawPosition.y + drawSettings.height / 2}
        onClick={onTargetPathHandlerClick}
        onTouchStart={onTargetPathHandlerClick}
      >
        ⟲
      </text>
    );
  } else if (
    showSolutionIcons &&
    isTarget &&
    !isTargetConceded &&
    !isTargetCompleted
  ) {
    contents = (
      <text
        className={"solution-handle"}
        x={drawPosition.x + drawSettings.width / 2}
        y={drawPosition.y + drawSettings.height / 2}
        onClick={onSolutionHandlerClick}
        onTouchStart={onSolutionHandlerClick}
      >
        !
      </text>
    );
  }
  return (
    <>
      <rect
        key={`${x},${y}`}
        className={[
          "grid-square",
          `${showRobotControls ? "robot-next-position" : ""}`,
          `${isTarget ? "target-position" : ""}`,
          `${isTargetConceded ? "conceded-target-position" : ""}`,
          `${isTargetCompleted ? "completed-target-position" : ""}`,
          `${isSilverTargetCompleted ? "silver-target-position" : ""}`,
          `${isBronzeTargetCompleted ? "bronze-target-position" : ""}`,
        ].join(" ")}
        x={drawPosition.x}
        y={drawPosition.y}
        width={drawSettings.width}
        height={drawSettings.height}
        onClick={showRobotControls ? onClick : undefined}
        onTouchStart={showRobotControls ? onClick : undefined}
      />
      {contents}
    </>
  );
}

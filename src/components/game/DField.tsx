import "./DField.css";
import { useCallback, useMemo } from "react";
import {
  Field,
  GameTargets,
  getPositionsDirection,
  Robot,
  RobotPath,
  WallType,
} from "../../game";
import { getPositionKey, Position } from "../../utils";
import { DGrid } from "./DGrid";
import { DrawSettings } from "./DrawSettings";
import { DRobotPath } from "./DRobotPath";
import { DWalls } from "./DWalls";
import { TapHandler } from "../../utils";
import { NextPositionArrowUp } from "../ui";

export interface DFieldProps {
  field: Field;
  robots?: Robot[];
  selectedRobotIndex: number;
  path?: RobotPath;
  showGhostWalls?: boolean;
  onGhostWallClick?: (position: Position, type: WallType) => void;
  robotPositions?: Map<number, Position>;
  nextRobotsPositionEntries?: Map<
    number,
    { nextPosition: Position; isUndo: boolean }[]
  >;
  onRobotMoveClick?: (
    robot: Robot,
    nextPosition: Position,
    isUndo: boolean,
  ) => void;
  gameTargets?: GameTargets;
  targetPositions?: Position[];
}

export function DField({
  field,
  robots,
  selectedRobotIndex,
  path,
  showGhostWalls = false,
  onGhostWallClick,
  nextRobotsPositionEntries,
  robotPositions,
  onRobotMoveClick,
  gameTargets,
  targetPositions,
}: DFieldProps) {
  if (path && !robots) {
    throw new Error("DGame cannot accept robotPaths prop without robots prop.");
  }
  if (nextRobotsPositionEntries && !robots) {
    throw new Error(
      "DField cannot accept nextRobotsPositionEntries prop without robots prop.",
    );
  }
  if (robotPositions && !robots) {
    throw new Error(
      "DField cannot accept robotPositions prop without robots prop.",
    );
  }
  const robotPathsByIndex = useMemo(() => {
    if (!path || !robots) {
      return new Map();
    }
    return new Map(
      robots.map((robot) => [
        robot.index,
        path.filter((entry) => entry.robotIndex === robot.index),
      ]),
    );
  }, [path, robots]);
  const sortOnSelectedRobotFirst = useCallback(
    ([left]: [number, any], [right]: [number, any]): number => {
      return left === selectedRobotIndex
        ? 1
        : right === selectedRobotIndex
          ? -1
          : left - right;
    },
    [selectedRobotIndex],
  );
  return (
    <g className={"field"}>
      <DGrid
        field={field}
        gameTargets={gameTargets}
        targetPositions={targetPositions}
      />
      {Array.from(robotPathsByIndex.entries())
        .sort(sortOnSelectedRobotFirst)
        .map(([index, robotPath]) => (
          <DRobotPath
            key={index}
            robot={robots![index]}
            isSelected={index === selectedRobotIndex}
            robotPath={robotPath}
          />
        ))}
      <g className={"next-positions"}>
        {Array.from(nextRobotsPositionEntries?.entries() || [])
          .sort(sortOnSelectedRobotFirst)
          .flatMap(([index, nextRobotPositionEntries]) =>
            nextRobotPositionEntries.map(({ nextPosition, isUndo }) => (
              <DNextPosition
                key={`${index}|${getPositionKey(nextPosition)}`}
                robot={robots![index]}
                isSelected={index === selectedRobotIndex}
                position={robots![index].position}
                nextPosition={nextPosition}
                isUndo={isUndo}
                onRobotMoveClick={onRobotMoveClick}
              />
            )),
          )}
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
  robot: Robot;
  isSelected: boolean;
  position: Position;
  nextPosition: Position;
  isUndo: boolean;
  onRobotMoveClick?: (
    robot: Robot,
    nextPosition: Position,
    isUndo: boolean,
  ) => void;
}

export function DNextPosition({
  robot,
  isSelected,
  position,
  nextPosition,
  isUndo,
  onRobotMoveClick,
}: DNextPositionProps) {
  const drawSettings = DrawSettings.use();
  const direction = useMemo(() => {
    return getPositionsDirection(position, nextPosition);
  }, [position, nextPosition]);
  const onClick = useCallback(() => {
    onRobotMoveClick?.(robot, nextPosition, isUndo);
  }, [nextPosition, onRobotMoveClick]);
  const tapHandler = TapHandler.use(onClick);
  return (
    <>
      <rect
        className={"next-position-hitbox"}
        x={drawSettings.getXPosition(nextPosition.x)}
        y={drawSettings.getYPosition(nextPosition.y)}
        width={drawSettings.width}
        height={drawSettings.height}
        onClick={onClick}
        {...(onRobotMoveClick ? tapHandler.touchProps : null)}
      />
      <NextPositionArrowUp
        size={drawSettings.width}
        direction={direction!}
        drawPosition={nextPosition}
        robotIndex={robot.index}
        isUndo={isUndo}
        isSelected={isSelected}
      />
    </>
  );
}

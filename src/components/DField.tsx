import { useCallback, useMemo } from "react";
import { Field, Robot, RobotPath, WallType } from "../game";
import { makeAndRegisterSvgDef } from "../SvgDefs";
import { getPositionKey, Position } from "../utils";
import { DGrid } from "./DGrid";
import { DrawSettings } from "./DrawSettings";
import { DRobotPath } from "./DRobotPath";
import { DWalls } from "./DWalls";
import { ReactComponent as RawNextPositionArrowUp } from "./next-position-arrow-up.svg";

export const NextPositionArrowUp = makeAndRegisterSvgDef("next-position-arrow-up", <RawNextPositionArrowUp />);

export interface DFieldProps {
  field: Field;
  robots?: Robot[];
  selectedRobotIndex: number;
  path?: RobotPath;
  showGhostWalls?: boolean;
  onGhostWallClick?: (position: Position, type: WallType) => void;
  robotPositions?: Map<number, Position>,
  nextRobotsPositionEntries?: Map<number, {nextPosition: Position, isUndo: boolean}[]>;
  onRobotMoveClick?: (robot: Robot, nextPosition: Position, isUndo: boolean) => void;
  targetPosition?: Position;
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
  targetPosition,
}: DFieldProps) {
  if (path && !robots) {
    throw new Error("DGame cannot accept robotPaths prop without robots prop.");
  }
  if (nextRobotsPositionEntries && !robots) {
    throw new Error("DField cannot accept nextRobotsPositionEntries prop without robots prop.");
  }
  if (robotPositions && !robots) {
    throw new Error("DField cannot accept robotPositions prop without robots prop.");
  }
  const robotPathsByIndex = useMemo(() => {
    if (!path || !robots) {
      return new Map();
    }
    return new Map(robots.map((robot) => [robot.index, path.filter(entry => entry.robotIndex === robot.index)]));
  }, [path, robots]);
  const sortOnSelectedRobotFirst = useCallback(([left]: [number, any], [right]: [number, any]): number => {
    return left === selectedRobotIndex ? 1 : right === selectedRobotIndex ? -1 : left - right;
  }, [selectedRobotIndex]);
  return (
    <g className={"field"}>
      <DGrid field={field} targetPosition={targetPosition} />
      {Array.from(robotPathsByIndex.entries()).sort(sortOnSelectedRobotFirst).map(([index, robotPath]) => (
        <DRobotPath
          key={index}
          robot={robots![index]}
          isSelected={index === selectedRobotIndex}
          robotPath={robotPath}
        />
      ))}
      <g className={"next-positions"}>
        {Array.from(nextRobotsPositionEntries?.entries() || []).sort(sortOnSelectedRobotFirst).flatMap(([index, nextRobotPositionEntries]) => nextRobotPositionEntries.map(({nextPosition, isUndo}) => (
          <DNextPosition 
            key={`${index}|${getPositionKey(nextPosition)}`}
            robot={robots![index]}
            isSelected={index === selectedRobotIndex}
            position={robots![index].position}
            nextPosition={nextPosition}
            isUndo={isUndo}
            onRobotMoveClick={onRobotMoveClick}
          />
        )))}
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
  onRobotMoveClick?: (robot: Robot, nextPosition: Position, isUndo: boolean) => void;
}

export function DNextPosition({robot, isSelected, position, nextPosition, isUndo, onRobotMoveClick}: DNextPositionProps) {
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
    onRobotMoveClick?.(robot, nextPosition, isUndo);
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
        className={`next-position-arrow index-${robot.index} ${isUndo ? "undo" : ""} ${isSelected ? "selected" : ""}`}
        transform={transform}
      />
    </>
  );
}

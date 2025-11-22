import { Robot, RobotPath } from "../game";
import { getPositionKey, Position } from "../utils";
import { DrawSettings } from "./DrawSettings";

export interface DRobotPathProps {
  robot: Robot;
  isSelected: boolean;
  robotPath: RobotPath;
}

export function DRobotPath({robot, isSelected, robotPath}: DRobotPathProps) {
  const drawSettings = DrawSettings.use();
  return (
    <g className={"robot-path"}>
      {robotPath.map(({previousPosition, position}, index) => (
        <polygon
          key={`${robot.index}|${index}`}
          className={`robot-path-item index-${robot.index} ${isSelected ? "selected" : ""}`}
          points={`${drawSettings.getXYPositionStr(previousPosition.x + 0.5, previousPosition.y + 0.5)} ${drawSettings.getXYPositionStr(position.x + 0.5 , position.y + 0.5)}`}
        />
      ))}
    </g>
  );
}

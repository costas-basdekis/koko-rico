import { Robot, RobotPath } from "../game";
import { getPositionKey, Position } from "../utils";
import { DrawSettings } from "./DrawSettings";

export interface DRobotPathProps {
  robot: Robot;
  robotPath: RobotPath;
}

export function DRobotPath({robot, robotPath}: DRobotPathProps) {
  const drawSettings = DrawSettings.use();
  return (
    <g className={"robot-path"}>
      {robotPath.map(({previousPosition, position}) => (
        <polygon
          key={`${getPositionKey(previousPosition)}|${getPositionKey(position)}`}
          className={`robot-path-item index-${robot.index}`}
          points={`${drawSettings.getXYPositionStr(previousPosition.x + 0.5, previousPosition.y + 0.5)} ${drawSettings.getXYPositionStr(position.x + 0.5 , position.y + 0.5)}`}
        />
      ))}
    </g>
  );
}

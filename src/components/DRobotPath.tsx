import { getPositionKey, Position } from "../utils";
import { DrawSettings } from "./DrawSettings";

export interface DRobotPathProps {
  robotPath: [Position, Position][];
}

export function DRobotPath({robotPath}: DRobotPathProps) {
  const drawSettings = DrawSettings.use();
  return (
    <g className={"robot-path"}>
      {robotPath.map(([start, end]) => (
        <polygon
        key={`${getPositionKey(start)}|${getPositionKey(end)}`}
        className={"robot-path-item"}
        points={`${drawSettings.getXYPositionStr(start.x + 0.5, start.y + 0.5)} ${drawSettings.getXYPositionStr(end.x + 0.5 , end.y + 0.5)}`}
        />
      ))}
    </g>
  )
}

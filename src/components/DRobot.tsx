import { Robot } from "../game";
import { DrawSettings } from "./DrawSettings";

export interface DRobotProps {
  robot: Robot;
}

export function DRobot({ robot }: DRobotProps) {
  const drawSettings = DrawSettings.use();
  return (
    <circle
      key={robot.index}
      className={`robot index-${robot.index}`}
      cx={drawSettings.getXPosition(robot.position.x + 0.5)}
      cy={drawSettings.getXPosition(robot.position.y + 0.5)}
      r={drawSettings.width / 2 - 2}
    />
  );
}

import { useCallback } from "react";
import { Robot } from "../game";
import { DrawSettings } from "./DrawSettings";

export interface DRobotProps {
  robot: Robot;
  isSelected: boolean;
  onSelect?: (robot: Robot) => void;
}

export function DRobot({ robot, isSelected, onSelect }: DRobotProps) {
  const drawSettings = DrawSettings.use();
  const onClick = useCallback(() => {
    onSelect?.(robot);
  }, [onSelect]);
  return (
    <circle
      key={robot.index}
      className={`robot index-${robot.index} ${isSelected ? "selected" : ""}`}
      cx={drawSettings.getXPosition(robot.position.x + 0.5)}
      cy={drawSettings.getXPosition(robot.position.y + 0.5)}
      r={drawSettings.width / 2 - 5}
      onClick={onSelect ? onClick : undefined}
      onTouchEnd={onSelect ? onClick : undefined}
    />
  );
}

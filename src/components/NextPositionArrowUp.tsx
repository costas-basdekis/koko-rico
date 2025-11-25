import { useMemo } from "react";
import { makeAndRegisterSvgDef } from "../SvgDefs";
import { DrawSettings } from "./DrawSettings";
import { ReactComponent as RawNextPositionArrowUp } from "./next-position-arrow-up.svg";
import { Direction } from "../game";
import { Position } from "../utils";

export const BaseNextPositionArrowUp = makeAndRegisterSvgDef("next-position-arrow-up", <RawNextPositionArrowUp />);

export type NextPositionArrowUpProps = {
  size: number;
  direction?: Direction | null;
  position?: Position;
  drawPosition?: Position;
  robotIndex?: number;
  isUndo?: boolean;
  isSelected?: boolean;
  extraClassName?: string;
} & React.SVGProps<SVGUseElement>;

export const directionAngleMap = new Map<Direction, number>([
  [Direction.Up, 0],
  [Direction.Down, 180],
  [Direction.Right, 90],
  [Direction.Left, 270],
]);

export function NextPositionArrowUp({size, direction, position, drawPosition, robotIndex, isUndo = false, isSelected = false, extraClassName, ...rest}: NextPositionArrowUpProps) {
  const drawSettings = DrawSettings.use();
  const transform = useMemo(() => {
    let transform = `scale(${size / 20})`;
    const rotation = directionAngleMap.get(direction ?? Direction.Up) ?? 0;
    if (rotation) {
      transform = `${transform} rotate(${rotation})`;
    }
    if (position) {
      transform = `translate(${position.x} ${position.y}) ${transform}`;
    } else if (drawPosition) {
      transform = `translate(${drawSettings.getXPosition(drawPosition.x) + drawSettings.width / 2} ${drawSettings.getYPosition(drawPosition.y) + drawSettings.height / 2}) ${transform}`;
    }
    return transform;
  }, [drawSettings, position, direction]);
  return <BaseNextPositionArrowUp
    className={`next-position-arrow ${robotIndex !== undefined ? `index-${robotIndex}` : ""} ${isUndo ? "undo" : ""} ${isSelected ? "selected" : ""} ${extraClassName}`}
    transform={transform}
    {...rest}
  />
}

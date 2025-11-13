import _ from "underscore";
import { Field } from "../game";
import { PositionMap } from "../utils";
import { DrawSettings } from "./DrawSettings";

export interface DFieldDistancesProps {
  field: Field;
  distanceMap: PositionMap<number>;
}

export function DFieldDistances({ field, distanceMap }: DFieldDistancesProps) {
  const drawSettings = DrawSettings.use();
  return (
    <g className={"grid"}>
      {field.positions.map((position) => {
        const distance = distanceMap.get(position);
        if (distance === undefined) {
          return null;
        }
        return (
          <text
            key={`${position.x},${position.y}`}
            className={"distance-map-item"}
            x={drawSettings.getXPosition(position.x + 0.5)}
            y={drawSettings.getYPosition(position.y + 0.5)}
          >
            {distance}
          </text>
        );
      })}
    </g>
  );
}

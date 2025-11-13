import _ from "underscore";
import { Field } from "../game";
import { DrawSettings } from "./DrawSettings";

export interface DGridProps {
  field: Field;
}

export function DGrid({ field }: DGridProps) {
  const drawSettings = DrawSettings.use();
  return (
    <g className={"grid"}>
      {_.range(field.width).map((x) =>
        _.range(field.height).map((y) => (
          <rect
            key={`${x},${y}`}
            className={"grid-square"}
            x={drawSettings.xOffset + drawSettings.width * x}
            y={drawSettings.yOffset + drawSettings.height * y}
            width={drawSettings.width}
            height={drawSettings.height}
          />
        ))
      )}
    </g>
  );
}

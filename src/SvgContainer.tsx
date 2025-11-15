import { ReactNode } from "react";
import { SvgDefs } from "./SvgDefs";
import { DrawSettings } from "./components";

export interface SvgContainerProps {
  gridWidth: number;
  gridHeight: number;
  children?: ReactNode;
}

export function SvgContainer({children, gridWidth, gridHeight}: SvgContainerProps) {
  const drawSettings = DrawSettings.use();
  return (
      <svg width={drawSettings.width * gridWidth + drawSettings.xOffset * 2} height={drawSettings.height * gridHeight + drawSettings.yOffset * 2}>
        <SvgDefs />
        {children}
      </svg>
  );
}

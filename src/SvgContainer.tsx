import { ReactNode, useState } from "react";
import { SvgDefs } from "./SvgDefs";
import { DrawSettings } from "./components";
import { useWindowSize } from "./hooks";

export interface SvgContainerProps {
  gridWidth: number;
  gridHeight: number;
  children?: ReactNode;
}

export function SvgContainer({children, gridWidth, gridHeight}: SvgContainerProps) {
  const [drawSettings, setDrawSettings] = useState(new DrawSettings());
  useWindowSize((windowWidth: number, windowHeight: number) => {
    const newDrawSettings = DrawSettings.fittingInWindow(windowWidth, windowHeight, gridWidth, gridHeight);
    if (!newDrawSettings.equals(drawSettings)) {
      setDrawSettings(newDrawSettings);
    }
  }, [gridWidth, gridHeight]);
  return (
      <svg width={drawSettings.getDisplayWidth(gridWidth)} height={drawSettings.getDisplayHeight(gridHeight)}>
        <SvgDefs />
        <DrawSettings.ContextProvider value={drawSettings}>
          {children}
        </DrawSettings.ContextProvider>
      </svg>
  );
}

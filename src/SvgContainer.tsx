import { ReactNode, useRef, useState } from "react";
import { SvgDefs } from "./SvgDefs";
import { DrawSettings } from "./components";
import { useWindowSize } from "./hooks";

export interface SvgContainerProps {
  gridWidth: number;
  gridHeight: number;
  children?: ReactNode;
  ensureFitsInWindow?: boolean;
}

export function SvgContainer({children, gridWidth, gridHeight, ensureFitsInWindow = false}: SvgContainerProps) {
  const [drawSettings, setDrawSettings] = useState(new DrawSettings());
  const svgRef = useRef<SVGSVGElement>(null);
  useWindowSize((windowWidth: number, windowHeight: number) => {
    let extraPaddingX = 0;
    let extraPaddingY = 0;
    if (ensureFitsInWindow && svgRef.current) {
      const $container = document.querySelector(`html`);
      if ($container) {
        const containerRect = $container.getBoundingClientRect();
        const svgRect = svgRef.current.getBoundingClientRect();
        // TODO: Why do we need the +2 here to avoid scrollbars?
        // TOOD: Why is this different for X and Y?
        // extraPaddingX = containerRect.width - svgRect.width + 2;
        extraPaddingY = containerRect.height - svgRect.height + 2;
      }
    }
    const newDrawSettings = DrawSettings.fittingInWindow(windowWidth, windowHeight, gridWidth, gridHeight, extraPaddingX, extraPaddingY);
    if (!newDrawSettings.equals(drawSettings)) {
      setDrawSettings(newDrawSettings);
    }
  }, [gridWidth, gridHeight, svgRef, ensureFitsInWindow]);
  return (
      <svg ref={svgRef} width={drawSettings.getDisplayWidth(gridWidth)} height={drawSettings.getDisplayHeight(gridHeight)}>
        <SvgDefs />
        <DrawSettings.ContextProvider value={drawSettings}>
          {children}
        </DrawSettings.ContextProvider>
      </svg>
  );
}

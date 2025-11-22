import { ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { SvgDefs } from "./SvgDefs";
import { DrawSettings } from "./components";
import { useWindowSize } from "./hooks";
import { Direction } from "./game";
import { getPositionKey, Position } from "./utils";
import { MoveInterpreter, RingMoveInterpreter } from "./utils";
import { SingleTouchManager } from "./utils/SingleTouchManager";

export interface SvgContainerProps {
  gridWidth: number;
  gridHeight: number;
  children?: ReactNode;
  ensureFitsInWindow?: boolean;
  onTouchScreenMove?: (move: Direction) => void;
  moveInterpreter?: MoveInterpreter;
  showMoveInterpreter?: boolean;
  debugMoves?: boolean
}

export function SvgContainer({children, gridWidth, gridHeight, ensureFitsInWindow = false, onTouchScreenMove, moveInterpreter, showMoveInterpreter = true, debugMoves = false}: SvgContainerProps) {
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
  const [arrow, setArrow] = useState<{source: Position, target: Position} | null>(null);
  const [arrows, setArrows] = useState<{source: Position, target: Position}[]>([]);
  const onArrowChange = useCallback((source: Position, target: Position) => {
    setArrow({source, target});
  }, [arrow, setArrow]);
  const onArrowFinish = useCallback((source: Position, target: Position) => {
    setArrow(null);
    setArrows(arrows => [...arrows, {source, target}]);
  }, [setArrows, setArrow]);
  const onArrowStop = useCallback(() => {
    setArrow(null);
  }, [setArrow]);
  const touchManager = useMemo(() => {
    return new SingleTouchManager(moveInterpreter);
  }, []);
  touchManager.useUpdateProps(onTouchScreenMove, svgRef);
  touchManager.useAttachToSvg();
  touchManager.onArrowChange = onArrowChange;
  touchManager.onArrowFinish = onArrowFinish;
  touchManager.onArrowStop = onArrowStop;
  touchManager.moveInterpreter = moveInterpreter ?? new RingMoveInterpreter();
  const touchEventProps = useMemo(() => {
    return onTouchScreenMove ? touchManager.getTouchEventProps() : {};
  }, []);
  return (<>
    <svg 
      {...touchEventProps}
      ref={svgRef} 
      width={drawSettings.getDisplayWidth(gridWidth)} 
      height={drawSettings.getDisplayHeight(gridHeight)}
    >
      <SvgDefs />
      <DrawSettings.ContextProvider value={drawSettings}>
        {children}
      </DrawSettings.ContextProvider>
      {debugMoves && arrow ? (
        <polyline
          points={`${getPositionKey(arrow.source)} ${getPositionKey(arrow.target)}`}
          stroke={"black"}
          strokeWidth={5}
        />
      ) : null}
      {debugMoves ? arrows.map((arrow, index) => (
        <polyline
          key={index}
          points={`${getPositionKey(arrow.source)} ${getPositionKey(arrow.target)}`}
          stroke={"red"}
          strokeWidth={5}
        />
      )) : null}
      {showMoveInterpreter && arrow ? <touchManager.moveInterpreter.Visualise start={arrow.source} /> : null}
    </svg>
  </>);
}

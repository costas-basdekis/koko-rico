import "./SvgContainer.css";
import { ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { SvgDefs } from "./SvgDefs";
import { DrawSettings } from "./components";
import { useWindowSize } from "./hooks";
import { Direction } from "./game";
import { getPositionKey, VisualiseProps } from "./utils";
import { MoveInterpreter, RingMoveInterpreter } from "./utils";
import { Arrow, SingleTouchManager } from "./utils/SingleTouchManager";

export interface SvgContainerProps {
  gridWidth: number;
  gridHeight: number;
  children?: ReactNode;
  ensureFitsInWindow?: boolean;
  onTouchScreenMove?: (move: Direction) => void;
  restrictTouchScreenMovesTo?: { [key in Direction]?: boolean };
  moveInterpreter?: MoveInterpreter;
  showMoveInterpreter?: boolean;
  debugMoves?: boolean;
  moveInterpreterProps?: Partial<VisualiseProps>;
}

export function SvgContainer({
  children,
  gridWidth,
  gridHeight,
  ensureFitsInWindow = false,
  onTouchScreenMove,
  restrictTouchScreenMovesTo,
  moveInterpreter,
  showMoveInterpreter = true,
  debugMoves = false,
  moveInterpreterProps,
}: SvgContainerProps) {
  const [drawSettings, setDrawSettings] = useState(new DrawSettings());
  const svgRef = useRef<SVGSVGElement>(null);
  useWindowSize(
    (windowWidth: number, windowHeight: number) => {
      let extraPaddingX = 0;
      let extraPaddingY = 0;
      if (ensureFitsInWindow && svgRef.current) {
        const $container = document.querySelector(`html`);
        if ($container) {
          const containerRect = $container.getBoundingClientRect();
          const svgRect = svgRef.current.getBoundingClientRect();
          // Because the width will always be smaller than the App width
          // we need to have a static padding
          // extraPaddingX = containerRect.width - svgRect.width + 2;
          extraPaddingX = 10;
          extraPaddingY = containerRect.height - svgRect.height + 2;
        }
      }
      const newDrawSettings = DrawSettings.fittingInWindow(
        windowWidth,
        windowHeight,
        gridWidth,
        gridHeight,
        extraPaddingX,
        extraPaddingY,
      );
      if (!newDrawSettings.equals(drawSettings)) {
        setDrawSettings(newDrawSettings);
      }
    },
    [gridWidth, gridHeight, svgRef, ensureFitsInWindow],
  );
  const [arrow, setArrow] = useState<Arrow | null>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const onArrowChange = useCallback(
    (arrow: Arrow) => {
      setArrow(arrow);
    },
    [arrow, setArrow],
  );
  const onArrowFinish = useCallback(
    (arrow: Arrow) => {
      setArrow(null);
      setArrows((arrows) => [...arrows, arrow]);
    },
    [setArrows, setArrow],
  );
  const onArrowStop = useCallback(() => {
    setArrow(null);
  }, [setArrow]);
  const touchManager = useMemo(() => {
    return new SingleTouchManager(moveInterpreter);
  }, []);
  touchManager.useUpdateProps(onTouchScreenMove, svgRef);
  touchManager.useAttachToSvg();
  touchManager.restrictTouchScreenMovesTo = restrictTouchScreenMovesTo;
  touchManager.onArrowChange = onArrowChange;
  touchManager.onArrowFinish = onArrowFinish;
  touchManager.onArrowStop = onArrowStop;
  touchManager.moveInterpreter = moveInterpreter ?? new RingMoveInterpreter();
  const touchEventProps = useMemo(() => {
    return onTouchScreenMove ? touchManager.getTouchEventProps() : {};
  }, []);
  const drawSettingsStyle = useMemo(() => {
    return {
      "--draw-size": drawSettings.width,
    } as React.CSSProperties;
  }, [drawSettings]);
  return (
    <>
      <svg
        {...touchEventProps}
        ref={svgRef}
        width={drawSettings.getDisplayWidth(gridWidth)}
        height={drawSettings.getDisplayHeight(gridHeight)}
        style={drawSettingsStyle}
      >
        <SvgDefs />
        <DrawSettings.ContextProvider value={drawSettings}>
          {children}
        </DrawSettings.ContextProvider>
        {debugMoves && arrow ? (
          <polyline
            points={`${getPositionKey(arrow.start)} ${getPositionKey(arrow.end)}`}
            stroke={"black"}
            strokeWidth={5}
          />
        ) : null}
        {debugMoves
          ? arrows.map((arrow, index) => (
              <polyline
                key={index}
                points={`${getPositionKey(arrow.start)} ${getPositionKey(arrow.end)}`}
                stroke={"red"}
                strokeWidth={5}
              />
            ))
          : null}
        {showMoveInterpreter && arrow ? (
          <touchManager.moveInterpreter.Visualise
            {...moveInterpreterProps}
            start={arrow.start}
            restrictTouchScreenMovesTo={restrictTouchScreenMovesTo}
          />
        ) : null}
      </svg>
    </>
  );
}

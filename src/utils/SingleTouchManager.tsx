import { useEffect } from "react";
import { Direction } from "../game";
import { MoveInterpreter, RingMoveInterpreter } from "./MoveInterpreter";
import { Position, positionDistance } from "./Position";

export class SingleTouchManager {
  moveInterpreter: MoveInterpreter;
  identifier: number | null = null;
  x: number = 0;
  y: number = 0;
  onTouchScreenMove: ((move: Direction) => void) | undefined = undefined;
  svgRef: React.RefObject<SVGElement> | undefined = undefined;
  onArrowChange?: (source: Position, target: Position) => void;
  onArrowFinish?: (source: Position, target: Position) => void;
  onArrowStop?: () => void;

  constructor(moveInterpreter: MoveInterpreter = new RingMoveInterpreter()) {
    this.moveInterpreter = moveInterpreter;
  }

  useUpdateProps(onTouchScreenMove: ((move: Direction) => void) | undefined, svgRef: React.RefObject<SVGElement>) {
    useEffect(() => {
      this.onTouchScreenMove = onTouchScreenMove;
      this.svgRef = svgRef;
    }, [onTouchScreenMove, svgRef]);
  }

  useAttachToSvg() {
    useEffect(() => {
      if (!this.svgRef?.current) {
        return;
      }
      this.svgRef.current.addEventListener("touchstart", this.onTouchStart, {passive: false});
      this.svgRef.current.addEventListener("touchmove", this.onTouchMove, {passive: false});
      return () => {
        this.svgRef?.current?.removeEventListener("touchstart", this.onTouchStart);
        this.svgRef?.current?.removeEventListener("touchmove", this.onTouchMove);
      };
    }, [this.svgRef?.current]);
  }

  getTouchEventProps(): Partial<React.SVGProps<SVGElement>> {
    return {
      // onTouchStart: this.onTouchStart,
      // onTouchMove: this.onTouchMove,
      onTouchEnd: this.onTouchEndOrCancel,
      onTouchCancel: this.onTouchEndOrCancel,
    };
  }

  onTouchStart = (e: React.TouchEvent<SVGElement> | TouchEvent) => {
    // Prevent scrolling on touch devices
    e.preventDefault();
    if (this.identifier !== null) {
      return;
    }
    const changedTouch = Array.from(e.changedTouches)[0];
    if (!changedTouch) {
      return;
    }
    this.identifier = changedTouch.identifier;
    this.x = changedTouch.pageX;
    this.y = changedTouch.pageY;
  };

  onTouchMove = (e: React.TouchEvent<SVGElement> | TouchEvent) => {
    e.preventDefault();
    if (this.identifier === null) {
      return;
    }
    const changedTouch = Array.from(e.changedTouches)
      .find(changedTouch => changedTouch.identifier === this.identifier);
    if (!changedTouch) {
      return;
    }
    const dX = changedTouch.pageX - this.x;
    const dY = changedTouch.pageY - this.y;
    const nextMove = this.moveInterpreter.getNextMove(dX, dY);
    const clientRect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const arrowStart = { x: this.x - clientRect.left, y: this.y - clientRect.top };
    const arrowEnd = { x: changedTouch.pageX - clientRect.left, y: changedTouch.pageY - clientRect.top };
    if (!nextMove) {
      if (positionDistance(arrowStart, arrowEnd) > 2) {
        this.onArrowChange?.(arrowStart, arrowEnd);
      }
      return;
    }
    this.onTouchScreenMove?.(nextMove as Direction);
    this.onArrowFinish?.(arrowStart, arrowEnd);
    this.x = changedTouch.pageX;
    this.y = changedTouch.pageY;
  }

  onTouchEndOrCancel = (e: React.TouchEvent<SVGElement> | TouchEvent) => {
    if (this.identifier === null) {
      return;
    }
    const changedTouch = Array.from(e.changedTouches)
      .find(changedTouch => changedTouch.identifier === this.identifier);
    if (!changedTouch) {
      return;
    }
    this.identifier = null;
    this.onArrowStop?.();
  };

  Visualise(props: {start: Position}): JSX.Element {
    return this.moveInterpreter.Visualise(props);
  }
}

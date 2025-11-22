import { useMemo } from "react";
import { Direction } from "../game";
import { Position } from ".";

export interface MoveInterpreter {
  getNextMove(dX: number, dY: number): Direction | null;
  Visualise(props: {start: Position}): JSX.Element;
}

export class SimpleMoveInterpreter implements MoveInterpreter {
  minOffset: number;
  maxVerticalOffset: number;

  constructor({minOffset = 100, maxVerticalOffset = 30}: {minOffset?: number, maxVerticalOffset?: number} = {}) {
    this.minOffset = minOffset;
    this.maxVerticalOffset = maxVerticalOffset;
  }

  getNextMove(dX: number, dY: number): Direction | null {
    if (Math.abs(dX) >= this.maxVerticalOffset && Math.abs(dY) >= this.maxVerticalOffset) {
      return null;
    }
    if (Math.abs(dX) >= this.minOffset) {
      if (dX > 0) {
        return Direction.Right;
      } else {
        return Direction.Left;
      }
    } else if (Math.abs(dY) >= this.minOffset) {
      if (dY > 0) {
        return Direction.Down;
      } else {
        return Direction.Up;
      }
    }
    return null;
  }

  Visualise = ({start}: {start: Position}): JSX.Element => {
    return <>
      <rect
        x={(start.x + this.minOffset)}
        y={(start.y - this.maxVerticalOffset)}
        width={10000}
        height={this.maxVerticalOffset * 2}
        stroke={"red"}
        strokeWidth={2}
        fill={"none"}
      />
      <rect
        x={(start.x - this.maxVerticalOffset)}
        y={(start.y + this.minOffset)}
        width={this.maxVerticalOffset * 2}
        height={10000}
        stroke={"red"}
        strokeWidth={2}
        fill={"none"}
      />
      <rect
        x={(-10000)}
        y={(start.y - this.maxVerticalOffset)}
        width={10000 + (start.x - this.minOffset)}
        height={this.maxVerticalOffset * 2}
        stroke={"red"}
        strokeWidth={2}
        fill={"none"}
      />
      <rect
        x={(start.x - this.maxVerticalOffset)}
        y={(-10000)}
        width={this.maxVerticalOffset * 2}
        height={10000 + (start.y - this.minOffset)}
        stroke={"red"}
        strokeWidth={2}
        fill={"none"}
      />
    </>;
  }
}

export class RingMoveInterpreter implements MoveInterpreter {
  minRadius: number;
  maxRadius: number;
  angleSizeReduction: number;

  constructor({minRadius = 150, maxRadius = 300, angleSizeReduction = Math.PI / 8}: {minRadius?: number, maxRadius?: number, angleSizeReduction?: number} = {}) {
    this.minRadius = minRadius;
    this.maxRadius = maxRadius;
    this.angleSizeReduction = angleSizeReduction;
  }

  static anglesDirectionMap: {startAngle: number, endAngle: number, direction: Direction}[] = [
    {startAngle: Math.atan2(-1, 1), endAngle: Math.atan2(1, 1), direction: Direction.Right},
    {startAngle: Math.atan2(1, 1), endAngle: Math.atan2(1, -1), direction: Direction.Down},
    {startAngle: Math.atan2(1, -1), endAngle: Math.atan2(-1, -1), direction: Direction.Left},
    {startAngle: Math.atan2(-1, -1), endAngle: Math.atan2(-1, 1), direction: Direction.Up},
  ];

  getNextMove(dX: number, dY: number): Direction | null {
    const radius = Math.sqrt(dX * dX + dY * dY);
    if (radius < this.minRadius || radius > this.maxRadius) {
      return null;
    }
    const angle = Math.atan2(dY, dX);
    for (const {startAngle, endAngle, direction} of RingMoveInterpreter.anglesDirectionMap) {
      const adjustedStartAngle = startAngle + this.angleSizeReduction / 2;
      const adjustedEndAngle = endAngle - this.angleSizeReduction / 2;
      if (adjustedStartAngle <= adjustedEndAngle) {
        if (adjustedStartAngle < angle && angle <= adjustedEndAngle) {
          return direction;
        }
      } else {
        if (angle > adjustedStartAngle || angle <= adjustedEndAngle) {
          return direction;
        }
      }
    }
    return null;
  }

  Visualise = ({start}: { start: Position; }): JSX.Element => {
    const pathDAndDirections = useMemo(() => {
      return RingMoveInterpreter.anglesDirectionMap.map(({startAngle, endAngle, direction}) => ({
        direction, 
        d: `
          M${this.minRadius * Math.cos(startAngle + this.angleSizeReduction / 2)},${this.minRadius * Math.sin(startAngle + this.angleSizeReduction / 2)}
          A${this.minRadius},${this.minRadius} 0 0,1 ${this.minRadius * Math.cos(endAngle - this.angleSizeReduction / 2)},${this.minRadius * Math.sin(endAngle - this.angleSizeReduction / 2)}
          L${this.maxRadius * Math.cos(endAngle - this.angleSizeReduction / 2)},${this.maxRadius * Math.sin(endAngle - this.angleSizeReduction / 2)}
          A${this.maxRadius},${this.maxRadius} 0 0,0 ${this.maxRadius * Math.cos(startAngle + this.angleSizeReduction / 2)},${this.maxRadius * Math.sin(startAngle + this.angleSizeReduction / 2)}
          Z
        `,
      }));
    }, []);
    const transform = useMemo(() => {
      return `translate(${start.x},${start.y})`;
    }, [start.x, start.y]);
    return <>
      {pathDAndDirections.map(({direction, d}) => (
        <path
          key={direction}
          d={d}
          transform={transform}
          stroke={"red"}
          strokeWidth={2}
          fill={"none"}
        />
      ))}
    </>;
  }
}

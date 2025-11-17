import { createContext, useContext } from "react";

export class DrawSettings {
  width: number;
  height: number;
  xOffset: number;
  yOffset: number;
  robotColours: string[];

  static Context: React.Context<DrawSettings>;
  static ContextProvider: React.Provider<DrawSettings>;

  static use(): DrawSettings {
    return useContext(this.Context);
  }

  static fittingInWindow(windowWidth: number, windowHeight: number, gridWidth: number, gridHeight: number, extraPaddingX: number = 0, extraPaddingY: number = 0): DrawSettings {
    const xOffset = 10;
    const yOffset = 10;
    const maxWidth = Math.floor((windowWidth - extraPaddingX - xOffset * 2) /  gridWidth);
    const maxHeight = Math.floor((windowHeight - extraPaddingY - yOffset * 2) /  gridHeight);
    const width = Math.min(maxWidth, maxHeight);
    const height = width;
    return new this(width, height, xOffset, yOffset);
  }

  constructor(
    width: number = 40,
    height: number = 40,
    xOffset: number = 10,
    yOffset: number = 10,
    robotColours: string[] = ["red", "green", "blue", "yellow"]
  ) {
    this.width = width;
    this.height = height;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.robotColours = robotColours;
  }

  equals(other: DrawSettings): boolean {
    return (
      this.width === other.width
      && this.height === other.height
      && this.xOffset === other.xOffset
      && this.yOffset === other.yOffset
      && this.robotColours.length === other.robotColours.length
      && this.robotColours.every((colour, index) => colour == other.robotColours[index])
    )
  }

  getDisplayWidth(gridWidth: number): number {
    return this.width * gridWidth + this.xOffset * 2;
  }
  
  getDisplayHeight(gridHeight: number): number {
    return this.height * gridHeight + this.yOffset * 2;
  }

  getXPosition(x: number): number {
    return this.xOffset + this.width * x;
  }

  getYPosition(y: number): number {
    return this.yOffset + this.height * y;
  }

  getXYPositionStr(x: number, y: number): string {
    return `${this.getXPosition(x)},${this.getYPosition(y)}`;
  }
}

export const DrawSettingsContext = createContext(new DrawSettings());
DrawSettings.Context = DrawSettingsContext;
DrawSettings.ContextProvider = DrawSettingsContext.Provider;

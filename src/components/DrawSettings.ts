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

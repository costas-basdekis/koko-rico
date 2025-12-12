import "./App.css";
import { useCallback, useEffect, useState } from "react";
import { ExploreMode } from "./ExploreMode";
import { MultiRobotPuzzleMode } from "./MultiRobotPuzzleMode";
import { SingleRobotPuzzleMode } from "./SingleRobotPuzzleMode";
import { ControlButton } from "../components";
import { useFullscreen } from "../hooks";

type Mode = "multi-robot-puzzle" | "signle-robot-puzzle" | "explore";

export default function App() {
  const [mode, setMode] = useState<Mode>("multi-robot-puzzle");
  const onSetMultiobotPuzzleMode = useCallback(() => {
    setMode("multi-robot-puzzle");
  }, []);
  const onSetSingleRobotPuzzleMode = useCallback(() => {
    setMode("signle-robot-puzzle");
  }, []);
  const onSetExplorationMode = useCallback(() => {
    setMode("explore");
  }, []);
  const [fullscreen, , toggleFullscreen] = useFullscreen();
  return (
    <div className="App">
      <h1>
        <ControlButton
          className={"fullscreen-button"}
          onClick={toggleFullscreen}
        >
          {fullscreen ? "◻" : "⛶"}
        </ControlButton>
        Koko Rico
      </h1>
      {mode === "multi-robot-puzzle" ? (
        <MultiRobotPuzzleMode />
      ) : mode === "signle-robot-puzzle" ? (
        <SingleRobotPuzzleMode />
      ) : mode === "explore" ? (
        <ExploreMode />
      ) : null}
      <div>
        <ControlButton onClick={onSetMultiobotPuzzleMode}>
          <input
            type={"radio"}
            onChange={onSetMultiobotPuzzleMode}
            checked={mode === "multi-robot-puzzle"}
          />
          <span className={"button-hotkey"}>Multi</span>
          <br />
          Robot Puzzle
        </ControlButton>
        <ControlButton onClick={onSetSingleRobotPuzzleMode}>
          <input
            type={"radio"}
            onChange={onSetSingleRobotPuzzleMode}
            checked={mode === "signle-robot-puzzle"}
          />
          <span className={"button-hotkey"}>Single</span>
          <br />
          Robot Puzzle
        </ControlButton>
        <ControlButton onClick={onSetExplorationMode}>
          <input
            type={"radio"}
            onChange={onSetExplorationMode}
            checked={mode === "explore"}
          />
          <span className={"button-hotkey"}>Explore</span>
          <br />
          Mode
        </ControlButton>
      </div>
    </div>
  );
}

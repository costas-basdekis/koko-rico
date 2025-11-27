import "./styles.css";
import { useCallback, useState } from "react";
import ExploreMode from "./pages/ExploreMode";
import { MultiRobotPuzzleMode, SingleRobotPuzzleMode } from "./pages";

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
  return (
    <div className="App">
      <h1>Koko Rico</h1>
      {mode === "multi-robot-puzzle" ? (
        <MultiRobotPuzzleMode />
      ) : mode === "signle-robot-puzzle" ? (
        <SingleRobotPuzzleMode />
      ) : mode === "explore" ? (
        <ExploreMode />
      ) : null}
      <div>
        <button className={"control-button"} onClick={onSetMultiobotPuzzleMode}>
          <input
            type={"radio"}
            onChange={onSetMultiobotPuzzleMode}
            checked={mode === "multi-robot-puzzle"}
          />
          <span className={"button-hotkey"}>Multi</span>
          <br />
          Robot Puzzle
        </button>
        <button
          className={"control-button"}
          onClick={onSetSingleRobotPuzzleMode}
        >
          <input
            type={"radio"}
            onChange={onSetSingleRobotPuzzleMode}
            checked={mode === "signle-robot-puzzle"}
          />
          <span className={"button-hotkey"}>Single</span>
          <br />
          Robot Puzzle
        </button>
        <button className={"control-button"} onClick={onSetExplorationMode}>
          <input
            type={"radio"}
            onChange={onSetExplorationMode}
            checked={mode === "explore"}
          />
          <span className={"button-hotkey"}>Explore</span>
          <br />
          Mode
        </button>
      </div>
    </div>
  );
}

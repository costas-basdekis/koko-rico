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
      <div>
        <label><input type={"radio"} onChange={onSetMultiobotPuzzleMode} checked={mode === "multi-robot-puzzle"} />Multi-robot Puzzle</label>
        <label><input type={"radio"} onChange={onSetSingleRobotPuzzleMode} checked={mode === "signle-robot-puzzle"} />Single-robot Puzzle</label>
        <label><input type={"radio"} onChange={onSetExplorationMode} checked={mode === "explore"} />Explore</label>
      </div>
      {(
        mode === "multi-robot-puzzle" ? <MultiRobotPuzzleMode /> :
        mode === "signle-robot-puzzle" ? <SingleRobotPuzzleMode /> :
        mode === "explore" ? <ExploreMode /> :
        null
      )}
    </div>
  );
}

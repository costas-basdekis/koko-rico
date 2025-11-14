import "./styles.css";
import { useCallback, useState } from "react";
import ExploreMode from "./pages/ExploreMode";
import { PuzzleMode } from "./pages";

type Mode = "puzzle" | "explore";

export default function App() {
  const [mode, setMode] = useState<Mode>("puzzle");
  const onSetPuzzleMode = useCallback(() => {
    setMode("puzzle");
  }, []);
  const onSetExplorationMode = useCallback(() => {
    setMode("explore");
  }, []);
  return (
    <div className="App">
      <h1>Koko Rico</h1>
      <div>
        <label><input type={"radio"} onChange={onSetPuzzleMode} checked={mode === "puzzle"} />Puzzle</label>
        <label><input type={"radio"} onChange={onSetExplorationMode} checked={mode === "explore"} />Explore</label>
      </div>
      {(
        mode === "puzzle" ? <PuzzleMode /> :
        mode === "explore" ? <ExploreMode /> :
        null
      )}
    </div>
  );
}

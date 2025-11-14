import "./styles.css";
import { ReactNode, useCallback, useState } from "react";
import ExploreMode from "./pages/ExploreMode";

type Mode = "explore";

export default function App() {
  const [mode, setMode] = useState<Mode>("explore");
  const onSetExplorationMode = useCallback(() => {
    setMode("explore");
  }, []);
  return (
    <div className="App">
      <h1>Koko Rico</h1>
      <div>
        <label><input type={"radio"} onClick={onSetExplorationMode} checked={mode === "explore"} />Explore</label>
      </div>
      {(
        mode === "explore" ? <ExploreMode /> 
        : null
      )}
    </div>
  );
}

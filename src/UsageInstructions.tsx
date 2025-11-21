import { useMemo } from "react";
import { isTouchDevice as checkIsTouchDevice } from "./utils";

export function UsageInstructions() {
  const isTouchDevice = useMemo(() => {
    return checkIsTouchDevice();
  }, []);
  return (
    <div className="usage-instructions">
      <ul>
        {isTouchDevice ? <>
          <li>Tap on the arrows to move the robots.</li>
        </> : <>
          <li>Use arrow keys to move the selected robot.</li>
          <li>Press R/Shift+R to switch to the next/previous robot.</li>
          <li>Press U to undo the last move.</li>
        </>}
      </ul>
    </div>
  );
}

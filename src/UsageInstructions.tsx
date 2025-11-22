import { useCallback, useMemo } from "react";
import { isTouchDevice as checkIsTouchDevice } from "./utils";

export interface UsageInstructionsProps {
  showMoveInterpreter?: boolean;
  onChangeShowMoveInterpreter?: (showMoveInterpreter: boolean) => void;
}

export function UsageInstructions({showMoveInterpreter = true, onChangeShowMoveInterpreter}: UsageInstructionsProps) {
  const isTouchDevice = useMemo(() => {
    return checkIsTouchDevice();
  }, []);
  const innerOnChangeShowMoveInterpreter = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeShowMoveInterpreter?.(e.target.checked);
  }, [onChangeShowMoveInterpreter]);
  return (
    <div className="usage-instructions">
      <ul>
        {isTouchDevice ? <>
          <li>Tap on the arrows to move the robots.</li>
          <li>Tap on the robots to change the selected robot and drag to move it.</li>
          {onChangeShowMoveInterpreter ? (
            <li><label><input type={"checkbox"} checked={showMoveInterpreter} onChange={innerOnChangeShowMoveInterpreter} />Show move interpreter</label></li>
          ) : null}
        </> : <>
          <li>Use arrow keys to move the selected robot.</li>
          <li>Press R/Shift+R to switch to the next/previous robot.</li>
          <li>Press U to undo the last move.</li>
        </>}
      </ul>
    </div>
  );
}

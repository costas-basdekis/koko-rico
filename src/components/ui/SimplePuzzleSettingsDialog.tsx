import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SetShowSettingsDialog,
  SettingsDialog,
  useSettingsDialog,
} from "./SettingsDialog";
import _ from "underscore";

export interface SimplePuzzleSettingsDialogProps {
  setShowSettingsDialog: SetShowSettingsDialog;
  showOnlyOneTarget: boolean;
  onShowOnlyOneTargetChange: (showOnlyOneTarget: boolean) => void;
  maxDesiredTargetDistance?: number;
  desiredTargetDistance: number;
  onDesiredTargetDistanceChange: (desiredTargetDistance: number) => void;
}

export function SimplePuzzleSettingsDialog({
  setShowSettingsDialog,
  showOnlyOneTarget,
  onShowOnlyOneTargetChange,
  maxDesiredTargetDistance = 20,
  desiredTargetDistance,
  onDesiredTargetDistanceChange,
}: SimplePuzzleSettingsDialogProps) {
  const [dialogOpen, setDialogOpen] = useSettingsDialog(setShowSettingsDialog);
  const innerOnShowOnlyOneTargetChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onShowOnlyOneTargetChange?.(e.target.checked);
    },
    [onShowOnlyOneTargetChange],
  );
  const innerOnDesiredTargetDistanceChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = parseInt(e.target.value, 10);
      onDesiredTargetDistanceChange?.(newValue);
    },
    [onDesiredTargetDistanceChange],
  );
  const options = useMemo(() => {
    return _.range(2, maxDesiredTargetDistance + 1).map((value) => (
      <option key={value} value={value}>
        {value}
        {value === 5 ? " - Default" : value === 10 ? " - Slow" : ""}
      </option>
    ));
  }, [maxDesiredTargetDistance]);
  return (
    <SettingsDialog open={dialogOpen} onSetOpen={setDialogOpen}>
      {
        <label>
          <input
            type={"checkbox"}
            checked={showOnlyOneTarget}
            onChange={innerOnShowOnlyOneTargetChange}
          />
          One target
        </label>
      }
      <br />
      {
        <label>
          Distance:
          <select
            value={desiredTargetDistance}
            onChange={innerOnDesiredTargetDistanceChange}
          >
            {options}
          </select>
        </label>
      }
    </SettingsDialog>
  );
}

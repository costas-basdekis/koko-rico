import { useCallback, useMemo } from "react";
import {
  SetShowSettingsDialog,
  SettingsDialog,
  useSettingsDialog,
} from "./SettingsDialog";
import _ from "underscore";
import { SetSettings, Settings } from "../../hooks";

export interface SimplePuzzleSettingsDialogProps {
  setShowSettingsDialog: SetShowSettingsDialog;
  settings: Settings;
  setSettings: SetSettings;
  maxDesiredTargetDistance?: number;
  desiredTargetDistance: number;
  onDesiredTargetDistanceChange: (desiredTargetDistance: number) => void;
}

export function SimplePuzzleSettingsDialog({
  setShowSettingsDialog,
  settings,
  setSettings,
  maxDesiredTargetDistance = 20,
  desiredTargetDistance,
  onDesiredTargetDistanceChange,
}: SimplePuzzleSettingsDialogProps) {
  const [dialogOpen, setDialogOpen] = useSettingsDialog(setShowSettingsDialog);
  const innerOnShowOnlyOneTargetChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSettings.setShowOnlyOneTarget?.(e.target.checked);
    },
    [setSettings],
  );
  const innerOnDesiredTargetDistanceChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = parseInt(e.target.value, 10);
      onDesiredTargetDistanceChange?.(newValue);
    },
    [onDesiredTargetDistanceChange],
  );
  const innserOnShowSolutionIconsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSettings.setShowSolutionIcons?.(e.target.checked);
    },
    [setSettings.setShowSolutionIcons],
  );
  const innserOnShowPathIconsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSettings.setShowPathIcons?.(e.target.checked);
    },
    [setSettings.setShowPathIcons],
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
      <label>
        <input
          type={"checkbox"}
          checked={settings.showOnlyOneTarget}
          onChange={innerOnShowOnlyOneTargetChange}
        />
        One target
      </label>
      <br />
      <label>
        Distance:
        <select
          value={desiredTargetDistance}
          onChange={innerOnDesiredTargetDistanceChange}
        >
          {options}
        </select>
      </label>
      <br />
      <label>
        <input
          type={"checkbox"}
          checked={settings.showSolutionIcons}
          onChange={innserOnShowSolutionIconsChange}
        />
        Show solution icons
      </label>
      <br />
      <label>
        <input
          type={"checkbox"}
          checked={settings.showPathIcons}
          onChange={innserOnShowPathIconsChange}
        />
        Show path icons
      </label>
    </SettingsDialog>
  );
}

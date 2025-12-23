import { useEffect, useMemo, useState } from "react";
import { getLSBoolean, setLSBoolean } from "../utils/localStorageUtils";

export interface Settings {
  showMoveInterpreter: boolean;
  showOnlyOneTarget: boolean;
  showSolutionIcons: boolean;
  showPathIcons: boolean;
}

export type SetSettings = React.Dispatch<React.SetStateAction<Settings>> & {
  setShowMoveInterpreter: React.Dispatch<React.SetStateAction<boolean>>;
  setShowOnlyOneTarget: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSolutionIcons: React.Dispatch<React.SetStateAction<boolean>>;
  setShowPathIcons: React.Dispatch<React.SetStateAction<boolean>>;
};

function makeSettingsAttributeSetter<K extends keyof Settings>(
  innerSetSettings: React.Dispatch<React.SetStateAction<Settings>>,
  attribute: K,
): React.Dispatch<React.SetStateAction<Settings[K]>> {
  return (newValueOrFunc: React.SetStateAction<Settings[K]>): void => {
    if (typeof newValueOrFunc === "function") {
      innerSetSettings((prevValue) => {
        return {
          ...prevValue,
          [attribute]: newValueOrFunc(prevValue[attribute]),
        };
      });
    } else {
      innerSetSettings((prevValue) => {
        return { ...prevValue, [attribute]: newValueOrFunc };
      });
    }
  };
}

export function useSettings(): [Settings, SetSettings] {
  const [settings, innerSetSettings] = useState<Settings>(() => {
    return {
      showMoveInterpreter: getLSBoolean("showMoveInterpreter", true),
      showOnlyOneTarget: getLSBoolean("showOnlyOneTarget", false),
      showSolutionIcons: getLSBoolean("showSolutionIcons", true),
      showPathIcons: getLSBoolean("showPathIcons", true),
    };
  });
  const setSettings = useMemo(() => {
    function setSettings(valueOrFunc: React.SetStateAction<Settings>): void {
      return innerSetSettings(valueOrFunc);
    }
    setSettings.setShowMoveInterpreter = makeSettingsAttributeSetter(
      innerSetSettings,
      "showMoveInterpreter",
    );
    setSettings.setShowOnlyOneTarget = makeSettingsAttributeSetter(
      innerSetSettings,
      "showOnlyOneTarget",
    );
    setSettings.setShowSolutionIcons = makeSettingsAttributeSetter(
      innerSetSettings,
      "showSolutionIcons",
    );
    setSettings.setShowPathIcons = makeSettingsAttributeSetter(
      innerSetSettings,
      "showPathIcons",
    );
    return setSettings;
  }, [innerSetSettings]);
  useEffect(() => {
    setLSBoolean("showMoveInterpreter", settings.showMoveInterpreter);
  }, [settings.showMoveInterpreter]);
  useEffect(() => {
    setLSBoolean("showOnlyOneTarget", settings.showOnlyOneTarget);
  }, [settings.showOnlyOneTarget]);
  useEffect(() => {
    setLSBoolean("showSolutionIcons", settings.showSolutionIcons);
  }, [settings.showSolutionIcons]);
  useEffect(() => {
    setLSBoolean("showPathIcons", settings.showPathIcons);
  }, [settings.showPathIcons]);
  return [settings, setSettings];
}

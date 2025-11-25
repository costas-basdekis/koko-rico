import { useCallback, useMemo } from "react";
import { Game } from "../game";
import _ from "underscore";

export interface TargetsCounterProps {
  game: Game;
  showOnlyOneTarget: boolean;
  onShowOnlyOneTargetChange: (showOnlyOneTarget: boolean) => void;
  maxDesiredTargetDistance?: number;
  desiredTargetDistance: number;
  onDesiredTargetDistanceChange: (desiredTargetDistance: number) => void;
}

export function TargetsCounter({game, showOnlyOneTarget, onShowOnlyOneTargetChange, maxDesiredTargetDistance = 20, desiredTargetDistance, onDesiredTargetDistanceChange}: TargetsCounterProps) {
  const innerOnShowOnlyOneTargetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onShowOnlyOneTargetChange(e.target.checked);
  }, [onShowOnlyOneTargetChange]);
  const innerOnDesiredTargetDistanceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onDesiredTargetDistanceChange(newValue);
  }, [onDesiredTargetDistanceChange]);
  const options = useMemo(() => {
    return _.range(1, maxDesiredTargetDistance + 1).map(value => (
      <option key={value} value={value}>{value}{value === 5 ? " - Default" : value === 10 ? " - " : ""}</option>
    ));
  }, [maxDesiredTargetDistance]);
  return <>
    <label className={"button-like"}>Targets:</label>
    <label className={`button-like targets-counter`}>{game.completedTargetPositions.length}/{game.targetPositions.length}</label>
    <label className={`button-like`}><input type={"checkbox"} checked={showOnlyOneTarget} onChange={innerOnShowOnlyOneTargetChange} />One target</label>
    <label className={`button-like`}>
      Distance:
      <select value={desiredTargetDistance} onChange={innerOnDesiredTargetDistanceChange}>
        {options}
      </select>
    </label>
  </>;
}

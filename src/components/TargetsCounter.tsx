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

export function TargetsCounter({
  game,
  showOnlyOneTarget,
  onShowOnlyOneTargetChange,
  maxDesiredTargetDistance = 20,
  desiredTargetDistance,
  onDesiredTargetDistanceChange,
}: TargetsCounterProps) {
  const innerOnShowOnlyOneTargetChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onShowOnlyOneTargetChange(e.target.checked);
    },
    [onShowOnlyOneTargetChange],
  );
  const innerOnDesiredTargetDistanceChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = parseInt(e.target.value, 10);
      onDesiredTargetDistanceChange(newValue);
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
    <>
      <label className={"button-like"}>Targets:</label>
      <label className={`button-like targets-counter`}>
        <Star level={"gold"} />
        {game.completedTargetPositions.length}/{game.targetPositions.length},
        <Star level={"silver"} />
        {game.silverTargetPositions.length}/
        {game.targetPositions.length - game.completedTargetPositions.length},
        <Star level={"bronze"} />
        {game.bronzeTargetPositions.length}/
        {game.targetPositions.length -
          game.completedTargetPositions.length -
          game.silverTargetPositions.length}
      </label>
      <label className={`button-like`}>
        <input
          type={"checkbox"}
          checked={showOnlyOneTarget}
          onChange={innerOnShowOnlyOneTargetChange}
        />
        One target
      </label>
      <label className={`button-like`}>
        Distance:
        <select
          value={desiredTargetDistance}
          onChange={innerOnDesiredTargetDistanceChange}
        >
          {options}
        </select>
      </label>
    </>
  );
}

interface StarProps {
  level: "gold" | "silver" | "bronze";
}

function Star({ level }: StarProps) {
  return <span className={`star level-${level}`}>★</span>;
}

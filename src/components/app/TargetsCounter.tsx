import { useCallback, useMemo } from "react";
import { GameTargets } from "../../game";
import _ from "underscore";
import { ButtonLike, Star } from "../ui";

export interface TargetsCounterProps {
  gameTargets: GameTargets;
  showOnlyOneTarget?: boolean;
  onShowOnlyOneTargetChange?: (showOnlyOneTarget: boolean) => void;
  maxDesiredTargetDistance?: number;
  desiredTargetDistance?: number;
  onDesiredTargetDistanceChange?: (desiredTargetDistance: number) => void;
}

export function TargetsCounter({
  gameTargets,
  showOnlyOneTarget,
  onShowOnlyOneTargetChange,
  maxDesiredTargetDistance = 20,
  desiredTargetDistance,
  onDesiredTargetDistanceChange,
}: TargetsCounterProps) {
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
  if (onShowOnlyOneTargetChange && showOnlyOneTarget === undefined) {
    throw new Error(
      `showOnlyOneTarget is required when onShowOnlyOneTargetChange is present`,
    );
  }
  if (onDesiredTargetDistanceChange && desiredTargetDistance === undefined) {
    throw new Error(
      `desiredTargetDistance is required when onDesiredTargetDistanceChange is present`,
    );
  }
  return (
    <>
      <ButtonLike>Targets:</ButtonLike>
      <ButtonLike className={`targets-counter`}>
        <Star level={"gold"} />
        {gameTargets.completedTargetPositions.length}/
        {gameTargets.targetPositions.length},
        <Star level={"silver"} />
        {gameTargets.silverTargetPositions.length}/
        {gameTargets.targetPositions.length -
          gameTargets.completedTargetPositions.length}
        ,
        <Star level={"bronze"} />
        {gameTargets.bronzeTargetPositions.length}/
        {gameTargets.targetPositions.length -
          gameTargets.completedTargetPositions.length -
          gameTargets.silverTargetPositions.length}
      </ButtonLike>
      {onShowOnlyOneTargetChange ? (
        <ButtonLike>
          <input
            type={"checkbox"}
            checked={showOnlyOneTarget}
            onChange={innerOnShowOnlyOneTargetChange}
          />
          One target
        </ButtonLike>
      ) : null}
      {onDesiredTargetDistanceChange ? (
        <ButtonLike>
          Distance:
          <select
            value={desiredTargetDistance}
            onChange={innerOnDesiredTargetDistanceChange}
          >
            {options}
          </select>
        </ButtonLike>
      ) : null}
    </>
  );
}

import { Game } from "../game";

export interface MovesCounterProps {
  game: Game;
}

export function MovesCounter({ game }: MovesCounterProps) {
  return (
    <>
      <label className={"button-like"}>Moves:</label>
      <label
        className={`button-like moves-counter ${game.path.length < game.targetDistance ? "fewer" : game.path.length === game.targetDistance ? "exact" : game.path.length <= game.silverTargetDistance ? "silver" : game.path.length <= game.bronzeTargetDistance ? "bronze" : "more"}-moves`}
      >
        {game.path.length}/
        {game.path.length <= game.targetDistance
          ? game.targetDistance
          : game.path.length <= game.silverTargetDistance
            ? game.silverTargetDistance
            : game.bronzeTargetDistance}
      </label>
    </>
  );
}

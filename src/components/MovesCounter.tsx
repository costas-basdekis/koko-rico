import { Game } from "../game";

export interface MovesCounterProps {
  game: Game;
}

export function MovesCounter({ game }: MovesCounterProps) {
  return (
    <>
      <label className={"button-like"}>Moves:</label>
      <label
        className={`button-like moves-counter ${game.path.length < game.targetDistance ? "fewer" : game.path.length > game.targetDistance ? "more" : "exact"}-moves`}
      >
        {game.path.length}/{game.targetDistance}
      </label>
    </>
  );
}

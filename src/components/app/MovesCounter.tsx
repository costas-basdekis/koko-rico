import "./MovesCounter.css";
import { Game } from "../../game";
import { ButtonLike } from "../ui";

export interface MovesCounterProps {
  game: Game;
}

export function MovesCounter({ game }: MovesCounterProps) {
  return (
    <>
      <ButtonLike>Moves:</ButtonLike>
      <ButtonLike
        className={`moves-counter ${game.path.length < game.targetDistance ? "fewer" : game.path.length === game.targetDistance ? "exact" : game.path.length <= game.silverTargetDistance ? "silver" : game.path.length <= game.bronzeTargetDistance ? "bronze" : "more"}-moves`}
      >
        {game.path.length}/
        {game.path.length <= game.targetDistance
          ? game.targetDistance
          : game.path.length <= game.silverTargetDistance
            ? game.silverTargetDistance
            : game.bronzeTargetDistance}
      </ButtonLike>
    </>
  );
}

import "./MovesCounter.css";
import { Game } from "../../game";
import { ButtonLike, Star } from "../ui";

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
        {game.path.length}
      </ButtonLike>
      <ButtonLike>
        {game.targetDistance}
        <Star level={"gold"} />
        {", "}
        {game.targetDistance + 1}-{game.silverTargetDistance}
        <Star level={"silver"} />
        {", "}
        {game.silverTargetDistance + 1}-{game.bronzeTargetDistance}
        <Star level={"bronze"} />
      </ButtonLike>
    </>
  );
}

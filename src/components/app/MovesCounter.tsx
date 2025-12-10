import "./MovesCounter.css";
import { Game, GameTargets } from "../../game";
import { ButtonLike, Star } from "../ui";

export interface MovesCounterProps {
  game: Game;
  gameTargets: GameTargets;
}

export function MovesCounter({ game, gameTargets }: MovesCounterProps) {
  return (
    <>
      <ButtonLike>Moves:</ButtonLike>
      <ButtonLike
        className={`moves-counter ${game.path.length < gameTargets.targetDistance ? "fewer" : game.path.length === gameTargets.targetDistance ? "exact" : game.path.length <= gameTargets.silverTargetDistance ? "silver" : game.path.length <= gameTargets.bronzeTargetDistance ? "bronze" : "more"}-moves`}
      >
        {game.path.length}
      </ButtonLike>
      <ButtonLike>
        {gameTargets.targetDistance}
        <Star level={"gold"} />
        {", "}
        {gameTargets.targetDistance + 1}-{gameTargets.silverTargetDistance}
        <Star level={"silver"} />
        {", "}
        {gameTargets.silverTargetDistance + 1}-
        {gameTargets.bronzeTargetDistance}
        <Star level={"bronze"} />
      </ButtonLike>
    </>
  );
}

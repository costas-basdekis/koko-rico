import "./MovesCounter.css";
import { Game, GameTargets } from "../../game";
import { ButtonLike, Star } from "../ui";

export interface MovesCounterProps {
  game: Game;
  gameTargets: GameTargets;
}

export function MovesCounter({ game, gameTargets }: MovesCounterProps) {
  const silverDistanceRange = [
    gameTargets.targetDistance + 1,
    gameTargets.silverTargetDistance,
  ];
  const bronzeDistanceRange = [
    gameTargets.silverTargetDistance + 1,
    gameTargets.bronzeTargetDistance,
  ];
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
        {silverDistanceRange[0] === silverDistanceRange[1]
          ? silverDistanceRange[0]
          : `${silverDistanceRange[0]} - ${silverDistanceRange[1]}`}
        <Star level={"silver"} />
        {", "}
        {bronzeDistanceRange[0] === bronzeDistanceRange[1]
          ? bronzeDistanceRange[0]
          : `${bronzeDistanceRange[0]} - ${bronzeDistanceRange[1]}`}
        <Star level={"bronze"} />
      </ButtonLike>
    </>
  );
}

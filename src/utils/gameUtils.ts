import { Game, GameTargets } from "../game";

export function saveGameToLocalStorage(
  key: string,
  game: Game,
  gameTargets: GameTargets | null,
) {
  localStorage.setItem(
    key,
    JSON.stringify(GameTargets.serialiseGameWithTargets(game, gameTargets)),
  );
}

export function loadGameFromLocalStorage(
  key: string,
): { game: Game; gameTargets: GameTargets | null } | null {
  const serialisedStr = localStorage.getItem(key);
  if (!serialisedStr) {
    return null;
  }
  try {
    const serialised = JSON.parse(serialisedStr);
    const { game, gameTargets, saveAgain } =
      GameTargets.deserialiseGameAndTargets(serialised);
    if (saveAgain) {
      saveGameToLocalStorage(key, game, gameTargets);
    }
    return { game, gameTargets };
  } catch (e) {
    console.error("Error while deserialising game:", e);
    return null;
  }
}

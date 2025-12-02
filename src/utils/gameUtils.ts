import { Game } from "../game";

export function saveGameToLocalStorage(key: string, game: Game) {
  localStorage.setItem(key, JSON.stringify(game.serialise()));
}

export function loadGameFromLocalStorage(key: string): Game | null {
  const serialisedStr = localStorage.getItem(key);
  if (!serialisedStr) {
    return null;
  }
  try {
    return Game.deserialise(JSON.parse(serialisedStr));
  } catch (e) {
    console.error("Error while deserialising game:", e);
    return null;
  }
}

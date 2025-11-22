import { useEffect, useMemo, useState } from "react";
import { Game } from "../game";

export function useSavedGame(key: string, makeGame: (targetDistance: number) => Game, defaultTargetDistance: number): {
  game: Game, setGame: React.Dispatch<React.SetStateAction<Game>>, 
  desiredTargetDistance: number, setDesiredTargetDistance: React.Dispatch<React.SetStateAction<number>>,
  effectiveTargetDistance: number, setEffectiveTargetDistance: React.Dispatch<React.SetStateAction<number>>,
} {
  const savedGame = useMemo(() => {
    return loadGameFromLocalStorage(key);
  }, []);
  const [desiredTargetDistance, setDesiredTargetDistance] = useState(savedGame?.targetDistance ?? defaultTargetDistance);
  const [effectiveTargetDistance, setEffectiveTargetDistance] = useState(desiredTargetDistance);
  const [game, setGame]: [Game, any] = useState(() => {
    if (savedGame) {
      return savedGame;
    }
    return makeGame(effectiveTargetDistance);
  });
  useEffect(() => {
    if (desiredTargetDistance === effectiveTargetDistance) {
      return;
    }
    setEffectiveTargetDistance(desiredTargetDistance);
    setGame(makeGame(desiredTargetDistance));
  }, [desiredTargetDistance, effectiveTargetDistance, setEffectiveTargetDistance, setGame]);
  useEffect(() => {
    saveGameToLocalStorage(key, game);
  }, [game]);
  return {game, setGame, desiredTargetDistance, setDesiredTargetDistance, effectiveTargetDistance, setEffectiveTargetDistance};
}

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

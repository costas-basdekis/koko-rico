import { useCallback, useEffect, useMemo, useState } from "react";
import { Game } from "../game";
import { PuzzleService, usePuzzleService } from "../hooks";

export function useSavedGame(
  key: string,
  makeInitialGame: (targetDistance: number) => Game,
  makeBackgroundGame: (
    targetDistance: number,
    puzzleService: PuzzleService,
    setGameOrError: (gameOrError: Game | string) => void,
  ) => void,
  defaultTargetDistance: number,
): {
  game: Game;
  setGame: React.Dispatch<React.SetStateAction<Game>>;
  gameLoading: boolean;
  setGameLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onNewGame: () => void;
  cancelNewGame: () => void;
  desiredTargetDistance: number;
  setDesiredTargetDistance: React.Dispatch<React.SetStateAction<number>>;
  effectiveTargetDistance: number;
  setEffectiveTargetDistance: React.Dispatch<React.SetStateAction<number>>;
} {
  const savedGame = useMemo(() => {
    return loadGameFromLocalStorage(key);
  }, []);
  const [desiredTargetDistance, setDesiredTargetDistance] = useState(
    savedGame?.targetDistance ?? defaultTargetDistance,
  );
  const [effectiveTargetDistance, setEffectiveTargetDistance] = useState(
    desiredTargetDistance,
  );
  const [game, setGame]: [Game, any] = useState(() => {
    if (savedGame) {
      return savedGame;
    }
    return makeInitialGame(effectiveTargetDistance);
  });
  const [gameLoading, setGameLoading] = useState(false);
  useEffect(() => {
    if (desiredTargetDistance === effectiveTargetDistance) {
      return;
    }
    setEffectiveTargetDistance(desiredTargetDistance);
  }, [
    desiredTargetDistance,
    effectiveTargetDistance,
    setEffectiveTargetDistance,
    setGame,
    setGameLoading,
  ]);
  const setGameOrError = useCallback(
    (gameOrError: Game | string) => {
      setGameLoading(false);
      if (typeof gameOrError === "string") {
      } else {
        setGame(gameOrError);
      }
    },
    [setGame, setGameLoading],
  );
  const puzzleService = usePuzzleService();
  const cancelNewGame = useCallback(() => {
    setGameLoading((oldGameLoading) => {
      if (oldGameLoading) {
        puzzleService.terminate();
      }
      return false;
    });
  }, [puzzleService, setGameLoading]);
  const onNewGame = useCallback(() => {
    if (gameLoading) {
      cancelNewGame();
      return;
    }
    setGameLoading(true);
    makeBackgroundGame(effectiveTargetDistance, puzzleService, setGameOrError);
  }, [
    cancelNewGame,
    gameLoading,
    effectiveTargetDistance,
    puzzleService,
    setGameOrError,
  ]);
  useEffect(() => {
    if (game.targetDistance === effectiveTargetDistance) {
      return;
    }
    onNewGame();
    return cancelNewGame;
  }, [effectiveTargetDistance]);
  useEffect(() => {
    saveGameToLocalStorage(key, game);
  }, [game]);
  return {
    game,
    setGame,
    gameLoading,
    setGameLoading,
    onNewGame,
    cancelNewGame,
    desiredTargetDistance,
    setDesiredTargetDistance,
    effectiveTargetDistance,
    setEffectiveTargetDistance,
  };
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

import { useCallback, useEffect, useMemo, useState } from "react";
import { Game, GameTargets, Robot } from "../game";
import { PuzzleService, usePuzzleService } from "./usePuzzleService";
import {
  ItemHistory,
  loadGameFromLocalStorage,
  Position,
  saveGameToLocalStorage,
} from "../utils";

export function useSavedGame(
  key: string,
  makeInitialGame: (targetDistance: number) => {
    game: Game;
    gameTargets: GameTargets;
  },
  makeBackgroundGame: (
    targetDistance: number,
    puzzleService: PuzzleService,
    setGameOrError: (
      gameOrError: { game: Game; gameTargets: GameTargets } | string,
    ) => void,
  ) => void,
  defaultTargetDistance: number,
): {
  game: Game;
  setGame: (
    newGameOrFunc: Game | ((newGame: Game) => Game | null | undefined),
    newGameTargets?: GameTargets,
  ) => void;
  gameTargets: GameTargets;
  history: ItemHistory<Game>;
  onReset: () => Game;
  onUndo: () => Game;
  onRedo: () => Game;
  onRobotMove: (robot: Robot, newPosition: Position, isUndo: boolean) => Game;
  gameLoading: boolean;
  setGameLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onNewGame: () => void;
  cancelNewGame: () => void;
  desiredTargetDistance: number;
  setDesiredTargetDistance: React.Dispatch<React.SetStateAction<number>>;
  effectiveTargetDistance: number;
  setEffectiveTargetDistance: React.Dispatch<React.SetStateAction<number>>;
} {
  const savedGameAndTargets = useMemo(() => {
    return loadGameFromLocalStorage(key);
  }, []);
  const [desiredTargetDistance, setDesiredTargetDistance] = useState(
    savedGameAndTargets?.gameTargets?.targetDistance || defaultTargetDistance,
  );
  const [effectiveTargetDistance, setEffectiveTargetDistance] = useState(
    desiredTargetDistance,
  );
  const initialGameAndTargets = useMemo(() => {
    return savedGameAndTargets ?? makeInitialGame(effectiveTargetDistance);
  }, []);
  const [gameTargets, setGameTargets] = useState<GameTargets>(() => {
    return initialGameAndTargets.gameTargets ?? GameTargets.empty();
  });
  const [history, setHistory] = useState(() => {
    return ItemHistory.initial(initialGameAndTargets.game);
  });
  const game = history.current;
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
  ]);
  const puzzleService = usePuzzleService();
  const cancelNewGame = useCallback(() => {
    setGameLoading((oldGameLoading) => {
      if (oldGameLoading) {
        puzzleService.terminate();
      }
      return false;
    });
  }, [puzzleService, setGameLoading]);
  useEffect(() => {
    if (gameTargets.targetDistance === effectiveTargetDistance) {
      return;
    }
    onNewGame();
    return cancelNewGame;
  }, [effectiveTargetDistance]);
  useEffect(() => {
    saveGameToLocalStorage(key, game, gameTargets);
  }, [game]);
  const setGame = useCallback(
    (
      newGameOrFunc: Game | ((newGame: Game) => Game | null | undefined),
      newGameTargets: GameTargets = gameTargets,
    ) => {
      let newGameFunc: (newGame: Game) => Game | null | undefined;
      if (typeof newGameOrFunc === "function") {
        newGameFunc = newGameOrFunc;
      } else {
        newGameFunc = () => newGameOrFunc;
      }
      setHistory((originalHistory) => {
        const newGame = newGameFunc(originalHistory.current);
        if (!newGame) {
          return originalHistory;
        }
        newGameTargets =
          newGameTargets.updateCompletedTargetsAfterMove(newGame);
        if (newGameTargets != gameTargets) {
          setGameTargets(newGameTargets);
        }
        const newHistory = originalHistory.setCurrent(newGame);
        return newHistory;
      });
    },
    [history, setHistory, gameTargets, setGameTargets],
  );
  const onReset = useCallback(() => {
    if (!history.canUndo()) {
      return game;
    }
    const newHistory = history.undoAll();
    setHistory(newHistory);
    return newHistory.current;
  }, [history, setHistory]);
  const onUndo = useCallback(() => {
    if (!history.canUndo()) {
      return game;
    }
    const newHistory = history.undo();
    setHistory(newHistory);
    return newHistory.current;
  }, [history, setHistory]);
  const onRedo = useCallback(() => {
    if (!history.canRedo()) {
      return game;
    }
    const newHistory = history.redo();
    setHistory(newHistory);
    return newHistory.current;
  }, [history, setHistory]);
  const onRobotMove = useCallback(
    (robot: Robot, nextPosition: Position, isUndo: boolean) => {
      const newGame = game.moveRobot(robot, nextPosition, isUndo);
      setGame(newGame);
      return newGame;
    },
    [game, setGame],
  );
  const setGameOrError = useCallback(
    (gameOrError: { game: Game; gameTargets: GameTargets } | string) => {
      setGameLoading(false);
      if (typeof gameOrError === "string") {
      } else {
        setGame(gameOrError.game, gameOrError.gameTargets);
      }
    },
    [setGame, setGameLoading],
  );
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
  return {
    game,
    setGame,
    gameTargets,
    history,
    onReset,
    onUndo,
    onRedo,
    onRobotMove,
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

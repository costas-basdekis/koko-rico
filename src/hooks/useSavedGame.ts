import { useCallback, useEffect, useMemo, useState } from "react";
import { Game, GameTargets, Robot } from "../game";
import { PuzzleService, usePuzzleService } from "./usePuzzleService";
import {
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
  setGame: React.Dispatch<React.SetStateAction<Game>>;
  gameTargets: GameTargets;
  setGameAndTargets: (game: Game, gameTargets: GameTargets) => void;
  undoStack: Game[];
  setUndoStack: (
    undoStackOrFunc: Game[] | ((undoStack: Game[]) => Game[]),
  ) => void;
  redoStack: Game[];
  setRedoStack: (
    redoStackOrFunc: Game[] | ((redoStack: Game[]) => Game[]),
  ) => void;
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
    savedGameAndTargets?.game?.targetDistance ?? defaultTargetDistance,
  );
  const [effectiveTargetDistance, setEffectiveTargetDistance] = useState(
    desiredTargetDistance,
  );
  const initialGameAndTargets = useMemo(() => {
    return savedGameAndTargets ?? makeInitialGame(effectiveTargetDistance);
  }, []);
  const [game, setGame]: [Game, any] = useState(() => {
    return initialGameAndTargets.game;
  });
  const [gameTargets, setGameTargets] = useState<GameTargets>(() => {
    return initialGameAndTargets.gameTargets ?? GameTargets.empty();
  });
  const setGameAndTargets = useCallback(
    (newGame: Game, newGameTargets: GameTargets) => {
      setGame(newGame);
      setGameTargets(newGameTargets);
    },
    [setGame, setGameTargets],
  );
  const [undoStack, setUndoStack] = useState<Game[]>(() => {
    return game.getUndoStack();
  });
  const [redoStack, setRedoStack] = useState<Game[]>([]);
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
    (gameOrError: { game: Game; gameTargets: GameTargets } | string) => {
      setGameLoading(false);
      if (typeof gameOrError === "string") {
      } else {
        setGame(gameOrError.game);
        setGameTargets(gameOrError.gameTargets);
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
    if (gameTargets.targetDistance === effectiveTargetDistance) {
      return;
    }
    onNewGame();
    return cancelNewGame;
  }, [effectiveTargetDistance]);
  useEffect(() => {
    saveGameToLocalStorage(key, game, gameTargets);
  }, [game]);
  const captiveSetGame = useCallback(
    (newGameOrFunc: Game | ((newGame: Game) => Game | null | undefined)) => {
      let newGameFunc: (newGame: Game) => Game | null | undefined;
      if (typeof newGameOrFunc === "function") {
        newGameFunc = newGameOrFunc;
      } else {
        newGameFunc = () => newGameOrFunc;
      }
      return setGame((originalNewGame: Game) => {
        const newGame = newGameFunc(originalNewGame);
        if (!newGame) {
          return;
        }
        const undoIndex = undoStack.indexOf(newGame);
        const redoIndex = redoStack.indexOf(newGame);
        if (redoIndex != -1) {
          setUndoStack([...undoStack, game, ...redoStack.slice(0, redoIndex)]);
          setRedoStack(redoStack.slice(redoIndex + 1));
        } else if (undoIndex != -1) {
          setUndoStack(undoStack.slice(0, undoIndex));
          setRedoStack([...undoStack.slice(undoIndex + 1), game, ...redoStack]);
        } else {
          setUndoStack(newGame.getUndoStack());
          setRedoStack([]);
          const newGameTargets =
            gameTargets.updateCompletedTargetsAfterMove(newGame);
          if (newGameTargets !== gameTargets) {
            setGameTargets(newGameTargets);
          }
        }
        return newGame;
      });
    },
    [setGame, redoStack, setRedoStack, gameTargets, setGameTargets],
  );
  const onReset = useCallback(() => {
    if (!undoStack.length) {
      return game;
    }
    const newGame = undoStack[0];
    captiveSetGame(newGame);
    return newGame;
  }, [game, undoStack, captiveSetGame]);
  const onUndo = useCallback(() => {
    if (!undoStack.length) {
      return game;
    }
    const newGame = undoStack[undoStack.length - 1];
    captiveSetGame(newGame);
    return newGame;
  }, [game, undoStack, captiveSetGame]);
  const onRedo = useCallback(() => {
    if (!redoStack.length) {
      return game;
    }
    const newGame = redoStack[0];
    captiveSetGame(newGame);
    return newGame;
  }, [game, redoStack, captiveSetGame]);
  const onRobotMove = useCallback(
    (robot: Robot, nextPosition: Position, isUndo: boolean) => {
      const newGame = game.moveRobot(robot, nextPosition, isUndo);
      captiveSetGame(newGame);
      return newGame;
    },
    [game, captiveSetGame],
  );
  return {
    game,
    setGame: captiveSetGame,
    gameTargets,
    setGameAndTargets,
    undoStack,
    setUndoStack,
    redoStack,
    setRedoStack,
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

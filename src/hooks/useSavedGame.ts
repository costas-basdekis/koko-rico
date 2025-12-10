import { useCallback, useEffect, useMemo, useState } from "react";
import { Field, Game, GameTargets, Robot } from "../game";
import { PuzzleService, usePuzzleService } from "./usePuzzleService";
import {
  loadGameFromLocalStorage,
  Position,
  saveGameToLocalStorage,
} from "../utils";

export function useSavedGame(
  key: string,
  makeInitialGame: (targetDistance: number) => Game,
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
  const [game, setGame]: [Game, any] = useState(() => {
    if (savedGameAndTargets) {
      return savedGameAndTargets.game;
    }
    return makeInitialGame(effectiveTargetDistance);
  });
  const [{ gameTargets, gameTargetsField }, setGameTargetsAndField] = useState<{
    gameTargets: GameTargets;
    gameTargetsField: Field;
  }>(() => {
    if (savedGameAndTargets) {
      return {
        gameTargets: savedGameAndTargets.gameTargets!,
        gameTargetsField: savedGameAndTargets.game.field,
      };
    }
    return {
      gameTargets: GameTargets.fromGame(game),
      gameTargetsField: game.field,
    };
  });
  useEffect(() => {
    if (game.field !== gameTargetsField) {
      setGameTargetsAndField({
        gameTargets: GameTargets.fromGame(game),
        gameTargetsField: game.field,
      });
      return;
    }
    const newGameTargets = gameTargets.updateCompletedTargetsAfterMove(game);
    if (newGameTargets !== gameTargets) {
      setGameTargetsAndField({ gameTargets: newGameTargets, gameTargetsField });
    }
  }, [game, setGameTargetsAndField, gameTargetsField]);
  const setGameAndTargets = useCallback(
    (newGame: Game, newGameTargets: GameTargets) => {
      setGame(newGame);
      setGameTargetsAndField({
        gameTargets: newGameTargets,
        gameTargetsField: newGame.field,
      });
    },
    [setGame, setGameTargetsAndField],
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
        setGameTargetsAndField({
          gameTargets: gameOrError.gameTargets,
          gameTargetsField: gameOrError.game.field,
        });
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
          return null;
        }
        const undoIndex = undoStack.indexOf(newGame);
        const redoIndex = redoStack.indexOf(newGame);
        setGame(newGame);
        if (redoIndex != -1) {
          setUndoStack([...undoStack, ...redoStack.slice(0, redoIndex)]);
          setRedoStack(redoStack.slice(redoIndex + 1));
        } else if (undoIndex != -1) {
          setUndoStack(undoStack.slice(0, undoIndex));
          setRedoStack([...undoStack.slice(undoIndex + 1), ...redoStack]);
        } else {
          setUndoStack(newGame.getUndoStack());
          setRedoStack([]);
        }
      });
    },
    [setGame, redoStack, setRedoStack],
  );
  const onReset = useCallback(() => {
    if (!undoStack) {
      return game;
    }
    const newGame = undoStack[0];
    setGame(newGame);
    setRedoStack([...undoStack.slice(1), game]);
    setUndoStack([]);
    return newGame;
  }, [game, setGame, setRedoStack, undoStack, setUndoStack]);
  const onUndo = useCallback(() => {
    if (!undoStack.length) {
      return game;
    }
    const newGame = undoStack[undoStack.length - 1];
    setGame(newGame);
    setUndoStack(undoStack.slice(0, undoStack.length - 1));
    setRedoStack([game, ...redoStack]);
    return newGame;
  }, [game, setGame]);
  const onRedo = useCallback(() => {
    if (!redoStack.length) {
      return game;
    }
    const newGame = redoStack[0];
    setGame(newGame);
    setUndoStack([...undoStack, game]);
    setRedoStack(redoStack.slice(1));
    return newGame;
  }, [game, redoStack, setRedoStack, setGame]);
  const onRobotMove = useCallback(
    (robot: Robot, nextPosition: Position, isUndo: boolean) => {
      const newGame = game.moveRobot(robot, nextPosition, isUndo);
      setGame(newGame);
      setUndoStack([...undoStack, game]);
      if (isUndo) {
        setRedoStack([game, ...redoStack]);
      } else {
        setRedoStack([]);
      }
      return newGame;
    },
    [game, setGame],
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

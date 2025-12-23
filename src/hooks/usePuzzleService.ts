import { useEffect, useMemo } from "react";
import {
  Game,
  GameBackgroundRequest,
  GameBackgroundResponse,
  GameSolutionsBackgroundRequest,
  GameSolutionsBackgroundResponse,
  GameTargets,
} from "../game";

export interface PuzzleService {
  webWorker: Worker | null;
  onMessage: (e: MessageEvent<any>) => void;
  request: (
    request: GameBackgroundRequest,
    callback: (
      gameOrError: { game: Game; gameTargets: GameTargets } | string,
    ) => void,
  ) => void;
  callbacks: Map<
    number,
    (gameOrError: { game: Game; gameTargets: GameTargets } | string) => void
  >;
  requestFillTargetSolutions: (
    request: GameSolutionsBackgroundRequest,
    callback: (gameOrError: { gameTargets: GameTargets } | string) => void,
  ) => void;
  fillTargetSolutionsCallbacks: Map<
    number,
    (gameOrError: { gameTargets: GameTargets } | string) => void
  >;
  nextCallbackId: number;
  terminate: () => void;
}

export function usePuzzleService(): PuzzleService {
  const puzzleService = useMemo(() => {
    const service: PuzzleService = {
      webWorker: null,
      onMessage: (e: MessageEvent<any>) => {
        if (e.data.type === "new-puzzle") {
          const callbackId = e.data.callbackId;
          const callback = service.callbacks.get(callbackId);
          if (!callback) {
            return;
          }
          service.callbacks.delete(callbackId);
          const response = e.data as GameBackgroundResponse;
          callback(
            response.success
              ? {
                  game: Game.deserialise(response.serialised),
                  gameTargets: GameTargets.deserialise(
                    response.serialisedTargets,
                  ),
                }
              : response.error,
          );
        } else if (e.data.type === "solutions-filled") {
          const callbackId = e.data.callbackId;
          const callback = service.fillTargetSolutionsCallbacks.get(callbackId);
          if (!callback) {
            return;
          }
          service.fillTargetSolutionsCallbacks.delete(callbackId);
          const response = e.data as GameSolutionsBackgroundResponse;
          callback(
            response.success
              ? {
                  gameTargets: GameTargets.deserialise(
                    response.serialisedTargets,
                  ),
                }
              : response.error,
          );
        }
      },
      request: (
        request: GameBackgroundRequest,
        callback: (
          gameOrError: { game: Game; gameTargets: GameTargets } | string,
        ) => void,
      ) => {
        if (!service.webWorker) {
          service.webWorker = new Worker("/koko-rico/service-worker.js");
          service.webWorker.onmessage = service.onMessage;
        }
        const callbackId = service.nextCallbackId;
        service.callbacks.set(callbackId, callback);
        service.nextCallbackId++;
        service.webWorker.postMessage({
          type: "create-puzzle",
          callbackId,
          ...request,
        });
      },
      callbacks: new Map(),
      requestFillTargetSolutions: (
        request: GameSolutionsBackgroundRequest,
        callback: (gameOrError: { gameTargets: GameTargets } | string) => void,
      ) => {
        if (!service.webWorker) {
          service.webWorker = new Worker("/koko-rico/service-worker.js");
          service.webWorker.onmessage = service.onMessage;
        }
        const callbackId = service.nextCallbackId;
        service.fillTargetSolutionsCallbacks.set(callbackId, callback);
        service.nextCallbackId++;
        service.webWorker.postMessage({
          type: "fill-target-solutions",
          callbackId,
          ...request,
        });
      },
      fillTargetSolutionsCallbacks: new Map(),
      nextCallbackId: 1,
      terminate: () => {
        if (!service.webWorker) {
          return;
        }
        service.webWorker.terminate();
        service.webWorker = null;
      },
    };
    return service;
  }, []);
  useEffect(() => {
    return () => {
      puzzleService.terminate();
    };
  }, [puzzleService]);
  return puzzleService;
}

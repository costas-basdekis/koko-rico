import { useEffect, useMemo } from "react";
import { Game, GameBackgroundRequest, GameBackgroundResponse } from "../game";

export interface PuzzleService {
  webWorker: Worker | null;
  onMessage: (e: MessageEvent<any>) => void;
  request: (
    request: GameBackgroundRequest,
    callback: (gameOrError: Game | string) => void,
  ) => void;
  callbacks: Map<number, (gameOrError: Game | string) => void>;
  nextCallbackId: number;
  terminate: () => void;
}

export function usePuzzleService(): PuzzleService {
  const puzzleService = useMemo(() => {
    const service: PuzzleService = {
      webWorker: null,
      onMessage: (e: MessageEvent<any>) => {
        if (e.data.type !== "new-puzzle") {
          return;
        }
        const callbackId = e.data.callbackId;
        const callback = service.callbacks.get(callbackId);
        if (!callback) {
          return;
        }
        service.callbacks.delete(callbackId);
        const response = e.data as GameBackgroundResponse;
        callback(
          response.success
            ? Game.deserialise(response.serialised)
            : response.error,
        );
      },
      request: (
        request: GameBackgroundRequest,
        callback: (gameOrError: Game | string) => void,
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

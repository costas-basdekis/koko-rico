import {
  Game,
  GameBackgroundRequest,
  GameBackgroundResponse,
  GameSolutionsBackgroundRequest,
  GameSolutionsBackgroundResponse,
  GameTargets,
} from "../game";

class CallbackManager<C extends Function> {
  callbacks: Map<number, C> = new Map();
  nextCallbackId: number = 1;

  push(callback: C): number {
    const callbackId = this.getNextCallbackId();
    this.callbacks.set(callbackId, callback);
    return callbackId;
  }

  getNextCallbackId(): number {
    const nextCallbackId = this.nextCallbackId;
    this.nextCallbackId++;
    return nextCallbackId;
  }

  pop(callbackId: number): C | undefined {
    const callback = this.callbacks.get(callbackId);
    if (callback) {
      this.callbacks.delete(callbackId);
    }
    return callback;
  }
}

export type GameCallback = (
  gameOrError: { game: Game; gameTargets: GameTargets } | string,
) => void;

export type GameSolutionsCallback = (
  gameOrError: { gameTargets: GameTargets } | string,
) => void;

export class PuzzleService {
  webWorker: Worker | null = null;
  callbacks: CallbackManager<GameCallback> = new CallbackManager();
  fillTargetSolutionsCallbacks: CallbackManager<GameSolutionsCallback> =
    new CallbackManager();
  nextCallbackId: number = 1;

  ensureWebWorker(): Worker {
    if (this.webWorker) {
      return this.webWorker;
    }
    this.webWorker = new Worker("/koko-rico/service-worker.js");
    this.webWorker.onmessage = this.onMessage.bind(this);
    return this.webWorker;
  }

  getNextCallbackId(): number {
    const nextCallbackId = this.nextCallbackId;
    this.nextCallbackId++;
    return nextCallbackId;
  }

  postMessage(data: any) {
    this.ensureWebWorker().postMessage(data);
  }

  onMessage(e: MessageEvent<any>) {
    if (e.data.type === "new-puzzle") {
      this.handleNewPuzzle(e.data);
    } else if (e.data.type === "solutions-filled") {
      this.handleFilledSolutions(e.data);
    } else {
      console.error(`Unknown message type: ${e.data.type}`, e.data);
    }
  }

  handleNewPuzzle(response: GameBackgroundResponse & { callbackId: number }) {
    this.callbacks.pop(response.callbackId)?.(
      response.success
        ? {
            game: Game.deserialise(response.serialised),
            gameTargets: GameTargets.deserialise(response.serialisedTargets),
          }
        : response.error,
    );
  }

  handleFilledSolutions(
    response: GameSolutionsBackgroundResponse & { callbackId: number },
  ) {
    this.fillTargetSolutionsCallbacks.pop(response.callbackId)?.(
      response.success
        ? {
            gameTargets: GameTargets.deserialise(response.serialisedTargets),
          }
        : response.error,
    );
  }

  request(request: GameBackgroundRequest, callback: GameCallback) {
    this.postMessage({
      type: "create-puzzle",
      callbackId: this.callbacks.push(callback),
      ...request,
    });
  }

  requestFillTargetSolutions(
    request: GameSolutionsBackgroundRequest,
    callback: GameSolutionsCallback,
  ) {
    this.postMessage({
      type: "fill-target-solutions",
      callbackId: this.fillTargetSolutionsCallbacks.push(callback),
      ...request,
    });
  }

  terminate() {
    if (!this.webWorker) {
      return;
    }
    this.webWorker.terminate();
    this.webWorker = null;
  }
}

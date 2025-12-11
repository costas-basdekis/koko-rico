import { Position, positionsEqual } from "../utils";
import { Game } from "./Game";
import {
  GameFormat,
  GameFormatVersion3,
  LatestGameFormat,
} from "./GameMigrations";
import {
  GameTargetsFormat,
  LatestGameTargetsFormat,
  migrate,
} from "./GameTargetsMigrations";

export class GameTargets {
  targetDistance: number;
  silverTargetDistance: number;
  bronzeTargetDistance: number;
  targetPositions: Position[];
  completedTargetPositions: Position[];
  silverTargetPositions: Position[];
  bronzeTargetPositions: Position[];

  static empty(): GameTargets {
    return new GameTargets(0, 0, 0, [], [], [], []);
  }

  static getDefaultSilverAndBronzeTargetDistances(
    targetDistance: number,
  ): [number, number] {
    const step = Math.max(1, Math.round(targetDistance * 0.2));
    return [targetDistance + step, targetDistance + step * 2];
  }

  static fromGame(game: Game): GameTargets {
    return new GameTargets(
      game.targetDistance,
      game.silverTargetDistance,
      game.bronzeTargetDistance,
      game.targetPositions,
      game.completedTargetPositions,
      game.silverTargetPositions,
      game.bronzeTargetPositions,
    );
  }

  static makeFromGame(
    game: Game,
    desiredTargetDistance: number,
    count: number | null = null,
  ): GameTargets {
    const distanceMap = game.calculateReachableMultiRobotPositions(
      game.robots[0],
      desiredTargetDistance,
    );
    const [, targetDistance] = Array.from(distanceMap.entries())
      .filter(([, distance]) => distance >= desiredTargetDistance)
      .sort(
        ([, leftDistance], [, rightDistance]) => leftDistance - rightDistance,
      )[0];
    const targetPositions = Array.from(distanceMap.entries())
      .filter(([, distance]) => distance === targetDistance)
      .map(([position]) => position);
    if (count !== null) {
      targetPositions.splice(count);
    }
    const [silverTargetDistance, bronzeTargetDistance] =
      this.getDefaultSilverAndBronzeTargetDistances(targetDistance);
    return new GameTargets(
      targetDistance,
      silverTargetDistance,
      bronzeTargetDistance,
      targetPositions,
      [],
      [],
      [],
    );
  }

  static deserialise(serialised: GameTargetsFormat): GameTargets {
    const latestVersionSerialised = migrate(serialised);
    return this.deserialiseLatestVersion(latestVersionSerialised);
  }

  static deserialiseLatestVersion({
    targetDistance,
    silverTargetDistance,
    bronzeTargetDistance,
    silverTargetPositions,
    bronzeTargetPositions,
    targetPositions,
    completedTargetPositions,
  }: LatestGameTargetsFormat): GameTargets {
    completedTargetPositions = targetPositions.filter((position) =>
      completedTargetPositions.some((completedPosition) =>
        positionsEqual(completedPosition, position),
      ),
    );
    silverTargetPositions = targetPositions.filter((position) =>
      silverTargetPositions.some((completedPosition) =>
        positionsEqual(completedPosition, position),
      ),
    );
    bronzeTargetPositions = targetPositions.filter((position) =>
      bronzeTargetPositions.some((completedPosition) =>
        positionsEqual(completedPosition, position),
      ),
    );
    return new GameTargets(
      targetDistance,
      silverTargetDistance,
      bronzeTargetDistance,
      targetPositions,
      completedTargetPositions,
      silverTargetPositions,
      bronzeTargetPositions,
    );
  }

  static deserialiseFromGameV3({
    targetDistance,
    silverTargetDistance,
    bronzeTargetDistance,
    silverTargetPositions,
    bronzeTargetPositions,
    targetPositions,
    completedTargetPositions,
  }: GameFormatVersion3): GameTargets {
    return this.deserialise({
      version: 1,
      targetDistance,
      silverTargetDistance,
      bronzeTargetDistance,
      silverTargetPositions,
      bronzeTargetPositions,
      targetPositions,
      completedTargetPositions,
    });
  }

  static deserialiseGameAndTargets(
    serialised:
      | GameFormat
      | { game: GameFormat; gameTargets: GameTargetsFormat | null },
  ): { game: Game; gameTargets: GameTargets | null; saveAgain: boolean } {
    if (!("game" in serialised)) {
      const game = Game.deserialise(serialised);
      const gameTargets =
        "version" in serialised && serialised["version"] === 3
          ? this.deserialiseFromGameV3(serialised)
          : null;
      return { game, gameTargets, saveAgain: true };
    }
    const serialisedGame = serialised["game"];
    const serialisedTargets = serialised["gameTargets"];
    return {
      game: Game.deserialise(serialisedGame),
      gameTargets: serialisedTargets
        ? this.deserialise(serialisedTargets)
        : "version" in serialisedGame && serialisedGame["version"] === 3
          ? this.deserialiseFromGameV3(serialisedGame)
          : null,
      saveAgain: false,
    };
  }

  constructor(
    targetDistance: number,
    silverTargetDistance: number,
    bronzeTargetDistance: number,
    targetPositions: Position[],
    completedTargetPositions: Position[],
    silverTargetPositions: Position[],
    bronzeTargetPositions: Position[],
  ) {
    this.targetDistance = targetDistance;
    this.silverTargetDistance = silverTargetDistance;
    this.bronzeTargetDistance = bronzeTargetDistance;
    this.targetPositions = targetPositions;
    this.completedTargetPositions = completedTargetPositions;
    this.silverTargetPositions = silverTargetPositions;
    this.bronzeTargetPositions = bronzeTargetPositions;
  }

  serialise(): LatestGameTargetsFormat {
    return {
      version: 1,
      targetDistance: this.targetDistance,
      silverTargetDistance: this.silverTargetDistance,
      bronzeTargetDistance: this.bronzeTargetDistance,
      targetPositions: this.targetPositions,
      completedTargetPositions: this.completedTargetPositions,
      silverTargetPositions: this.silverTargetPositions,
      bronzeTargetPositions: this.bronzeTargetPositions,
    };
  }

  static serialiseGameWithTargets(
    game: Game,
    gameTargets: GameTargets | null,
  ): { game: LatestGameFormat; gameTargets: LatestGameTargetsFormat | null } {
    return {
      game: game.serialise(),
      gameTargets: gameTargets ? gameTargets.serialise() : null,
    };
  }

  change({
    completedTargetPositions: completedTargets = this.completedTargetPositions,
    silverTargetPositions = this.silverTargetPositions,
    bronzeTargetPositions = this.bronzeTargetPositions,
  }: Partial<GameTargets>): GameTargets {
    return new GameTargets(
      this.targetDistance,
      this.silverTargetDistance,
      this.bronzeTargetDistance,
      this.targetPositions,
      completedTargets,
      silverTargetPositions,
      bronzeTargetPositions,
    );
  }

  updateCompletedTargetsAfterMove(game: Game): GameTargets {
    if (
      game.path.length < this.targetDistance ||
      game.path.length > this.bronzeTargetDistance
    ) {
      return this;
    }
    const { position: newPosition } = game.path[game.path.length - 1];
    const completedTargetPosition = this.targetPositions.find(
      (targetPosition) => positionsEqual(newPosition, targetPosition),
    );
    if (!completedTargetPosition) {
      return this;
    }
    if (this.completedTargetPositions.includes(completedTargetPosition)) {
      return this;
    }
    if (game.path.length === this.targetDistance) {
      const silverTargetPositions = this.silverTargetPositions.includes(
        completedTargetPosition,
      )
        ? this.silverTargetPositions.filter(
            (position) => position != completedTargetPosition,
          )
        : this.silverTargetPositions;
      const bronzeTargetPositions = this.bronzeTargetPositions.includes(
        completedTargetPosition,
      )
        ? this.bronzeTargetPositions.filter(
            (position) => position != completedTargetPosition,
          )
        : this.bronzeTargetPositions;
      return this.change({
        completedTargetPositions: [
          ...this.completedTargetPositions,
          completedTargetPosition,
        ],
        silverTargetPositions,
        bronzeTargetPositions,
      });
    } else if (game.path.length <= this.silverTargetDistance) {
      if (this.silverTargetPositions.includes(completedTargetPosition)) {
        return this;
      }
      const bronzeTargetPositions = this.bronzeTargetPositions.includes(
        completedTargetPosition,
      )
        ? this.bronzeTargetPositions.filter(
            (position) => position != completedTargetPosition,
          )
        : this.bronzeTargetPositions;
      return this.change({
        silverTargetPositions: [
          ...this.silverTargetPositions,
          completedTargetPosition,
        ],
        bronzeTargetPositions,
      });
    } else {
      if (
        this.silverTargetPositions.includes(completedTargetPosition) ||
        this.bronzeTargetPositions.includes(completedTargetPosition)
      ) {
        return this;
      }
      return this.change({
        bronzeTargetPositions: [
          ...this.bronzeTargetPositions,
          completedTargetPosition,
        ],
      });
    }
  }

  getOneTarget(): Position {
    if (
      this.targetPositions.length ===
      this.completedTargetPositions.length +
        this.silverTargetPositions.length +
        this.bronzeTargetPositions.length
    ) {
      return (
        this.bronzeTargetPositions[0] ??
        this.silverTargetPositions[0] ??
        this.completedTargetPositions[0]
      );
    }
    return this.targetPositions.find(
      (target) =>
        !(
          this.completedTargetPositions.includes(target) ||
          this.silverTargetPositions.includes(target) ||
          this.bronzeTargetPositions.includes(target)
        ),
    )!;
  }
}

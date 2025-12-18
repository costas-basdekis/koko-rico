import { MigrationManager } from "./MigrationManager";

export const LatestGameTargetsVersion = 2;
const migrationManager = new MigrationManager<
  GameTargetsFormat,
  LatestGameTargetsFormat
>(LatestGameTargetsVersion, "GameTargets");
export const migrate = migrationManager.makeMigrator();
const registerMigration = migrationManager.makeRegisterMigration();

export type GameTargetsFormat =
  | GameTargetsFormatVersion1
  | GameTargetsFormatVersion2;

export type LatestGameTargetsFormat = Omit<
  GameTargetsFormatVersion2,
  "version"
> & {
  version: typeof LatestGameTargetsVersion;
};

interface PositionV1 {
  x: number;
  y: number;
}

interface GameTargetsFormatVersion1 {
  version: 1;
  targetDistance: number;
  silverTargetDistance: number;
  bronzeTargetDistance: number;
  targetPositions: PositionV1[];
  completedTargetPositions: PositionV1[];
  silverTargetPositions: PositionV1[];
  bronzeTargetPositions: PositionV1[];
}

export interface RobotPathEntryV1 {
  previousPosition: PositionV1;
  position: PositionV1;
  robotIndex: number;
}

export type RobotPathV1 = RobotPathEntryV1[];

type GameTargetsFormatVersion2 = Omit<GameTargetsFormatVersion1, "version"> & {
  version: 2;
  completedTargetPaths: { [key: number]: RobotPathV1 | null };
};

registerMigration(
  1,
  2,
  function migrateV1ToV2(
    serialised: GameTargetsFormatVersion1,
  ): GameTargetsFormatVersion2 {
    return {
      ...serialised,
      version: 2,
      completedTargetPaths: Object.fromEntries(
        serialised.targetPositions.map((_, index) => [index, null]),
      ),
    };
  },
);

import { MigrationManager } from "./MigrationManager";

export const LatestGameTargetsVersion = 1;
const migrationManager = new MigrationManager<
  GameTargetsFormat,
  LatestGameTargetsFormat
>(LatestGameTargetsVersion, "GameTargets");
export const migrate = migrationManager.makeMigrator();
const registerMigration = migrationManager.makeRegisterMigration();

export type GameTargetsFormat = GameTargetsFormatVersion1;

export type LatestGameTargetsFormat = Omit<
  GameTargetsFormatVersion1,
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

import { MigrationManager } from "./MigrationManager";

const migrationManager = new MigrationManager<GameFormat, LatestGameFormat>(3);
export const migrate = migrationManager.makeMigrator();
const registerMigration = migrationManager.makeRegisterMigration();

export type GameFormat =
  | GameFormatVersion1
  | GameFormatVersion2
  | GameFormatVersion3;

export const LatestGameVersion = 3;
export type LatestGameFormat = GameFormatVersion3 & {
  version: typeof LatestGameVersion;
};

interface GameFormatVersion1 {
  field: {
    width: number;
    height: number;
    topWalls: [PositionV1, boolean][];
    leftWalls: [PositionV1, boolean][];
  };
  robots: {
    position: PositionV1;
    index: number;
  }[];
  initialRobots: {
    position: PositionV1;
    index: number;
  }[];
  path: RobotPathV1;
  targetDistance: number;
  targetPositions: PositionV1[];
  completedTargetPositions: PositionV1[];
}

interface PositionV1 {
  x: number;
  y: number;
}

interface RobotPathEntryV1 {
  previousPosition: PositionV1;
  position: PositionV1;
  robotIndex: number;
}

type RobotPathV1 = RobotPathEntryV1[];

type GameFormatVersion2 = GameFormatVersion1 & {
  version: 2;
};

registerMigration(
  1,
  2,
  function migrateV1ToV2(serialised: GameFormatVersion1): GameFormatVersion2 {
    return { ...serialised, version: 2 };
  },
);

type GameFormatVersion3 = Omit<GameFormatVersion2, "version"> & {
  version: 3;
  silverTargetDistance: number;
  bronzeTargetDistance: number;
  silverTargetPositions: PositionV1[];
  bronzeTargetPositions: PositionV1[];
};

function getDefaultSilverAndBronzeTargetDistancesV3(
  targetDistance: number,
): [number, number] {
  const step = Math.max(1, Math.round(targetDistance * 0.2));
  return [targetDistance + step, targetDistance + step * 2];
}

registerMigration(
  2,
  3,
  function migrateV2ToV3(serialised: GameFormatVersion2): GameFormatVersion3 {
    const [silverTargetDistance, bronzeTargetDistance] =
      getDefaultSilverAndBronzeTargetDistancesV3(serialised.targetDistance);
    return {
      ...serialised,
      version: 3,
      silverTargetDistance,
      bronzeTargetDistance,
      silverTargetPositions: [],
      bronzeTargetPositions: [],
    };
  },
);

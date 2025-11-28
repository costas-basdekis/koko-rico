interface Migration {
  sourceVersion: number;
  targetVersion: number;
  migrate: (serialised: GameFormat) => GameFormat;
}
const migrations: Migration[] = [];

function registerMigration(
  sourceVersion: number,
  targetVersion: number,
  migrate: (serialised: GameFormat) => GameFormat,
) {
  migrations.push({ sourceVersion, targetVersion, migrate });
}

export function migrate(serialised: GameFormat): LatestGameFormat {
  let version = "version" in serialised ? serialised.version : 1;
  if (version === LatestGameVersion) {
    return serialised as LatestGameFormat;
  }
  const versionHistory = [version];
  for (const { sourceVersion, targetVersion, migrate } of migrations) {
    if (version !== sourceVersion) {
      continue;
    }
    serialised = migrate(serialised);
    version = targetVersion;
    versionHistory.push(version);
    if (version === LatestGameVersion) {
      return serialised as LatestGameFormat;
    }
  }
  throw Error(
    `Could not migrate game from version ${version} to ${LatestGameVersion} (history: ${versionHistory.join(" -> ")})`,
  );
}

export type GameFormat = GameFormatVersion1 | GameFormatVersion2;

export const LatestGameVersion = 2;
export type LatestGameFormat = GameFormatVersion2 & {
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

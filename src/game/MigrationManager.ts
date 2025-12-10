export interface Migration<F extends {} | { version: number }> {
  sourceVersion: number;
  targetVersion: number;
  migrate: (serialised: any) => F;
}

export class MigrationManager<
  F extends {} | { version: number },
  LF extends F,
> {
  migrations: Migration<F>[] = [];
  latestVersion: number;

  constructor(latestMigrationVersion: number) {
    this.latestVersion = latestMigrationVersion;
  }

  registerMigration(
    sourceVersion: number,
    targetVersion: number,
    migrate: (serialised: any) => F,
  ) {
    this.migrations.push({ sourceVersion, targetVersion, migrate });
  }

  makeRegisterMigration(): (
    sourceVersion: number,
    targetVersion: number,
    migrate: (serialised: any) => F,
  ) => void {
    return this.registerMigration.bind(this);
  }

  migrate(serialised: F): LF {
    let version = "version" in serialised ? serialised.version : 1;
    if (version === this.latestVersion) {
      return serialised as LF;
    }
    const versionHistory = [version];
    for (const { sourceVersion, targetVersion, migrate } of this.migrations) {
      if (version !== sourceVersion) {
        continue;
      }
      serialised = migrate(serialised);
      version = targetVersion;
      versionHistory.push(version);
      if (version === this.latestVersion) {
        return serialised as LF;
      }
    }
    throw Error(
      `Could not migrate game from version ${version} to ${this.latestVersion} (history: ${versionHistory.join(" -> ")})`,
    );
  }

  makeMigrator(): (serialised: F) => LF {
    return this.migrate.bind(this);
  }
}

import { Position, PositionMap } from "../utils";
import { RobotPath, RobotPathEntry, RobotPathEntryMap } from "./Game";

export class SolutionBuilder {
  entryMap: RobotPathEntryMap<RobotPathEntry | null> = new RobotPathEntryMap();
  positionMap: PositionMap<RobotPathEntry> = new PositionMap();

  addPosition(entry: RobotPathEntry, previous: RobotPathEntry | null) {
    this.entryMap.setNew(entry, previous);
    if (entry.robotIndex === 0) {
      this.positionMap.setNew(entry.position, entry);
    }
  }

  getSolutionFor(position: Position): RobotPath | null {
    let entry = this.positionMap.get(position);
    if (!entry) {
      return null;
    }
    const path: RobotPath = [];
    while (entry) {
      path.unshift(entry);
      entry = this.entryMap.get(entry)!;
    }
    return path;
  }
}

import _ from "underscore";
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

  fillTargetSolutions(
    targetPositions: Position[],
    solutions: (RobotPath | null)[],
  ) {
    for (const index of _.range(targetPositions.length)) {
      const targetPosition = targetPositions[index];
      if (solutions[index]) {
        continue;
      }
      solutions[index] = this.getSolutionFor(targetPosition);
    }
  }
}

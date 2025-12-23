import _ from "underscore";
import { Position, PositionMap, PositionsMap } from "../utils";
import { RobotPath, RobotPathEntry } from "./Game";

export class SolutionBuilder {
  positionsAndEntryMap: PositionsMap<[Position[], RobotPathEntry]> =
    new PositionsMap();
  positionMap: PositionMap<Position[]> = new PositionMap();

  addPosition(
    positions: Position[],
    previousPositions: Position[],
    entry: RobotPathEntry,
  ) {
    this.positionsAndEntryMap.setNew(positions, [previousPositions, entry]);
    if (entry.robotIndex === 0) {
      this.positionMap.setNew(entry.position, positions);
    }
  }

  getSolutionFor(position: Position): RobotPath | null {
    const initialPositions: Position[] | undefined =
      this.positionMap.get(position);
    if (!initialPositions) {
      return null;
    }
    const path: RobotPath = [];
    let positionsAndEntry = this.positionsAndEntryMap.get(initialPositions);
    while (positionsAndEntry) {
      const [positions, entry] = positionsAndEntry;
      path.unshift(entry);
      positionsAndEntry = this.positionsAndEntryMap.get(positions);
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

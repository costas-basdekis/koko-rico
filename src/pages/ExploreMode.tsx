import _ from "underscore";
import { useCallback, useMemo, useState } from "react";
import { Game, WallType, Robot } from "../game";
import { DGame } from "../components";
import { Position, PositionMap, positionsEqual } from "../utils";
import { SvgContainer } from "../SvgContainer";

export default function ExploreMode() {
  const [game, setGame]: [Game, any] = useState(() =>
    Game.makeForSizeAndRobots(21, 21, [{ x: 10, y: 10 }])
  );
  const onGhostWallClick = useCallback(
    (position: Position, type: WallType) => {
      const newGame = game.toggleWall(position, type);
      setGame(newGame);
    },
    [game]
  );
  const onRobotResetClick = useCallback(() => {
    setGame(game.resetRobots([{ x: 10, y: 10 }]));
  }, [game, setGame]);
  const onUndoRobotMove = useCallback(() => {
    setGame(game.undoMoveRobot());
  }, [game, setGame]);
  const onRandomWallsClick = useCallback(() => {
    setGame(game.pickRandomWalls(20));
  }, [game]);
  const onRandomCrossedWallsClick = useCallback(() => {
    setGame(game.pickRandomCrossedWalls(30));
  }, [game]);
  const [distanceMap, setDistanceMap] = useState<PositionMap<number> | null>(null);
  const onDistanceMapChange = useCallback((newDistanceMap: PositionMap<number> | null) => {
    setDistanceMap(newDistanceMap);
  }, [setDistanceMap]);
  const maxDistance = useMemo(() => {
    if (!distanceMap) {
      return null;
    }
    return Math.max(...distanceMap.values());
  }, [distanceMap]);
  const onRobotMoveClick = useCallback((robot: Robot, nextPosition: Position, isUndo: boolean) => {
    setGame(game.moveRobot(robot, nextPosition, isUndo));
  }, [game, setGame]);
  const onRobotCountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const robotCount = parseInt(e.target.value, 10);
    if (robotCount < game.robots.length) {
      setGame(game.removeRobots(game.robots.length - robotCount));
    } else if (robotCount > game.robots.length) {
      const newPositions: Position[] = [];
      for (let i = game.robots.length; i < robotCount; i++) {
        const position = {x: 10, y: 10};
        while (game.robots.some(robot => positionsEqual(robot.position, position))) {
          position.x = Math.floor(Math.random() * game.field.width);
          position.y = Math.floor(Math.random() * game.field.height);
        }
        newPositions.push(position);
      }
      setGame(game.addRobots(newPositions));
    }
  }, [game, setGame]);
  return (
    <>
      <div>
        <button onClick={onRobotResetClick}>Reset robot</button>
        <button onClick={onUndoRobotMove} disabled={!game.path.length}>Undo move</button>
        <button onClick={onRandomWallsClick}>Randomly pick 20 walls</button>
        <button onClick={onRandomCrossedWallsClick}>Randomly pick 30 crossed walls</button>
        <label><input type={"radio"} value={"1"} onChange={onRobotCountChange} checked={game.robots.length === 1} />1 robot</label>
        <label><input type={"radio"} value={"2"} onChange={onRobotCountChange} checked={game.robots.length === 2} />2 robots</label>
        <label><input type={"radio"} value={"3"} onChange={onRobotCountChange} checked={game.robots.length === 3} />3 robots</label>
        {maxDistance !== null ? <div>Max distance: {maxDistance}</div> : null}
      </div>
      <SvgContainer gridWidth={game.field.width} gridHeight={game.field.height} ensureFitsInWindow >
        <DGame
          game={game}
          showDistances
          showGhostWalls
          onGhostWallClick={onGhostWallClick}
          onDistanceMapChange={onDistanceMapChange}
          showRobotControls
          onRobotMoveClick={onRobotMoveClick}
        />
      </SvgContainer>
    </>
  );
}

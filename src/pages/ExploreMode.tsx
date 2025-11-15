import _ from "underscore";
import { useCallback, useMemo, useState } from "react";
import { Game, WallType, Robot } from "../game";
import { DGame, DrawSettings } from "../components";
import { Position, PositionMap } from "../utils";
import { SvgContainer } from "../SvgContainer";

export default function ExploreMode() {
  const [game, setGame]: [Game, any] = useState(
    Game.makeForSizeAndRobots(21, 21, [{ x: 10, y: 10 }])
  );
  const [robotPath, setRobotPath] = useState<[Position, Position][]>([]);
  const [drawSettings] = useState(new DrawSettings());
  const onGhostWallClick = useCallback(
    (position: Position, type: WallType) => {
      const newGame = game.toggleWall(position, type);
      setGame(newGame);
    },
    [game]
  );
  const onRobotResetClick = useCallback(() => {
    setGame(game.moveRobot(game.robots[0], { x: 10, y: 10 }));
    setRobotPath([]);
  }, [game, setGame, setRobotPath]);
  const onUndoRobotMove = useCallback(() => {
    if (!robotPath.length) {
      return;
    }
    setGame(game.moveRobot(game.robots[0], robotPath[robotPath.length - 1][0]));
    setRobotPath(robotPath.slice(0, robotPath.length - 1));
  }, [game, setGame, robotPath, setRobotPath]);
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
  const onRobotMoveClick = useCallback((robot: Robot, nextPosition: Position) => {
    setGame(game.moveRobot(robot, nextPosition));
    setRobotPath([...robotPath, [robot.position, nextPosition]]);
  }, [game, setGame, robotPath, setRobotPath]);
  return (
    <>
      <div>
        <button onClick={onRobotResetClick}>Reset robot</button>
        <button onClick={onUndoRobotMove} disabled={!robotPath.length}>Undo move</button>
        <button onClick={onRandomWallsClick}>Randomly pick 20 walls</button>
        <button onClick={onRandomCrossedWallsClick}>Randomly pick 30 crossed walls</button>
        {maxDistance !== null ? <div>Max distance: {maxDistance}</div> : null}
      </div>
      <SvgContainer>
        <DrawSettings.ContextProvider value={drawSettings}>
          <DGame
            game={game}
            robotPath={robotPath}
            showDistances
            showGhostWalls
            onGhostWallClick={onGhostWallClick}
            onDistanceMapChange={onDistanceMapChange}
            showRobotControls
            onRobotMoveClick={onRobotMoveClick}
          />
        </DrawSettings.ContextProvider>
      </SvgContainer>
    </>
  );
}

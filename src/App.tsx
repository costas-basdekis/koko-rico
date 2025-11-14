import "./styles.css";
import _ from "underscore";
import { useCallback, useMemo, useState } from "react";
import { Game, Field, WallType } from "./game";
import { DGame, DrawSettings } from "./components";
import { Position, PositionMap } from "./utils";

export default function App() {
  const [game, setGame]: [Game, any] = useState(
    Game.makeForSizeAndRobots(21, 21, [{ x: 10, y: 10 }])
  );
  const [drawSettings] = useState(new DrawSettings());
  const onGhostWallClick = useCallback(
    (position: Position, type: WallType) => {
      const newGame = game.toggleWall(position, type);
      setGame(newGame);
    },
    [game]
  );
  const onRandomWallsClick = useCallback(() => {
    const newField = pickRandomWalls(game.field, 20);
    setGame(game.change({ field: newField }));
  }, [game]);
  const onRandomCrossedWallsClick = useCallback(() => {
    const newField = pickRandomCrossedWalls(game, 30);
    setGame(game.change({ field: newField }));
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
  return (
    <div className="App">
      <h1>Koko Rico</h1>
      <div>
        <button onClick={onRandomWallsClick}>Randomly pick 20 walls</button>
        <button onClick={onRandomCrossedWallsClick}>Randomly pick 30 crossed walls</button>
        {maxDistance !== null ? <div>Max distance: {maxDistance}</div> : null}
      </div>
      <svg width={1000} height={1000}>
        <DrawSettings.ContextProvider value={drawSettings}>
          <DGame
            game={game}
            showDistances
            onGhostWallClick={onGhostWallClick}
            onDistanceMapChange={onDistanceMapChange}
          />
        </DrawSettings.ContextProvider>
      </svg>
    </div>
  );
}

function pickRandomWalls(field: Field, count: number): Field {
  const newField = Field.makeForSize(field.width, field.height);
  const position = { x: 0, y: 0 };
  for (const _i of _.range(count)) {
    while (true) {
      const type = ["left", "top"][_.random(0, 1)] as WallType;
      if (type === "left") {
        position.x = _.random(1, field.width - 1);
        position.y = _.random(0, field.width - 1);
        console.log(type, position);
        if (newField.leftWalls.get(position)) {
          continue;
        }
        newField.leftWalls.set(position, true);
        break;
      } else {
        position.x = _.random(0, field.width - 1);
        position.y = _.random(1, field.width - 1);
        console.log(type, position);
        if (newField.topWalls.get(position)) {
          continue;
        }
        newField.topWalls.set(position, true);
        break;
      }
    }
  }
  return newField;
}

function pickRandomCrossedWalls(game: Game, count: number): Field {
  let newGame = game.change({field: Field.makeForSize(game.field.width, game.field.height)});
  for (const _i of _.range(count)) {
    const leftWallsCrossed = new PositionMap<boolean>();
    const topWallsCrossed = new PositionMap<boolean>();
    newGame.calculateReachableRobotPositions(newGame.robots[0], leftWallsCrossed, topWallsCrossed);
    const wallsCrossed: [WallType, Position][] = [
      ...Array.from(leftWallsCrossed.entries()).filter(([, contains]) => contains).map(([position]) => ["left", position] as [WallType, Position]),
      ...Array.from(topWallsCrossed.entries()).filter(([, contains]) => contains).map(([position]) => ["top", position] as [WallType, Position]),
    ];
    if (!wallsCrossed.length) {
      break;
    }
    const [wallType, position] = wallsCrossed[_.random(0, wallsCrossed.length - 1)];
    newGame = newGame.toggleWall(position, wallType);
  }
  return newGame.field;
}

import "./styles.css";
import _ from "underscore";
import { useCallback, useState } from "react";
import { Game, Field, WallType } from "./game";
import { DGame, DrawSettings } from "./components";
import { Position } from "./utils";

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
    const newField = Field.makeForSize(game.field.width, game.field.height);
    const position = { x: 0, y: 0 };
    for (const _i of _.range(20)) {
      while (true) {
        const type = ["left", "top"][_.random(0, 1)] as "left" | "top";
        if (type === "left") {
          position.x = _.random(1, game.field.width - 1);
          position.y = _.random(0, game.field.width - 1);
          console.log(type, position);
          if (newField.leftWalls.get(position)) {
            continue;
          }
          newField.leftWalls.set(position, true);
          break;
        } else {
          position.x = _.random(0, game.field.width - 1);
          position.y = _.random(1, game.field.width - 1);
          console.log(type, position);
          if (newField.topWalls.get(position)) {
            continue;
          }
          newField.topWalls.set(position, true);
          break;
        }
      }
    }
    setGame(game.change({ field: newField }));
  }, [game]);
  return (
    <div className="App">
      <h1>Koko Rico</h1>
      <div>
        <button onClick={onRandomWallsClick}>Randomly pick 20 walls</button>
      </div>
      <svg width={1000} height={1000}>
        <DrawSettings.ContextProvider value={drawSettings}>
          <DGame
            game={game}
            showDistances
            onGhostWallClick={onGhostWallClick}
          />
        </DrawSettings.ContextProvider>
      </svg>
    </div>
  );
}

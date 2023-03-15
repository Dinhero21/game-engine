import { MultiplayerContainerEntity } from './entities/multiplayer-container.js'
import { TileMapEntity } from '../engine/entities/tilemap.js'
import Entity from '../engine/entities/base.js'
import Game from '../engine/game.js'
import Vec2 from '../engine/util/vec2.js'

export default function createGame (context: CanvasRenderingContext2D): Game {
  const canvas = context.canvas

  const game = new Game(context)

  const root = new Entity()
  game.setRoot(root)

  const tileMap = new TileMapEntity()
  root.addChild(tileMap)

  for (let x = 0; x < canvas.width / 32; x++) {
    for (let y = 0; y < canvas.height / 32; y++) {
      const id = x ^ y

      tileMap.setTile(new Vec2(x, y), id)
    }
  }

  const multiplayerContainer = new MultiplayerContainerEntity()
  root.addChild(multiplayerContainer)

  return game
}

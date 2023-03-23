import { MultiplayerContainerEntity } from './entities/multiplayer-container.js'
import { TileMapEntity } from '../engine/entities/tilemap.js'
import Scene from '../engine/scene.js'
import Vec2 from '../engine/util/vec2.js'
// import PlayerEntity from './entities/player.js'
import io from '../socket.io/socket.io.esm.min.js'

export default function createScene (context: CanvasRenderingContext2D): Scene {
  const socket = io()

  const scene = new Scene(context)

  const tileMap = new TileMapEntity()
  scene.addChild(tileMap)

  socket.on('tile.set', (tile, rawTilePosition) => {
    const tilePosition = new Vec2(rawTilePosition[0], rawTilePosition[1])

    tileMap.setTile(tile, tilePosition)
  })

  const multiplayerContainer = new MultiplayerContainerEntity(socket)
  scene.addChild(multiplayerContainer)

  return scene
}

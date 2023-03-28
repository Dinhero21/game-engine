import type { IClientSocket as Socket } from '../../socket.io.js'
import { CHUNK_SIZE } from '../engine/util/tilemap/position-conversion.js'
import { MultiplayerContainerEntity } from './entities/multiplayer-container.js'
import { TileMapEntity } from '../engine/entities/tilemap.js'
import { Chunk } from '../engine/util/tilemap/chunk.js'
import { textureLoader } from '../assets/loader.js'
import Vec2, { stringToVec2 } from '../engine/util/vec2.js'
import Scene from '../engine/scene.js'
import io from '../socket.io/socket.io.esm.min.js'
import MultiRectangularCollider from '../engine/util/collision/multi-rectangular.js'
import RectangularCollider from '../engine/util/collision/rectangular.js'

const chunkSize = new Vec2(CHUNK_SIZE, CHUNK_SIZE)

export default function createScene (context: CanvasRenderingContext2D): Scene {
  const socket: Socket = io()

  const scene = new Scene(context)

  const tileMap = new TileMapEntity((context, tile) => {
    const position = tile.position
    const size = tile.size
    const id = tile.id

    const texture = textureLoader.loadTexture(id)

    context.drawImage(texture, position.x, position.y, size.x, size.y)
  })

  textureLoader.addEventListener('load', event => {
    tileMap.clearCache()
  })

  scene.addChild(tileMap)

  socket.on('chunk.set', (rawChunk, rawChunkPosition) => {
    const chunkPosition = new Vec2(rawChunkPosition[0], rawChunkPosition[1])

    const chunk = new Chunk(chunkPosition, chunkSize)

    for (const [tileId, tile] of rawChunk) {
      const tilePosition = stringToVec2(tileId)

      chunk.setTile(tile, tilePosition)
    }

    tileMap.setChunk(chunk, chunkPosition)
  })

  const multiplayerContainer = new MultiplayerContainerEntity(socket)
  scene.addChild(multiplayerContainer)

  const collider = new MultiRectangularCollider([
    new RectangularCollider(new Vec2(-50, 100), new Vec2(100, 100))
  ])

  multiplayerContainer.setCollider(collider)

  return scene
}

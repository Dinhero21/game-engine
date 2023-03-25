import type { IClientSocket as Socket } from '../../socket.io.js'
import { CHUNK_SIZE } from '../engine/util/tilemap/position-conversion.js'
import { MultiplayerContainerEntity } from './entities/multiplayer-container.js'
import { TileMapEntity } from '../engine/entities/tilemap.js'
import { Chunk } from '../engine/util/tilemap/chunk.js'
import Vec2, { stringToVec2 } from '../engine/util/vec2.js'
import Scene from '../engine/scene.js'
import io from '../socket.io/socket.io.esm.min.js'

const chunkSize = new Vec2(CHUNK_SIZE, CHUNK_SIZE)

export default function createScene (context: CanvasRenderingContext2D): Scene {
  const socket: Socket = io()

  const scene = new Scene(context)

  const tileMap = new TileMapEntity((frame, tile) => {
    const position = tile.position
    const size = tile.size
    const id = tile.id

    const tilePosition = position.divided(size)

    frame.drawRectRGBA(
      position.x,
      position.y,
      size.x,
      size.y,
      ((id >> 0) % 2) << 8,
      ((id >> 1) % 2) << 8,
      ((id >> 2) % 2) << 8,
      (tilePosition.x ^ tilePosition.y) % 2 === 0 ? 0.45 : 0.55
    )
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

  return scene
}

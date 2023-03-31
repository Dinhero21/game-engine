import type { IClientSocket as Socket } from '../../socket.io.js'
import { CHUNK_SIZE, positionToTilePosition, tilePositionToChunkPosition, TILE_SIZE } from '../engine/util/tilemap/position-conversion.js'
import { MultiplayerContainerEntity } from './entities/multiplayer-container.js'
import { TileMapEntity } from '../engine/entities/tilemap.js'
import { Chunk } from '../engine/util/tilemap/chunk.js'
import { loader } from '../assets/loader.js'
import Vec2, { stringToVec2 } from '../engine/util/vec2.js'
import Scene from '../engine/scene.js'
import io from '../socket.io/socket.io.esm.min.js'
import Loop from '../engine/util/loop.js'
import Tile from '../engine/util/tilemap/tile.js'

const chunkSize = new Vec2(CHUNK_SIZE, CHUNK_SIZE)

export default function createScene (context: CanvasRenderingContext2D): Scene {
  const socket: Socket = io()

  const scene = new Scene(context)
  const camera = scene.camera

  const tileMap = new TileMapEntity()

  loader.addEventListener('load', event => {
    tileMap.clearCache()
  })

  socket.on('chunk.set', async (rawChunk, rawChunkPosition) => {
    const chunkPosition = new Vec2(rawChunkPosition[0], rawChunkPosition[1])

    const chunk = new Chunk<Tile>(chunkPosition, chunkSize)

    for (const [tileId, tileName] of rawChunk) {
      const tilePosition = stringToVec2(tileId)

      const tileData = await loader.getTileData(tileName)

      const tile = new Tile(tileName, tileData.collidable, (context, data) => {
        const name = tile.name
        const position = data.position
        const size = data.size

        const texture = loader.getTexture(name)

        context.drawImage(texture, position.x, position.y, size.x, size.y)
      })

      chunk.setTile(tile, tilePosition)
    }

    tileMap.setChunk(chunk, chunkPosition)
  })

  Loop.interval(1000 / 12)(() => {
    const chunks = tileMap.getChunks()

    const viewport = camera.getViewport()

    for (const chunk of chunks) {
      const boundingBox = chunk.boundingBox

      if (boundingBox.distance(viewport) < TILE_SIZE * CHUNK_SIZE) continue

      const position = boundingBox.getPosition()
      const tilePosition = positionToTilePosition(position)
      const chunkPosition = tilePositionToChunkPosition(tilePosition)

      socket.emit('chunk.remove', chunkPosition.toArray())

      tileMap.removeChunk(chunkPosition)
    }
  })

  scene.addChild(tileMap)

  const multiplayerContainer = new MultiplayerContainerEntity(socket)
  scene.addChild(multiplayerContainer)

  multiplayerContainer.setOverlapDetector(other => tileMap.overlapping(other))

  return scene
}

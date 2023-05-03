import { type IClientSocket as Socket } from '../../../socket.io.js'
import type Tile from '../../engine/util/tilemap/tile.js'
import { TILE_SIZE, CHUNK_SIZE, positionToTilePosition, tilePositionToChunkPosition } from '../../engine/util/tilemap/position-conversion.js'
import { createTile } from '../tile.js'
import { Chunk } from '../../engine/util/tilemap/chunk.js'
import { loader } from '../../assets/loader.js'
import Vec2, { stringToVec2 } from '../../engine/util/vec2.js'
import TileMapEntity from '../../engine/entities/tilemap.js'
import Loop from '../../engine/util/loop.js'

const chunkSize = new Vec2(CHUNK_SIZE, CHUNK_SIZE)

export class WorldEntity extends TileMapEntity<Tile> {
  private readonly socket

  constructor (socket: Socket) {
    super()

    this.socket = socket
  }

  public ready (): void {
    const socket = this.socket

    socket.on('chunk.set', async (rawChunk, rawChunkPosition) => {
      const chunkPosition = new Vec2(...rawChunkPosition)

      const chunk = new Chunk<Tile>(chunkPosition, chunkSize)

      for (const [tileId, tileName] of rawChunk) {
        const tilePosition = stringToVec2(tileId)

        const tile = await createTile(tileName)

        chunk.setTile(tile, tilePosition)
      }

      this.setChunk(chunk, chunkPosition)
    })

    socket.on('tile.set', async (name, rawTilePosition) => {
      const tilePosition = new Vec2(...rawTilePosition)

      const tile = await createTile(name)

      this.setTile(tile, tilePosition)
    })

    loader.addEventListener('load', () => {
      this.clearCache()
    })

    const scene = this.getScene()

    if (scene === undefined) return

    const camera = scene.camera

    Loop.interval(1000 / 12)(() => {
      const chunks = this.getChunks()

      const viewport = camera.getViewport()

      for (const chunk of chunks) {
        const boundingBox = chunk.boundingBox

        if (boundingBox.distance(viewport) < TILE_SIZE * CHUNK_SIZE) continue

        const position = boundingBox.getPosition()
        const tilePosition = positionToTilePosition(position)
        const chunkPosition = tilePositionToChunkPosition(tilePosition)

        socket.emit('chunk.remove', chunkPosition.toArray())

        this.removeChunk(chunkPosition)
      }
    })
  }
}

export default WorldEntity

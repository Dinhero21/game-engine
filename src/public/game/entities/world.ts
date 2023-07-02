import { type IClientSocket as Socket } from '../../../socket.io.js'
import type Tile from '../../engine/util/tilemap/tile.js'
import { TILE_SIZE, CHUNK_SIZE, positionToTilePosition, tilePositionToChunkPosition, chunkPositionToTilePosition } from '../../engine/util/tilemap/position-conversion.js'
import { createTile } from '../tile.js'
import { loader } from '../../assets/loader.js'
import Vec2, { stringToVec2 } from '../../engine/util/vec2.js'
import TileMapEntity from '../../engine/entities/tilemap.js'
import Loop from '../../engine/util/loop.js'

export class WorldEntity extends TileMapEntity<Tile> {
  private readonly socket

  constructor (socket: Socket) {
    super()

    this.socket = socket
  }

  public ready (): void {
    const socket = this.socket

    socket.on('chunk.set', async (rawChunk, rawChunkPosition) => {
      const chunkChunkPosition = new Vec2(...rawChunkPosition)
      const chunkTilePosition = chunkPositionToTilePosition(chunkChunkPosition)

      for (const [tileId, tileType] of rawChunk) {
        const relativeTileTilePosition = stringToVec2(tileId)

        const tileTilePosition = relativeTileTilePosition.plus(chunkTilePosition)

        const tile = await createTile(tileType)

        this.setTile(tile, tileTilePosition)
      }
    })

    socket.on('tile.set', async (rawTilePosition, type) => {
      const tilePosition = new Vec2(...rawTilePosition)

      const tile = await createTile(type)

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

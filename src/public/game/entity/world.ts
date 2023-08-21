import type Tile from '../../engine/util/tilemap/tile'
import { type IClientSocket as Socket } from '../../../socket.io'
import { TILE_SIZE, CHUNK_SIZE, positionToTilePosition, tilePositionToChunkPosition } from '../../engine/util/tilemap/position-conversion'
import { createTile } from '../tile'
import { loader } from '../../asset/loader'
import Vec2 from '../../engine/util/vec2'
import TileMapEntity from '../../engine/entity/tilemap'
import Loop from '../../engine/util/loop'

export class WorldEntity extends TileMapEntity<Tile> {
  private readonly socket

  constructor (socket: Socket) {
    super()

    this.socket = socket
  }

  public ready (): void {
    const socket = this.socket

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
      const viewport = camera.getViewport()

      for (const row of this.getChunks().values()) {
        for (const chunk of row.values()) {
          const boundingBox = chunk.boundingBox

          if (boundingBox.distance(viewport) < TILE_SIZE * CHUNK_SIZE) continue

          const position = boundingBox.getPosition()
          const tilePosition = positionToTilePosition(position)
          const chunkPosition = tilePositionToChunkPosition(tilePosition)

          socket.emit('chunk.remove', chunkPosition.toArray())

          this.removeChunk(chunkPosition)
        }
      }
    })
  }
}

export default WorldEntity

import type Tile from '../../engine/util/tilemap/tile'
import { type IClientSocket as Socket } from '../../../socket.io'
import { TILE_SIZE, CHUNK_SIZE, positionToTilePosition, tilePositionToChunkPosition } from '../../engine/util/tilemap/position-conversion'
import { createTile } from '../util/tile'
import { loader } from '../../asset/loader'
import Vec2 from '../../engine/util/vec2'
import TileMapEntity from '../../engine/entity/tilemap'
import { watch } from '../../engine/util/object'
import { Experiments } from '../../globals'

export class WorldEntity extends TileMapEntity<Tile> {
  private readonly socket

  constructor (socket: Socket) {
    super()

    this.socket = socket
  }

  public ready (): void {
    const socket = this.socket

    socket.on('chunk.set', (rawChunkPosition, tiles) => {
      const chunkPosition = new Vec2(...rawChunkPosition)

      const chunk = this._createChunk(chunkPosition)

      for (let y = 0; y < CHUNK_SIZE; y++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
          void (async () => {
            const rawTile = tiles.shift()

            if (rawTile === undefined) return
            if (rawTile === null) return

            const [type, properties] = rawTile

            const tile = await createTile(type, properties)

            chunk.setTile(tile, x, y)
          })()
        }
      }

      this.setChunk(chunk, chunkPosition.x, chunkPosition.y)
    })

    socket.on('tile.set', async (rawTilePosition, type, meta) => {
      const tilePosition = new Vec2(...rawTilePosition)

      const oldTile = this.getTile(tilePosition)

      if (oldTile !== undefined && oldTile.type === type && oldTile.meta === meta) return

      const tile = await createTile(type, meta)

      this.setTile(tile, tilePosition)
    })

    loader.addEventListener('load', () => {
      this.clearCache()
    })

    watch(Experiments, 'cursed_water', {
      set: () => {
        this.clearCache()
      }
    })
  }

  private lastViewportTopLeftChunkPosition = new Vec2(NaN, NaN)
  private lastViewportBottomRightChunkPosition = new Vec2(NaN, NaN)

  public update (delta: number): void {
    super.update(delta)

    const scene = this.getScene()

    if (scene === undefined) return

    const camera = scene.camera

    const viewport = camera.getViewport()

    const viewportTopLeftPosition = viewport.getPosition()

    const viewportSize = viewport.getSize()

    const viewportBottomRightPosition = viewportTopLeftPosition.plus(viewportSize)

    const viewportTopLeftTilePosition = positionToTilePosition(viewportTopLeftPosition)
    const viewportBottomRightTilePosition = positionToTilePosition(viewportBottomRightPosition)

    const viewportTopLeftChunkPosition = tilePositionToChunkPosition(viewportTopLeftTilePosition)
    const viewportBottomRightChunkPosition = tilePositionToChunkPosition(viewportBottomRightTilePosition)

    const viewportTopLeftChunkPositionChanged = viewportTopLeftChunkPosition.x !== this.lastViewportTopLeftChunkPosition.x || viewportTopLeftChunkPosition.y !== this.lastViewportTopLeftChunkPosition.y
    const viewportBottomRightChunkPositionChanged = viewportBottomRightChunkPosition.x !== this.lastViewportBottomRightChunkPosition.x || viewportBottomRightChunkPosition.y !== this.lastViewportBottomRightChunkPosition.y

    this.lastViewportTopLeftChunkPosition = viewportTopLeftChunkPosition
    this.lastViewportBottomRightChunkPosition = viewportBottomRightChunkPosition

    if (!viewportTopLeftChunkPositionChanged && !viewportBottomRightChunkPositionChanged) return

    const socket = this.socket

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
  }
}

export default WorldEntity

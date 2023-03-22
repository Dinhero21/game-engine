import { type Tile, Chunk } from '../util/tilemap/chunk.js'
import type Frame from '../util/frame.js'
import Vec2, { stringToVec2, vec2ToString } from '../util/vec2.js'
import Entity from './base.js'

const TILE_SIZE = 32
const CHUNK_SIZE = 16

export class TileMapEntity extends Entity {
  protected chunks = new Map<string, Chunk>()

  public draw (frame: Frame): void {
    super.draw(frame)

    // const screenBoundingBox = this.getScreenBoundingBox()

    // if (screenBoundingBox === undefined) return

    for (const [chunkId, chunk] of this.chunks) {
      const chunkChunkPosition = stringToVec2(chunkId)
      const chunkTilePosition = this.chunkPositionToTilePosition(chunkChunkPosition)

      // if (!chunk.overlapping(screenBoundingBox)) continue

      for (const [tileId, tile] of chunk.tiles) {
        const id = tile.id

        const relativeTileTilePosition = stringToVec2(tileId)
        const tileTilePosition = relativeTileTilePosition.add(chunkTilePosition)

        const tilePosition = this.tilePositionToPosition(tileTilePosition)

        frame.drawRectRGBA(
          tilePosition.x,
          tilePosition.y,
          TILE_SIZE,
          TILE_SIZE,
          id % 2 === 0 ? 0x10 : 0x20,
          id % 2 === 0 ? 0x10 : 0x20,
          id % 2 === 0 ? 0x10 : 0x20
        )
      }
    }
  }

  protected positionToTilePosition (position: Vec2): Vec2 {
    return position
      .divided(TILE_SIZE)
      .floored()
  }

  protected tilePositionToPosition (tilePosition: Vec2): Vec2 {
    return tilePosition.scaled(TILE_SIZE)
  }

  protected tilePositionToChunkPosition (tilePosition: Vec2): Vec2 {
    return tilePosition
      .divided(CHUNK_SIZE)
      .floored()
  }

  protected chunkPositionToTilePosition (chunkPosition: Vec2): Vec2 {
    return chunkPosition.scaled(CHUNK_SIZE)
  }

  public setTile (tile: Tile, tilePosition: Vec2): void {
    const chunkChunkPosition = this.tilePositionToChunkPosition(tilePosition)
    const chunkTilePosition = this.chunkPositionToTilePosition(chunkChunkPosition)

    tilePosition = tilePosition
      .minus(chunkTilePosition)

    const chunkId = vec2ToString(chunkChunkPosition)
    let chunk = this.chunks.get(chunkId)

    if (chunk === undefined) {
      chunk = new Chunk(chunkChunkPosition, new Vec2(16, 16))
      this.chunks.set(chunkId, chunk)
    }

    chunk.setTile(tile, tilePosition)
  }

  public setChunk (chunk: Chunk, chunkPosition: Vec2): void {
    const chunkId = vec2ToString(chunkPosition)

    this.chunks.set(chunkId, chunk)
  }
}

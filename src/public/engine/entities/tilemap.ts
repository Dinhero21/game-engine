import { type Tile, Chunk } from '../util/tilemap/chunk.js'
import type Frame from '../util/frame.js'
import Vec2, { stringToVec2, vec2ToString } from '../util/vec2.js'
import Entity from './base.js'
import { TILE_SIZE, CHUNK_SIZE, tilePositionToPosition, tilePositionToChunkPosition, chunkPositionToTilePosition } from '../util/tilemap/position-conversion.js'

export class TileMapEntity extends Entity {
  protected chunks = new Map<string, Chunk>()

  public draw (frame: Frame): void {
    super.draw(frame)

    const scene = this.getScene()

    if (scene === undefined) return

    const camera = scene.camera
    const viewport = camera.getViewport()

    for (const [chunkId, chunk] of this.chunks) {
      const chunkChunkPosition = stringToVec2(chunkId)
      const chunkTilePosition = chunkPositionToTilePosition(chunkChunkPosition)

      if (!chunk.boundingBox.overlapping(viewport)) continue

      for (const [tileId, tile] of chunk.tiles) {
        const id = tile.id

        const relativeTileTilePosition = stringToVec2(tileId)
        const tileTilePosition = relativeTileTilePosition.add(chunkTilePosition)

        const tilePosition = tilePositionToPosition(tileTilePosition)

        frame.drawRectRGBA(
          tilePosition.x,
          tilePosition.y,
          TILE_SIZE,
          TILE_SIZE,
          (id % 1) * 256,
          (id % 1) * 256,
          (id % 1) * 256
        )
      }
    }
  }

  public setTile (tile: Tile, tilePosition: Vec2): void {
    const chunkChunkPosition = tilePositionToChunkPosition(tilePosition)
    const chunkTilePosition = chunkPositionToTilePosition(chunkChunkPosition)

    const chunkTileSize = new Vec2(CHUNK_SIZE, CHUNK_SIZE)
    const chunkPositionSize = chunkPositionToTilePosition(chunkTileSize)

    tilePosition = tilePosition
      .minus(chunkTilePosition)

    const chunkId = vec2ToString(chunkChunkPosition)
    let chunk = this.chunks.get(chunkId)

    if (chunk === undefined) {
      chunk = new Chunk(chunkChunkPosition, chunkPositionSize)
      this.chunks.set(chunkId, chunk)
    }

    chunk.setTile(tile, tilePosition)
  }

  public setChunk (chunk: Chunk, chunkPosition: Vec2): void {
    const chunkId = vec2ToString(chunkPosition)

    this.chunks.set(chunkId, chunk)
  }
}

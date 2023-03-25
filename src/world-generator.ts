import { type Tile } from './public/engine/util/tilemap/chunk.js'
import { chunkPositionToTilePosition, CHUNK_SIZE } from './public/engine/util/tilemap/position-conversion.js'
import Vec2, { vec2ToString } from './public/engine/util/vec2.js'

export type Chunk = Map<string, Tile>

export class WorldGenerator {
  private readonly chunks = new Map<string, Chunk>()

  public getChunk (chunkPosition: Vec2): Chunk {
    const chunkId = vec2ToString(chunkPosition)

    const chunk = this.chunks.get(chunkId)

    if (chunk !== undefined) return chunk

    return this.generateChunk(chunkPosition)
  }

  public generateChunk (chunkChunkPosition: Vec2): Chunk {
    const chunk: Chunk = new Map()

    const chunkTilePosition = chunkPositionToTilePosition(chunkChunkPosition)

    for (let chunkTileTilePositionY = 0; chunkTileTilePositionY < CHUNK_SIZE; chunkTileTilePositionY++) {
      for (let chunkTileTilePositionX = 0; chunkTileTilePositionX < CHUNK_SIZE; chunkTileTilePositionX++) {
        const chunkTileTilePosition = new Vec2(chunkTileTilePositionX, chunkTileTilePositionY)

        const tileTilePosition = chunkTileTilePosition.plus(chunkTilePosition)

        const tileId = vec2ToString(chunkTileTilePosition)

        const id = tileTilePosition.y > 0 ? 'test' : 'air'

        chunk.set(tileId, { id })
      }
    }

    return chunk
  }
}

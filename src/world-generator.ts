import { type Tile } from './public/engine/util/tilemap/chunk.js'
import { CHUNK_SIZE } from './public/engine/util/tilemap/position-conversion.js'
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

  public generateChunk (chunkPosition: Vec2): Chunk {
    const chunk: Chunk = new Map()

    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const tilePosition = new Vec2(x, y)

        const tileId = vec2ToString(tilePosition)

        chunk.set(tileId, {
          id: Date.now() / 10
        })
      }
    }

    return chunk
  }
}

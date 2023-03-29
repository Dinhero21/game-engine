import { chunkPositionToTilePosition, CHUNK_SIZE } from './public/engine/util/tilemap/position-conversion.js'
import Vec2, { vec2ToString } from './public/engine/util/vec2.js'
import { createNoise2D } from 'simplex-noise'

const NOISE_SCALE = 0.05
const NOISE_STRENGTH = 5

const getNoise2D = createNoise2D()

export type Chunk = Map<string, string>

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

        const noisePosition = tileTilePosition.scaled(NOISE_SCALE)

        const noise = getNoise2D(noisePosition.x, noisePosition.y)

        const baseTerrain = -tileTilePosition.y + (noise * NOISE_STRENGTH)

        let id = 'air'

        if (baseTerrain < 0) id = 'test'

        const tileId = vec2ToString(chunkTileTilePosition)

        chunk.set(tileId, id)
      }
    }

    return chunk
  }
}

import { type TileType } from './tiles/index.js'
import type Tile from './tiles/base.js'
import { chunkPositionToTilePosition, tilePositionToChunkPosition, CHUNK_SIZE } from '../public/engine/util/tilemap/position-conversion.js'
import Vec2, { vec2ToString } from '../public/engine/util/vec2.js'
import Chunk from './chunk.js'
import { createNoise2D } from 'simplex-noise'
import { TypedEmitter } from 'tiny-typed-emitter'

const NOISE_SCALE = 0.05
const NOISE_STRENGTH = 5

const getNoise2D = createNoise2D()

export type Tick = () => void

export type TileUpdateCondition = boolean | 'change'

export interface WorldEvents {
  'tile.set': (tile: Tile) => void
}

// TODO: Separate Tick and Chunk logic
// TODO: Use typed events
export class World extends TypedEmitter<WorldEvents> {
  // Chunk

  private readonly chunks = new Map<string, Chunk>()

  public setTile (type: TileType, tilePosition: Vec2, emit: TileUpdateCondition = 'change', update: TileUpdateCondition = false): void {
    const chunkPosition = tilePositionToChunkPosition(tilePosition)
    const chunk = this.getChunk(chunkPosition)

    const chunkTilePosition = chunk.getTilePosition()
    const relativeTilePosition = tilePosition.minus(chunkTilePosition)

    const oldTile = chunk.getTile(relativeTilePosition)

    chunk.setTile({
      position: relativeTilePosition,
      type
    }, emit)

    if (oldTile === undefined) return

    const oldTileType = oldTile.type

    const shouldUpdate = update === true || (update === 'change' && oldTileType !== type)

    if (shouldUpdate) {
      for (let y = -1; y <= 1; y++) {
        for (let x = -1; x <= 1; x++) {
          this.queueTick(() => {
            const newTilePosition = tilePosition.offset(x, y)
            const newTile = this.getTile(newTilePosition)

            if (newTile === undefined) return

            newTile.update()
          })
        }
      }
    }
  }

  public getTile (tilePosition: Vec2): Tile | undefined {
    const tileChunkPosition = tilePositionToChunkPosition(tilePosition)
    const chunk = this.getChunk(tileChunkPosition)

    const chunkTilePosition = chunk.getTilePosition()
    const relativeTilePosition = tilePosition.minus(chunkTilePosition)

    return chunk.getTile(relativeTilePosition)
  }

  public setChunk (chunk: Chunk, chunkPosition: Vec2): void {
    // TODO: Remove events from old chunk

    chunk.on('tile.set', tile => {
      this.emit('tile.set', tile)
    })

    const chunkId = vec2ToString(chunkPosition)

    this.chunks.set(chunkId, chunk)
  }

  public getChunk (chunkPosition: Vec2): Chunk {
    const chunks = this.chunks

    const chunkId = vec2ToString(chunkPosition)

    let chunk = chunks.get(chunkId)

    if (chunk !== undefined) return chunk

    chunk = this.generateChunk(chunkPosition)

    this.setChunk(chunk, chunkPosition)

    return chunk
  }

  public generateChunk (chunkChunkPosition: Vec2): Chunk {
    const chunk: Chunk = new Chunk(this, { position: chunkChunkPosition })

    const chunkTilePosition = chunkPositionToTilePosition(chunkChunkPosition)

    for (let tileTilePositionY = 0; tileTilePositionY < CHUNK_SIZE; tileTilePositionY++) {
      for (let tileTilePositionX = 0; tileTilePositionX < CHUNK_SIZE; tileTilePositionX++) {
        const tileTilePosition = new Vec2(tileTilePositionX, tileTilePositionY)

        const absoluteTileTilePosition = tileTilePosition.plus(chunkTilePosition)

        const noisePosition = absoluteTileTilePosition.scaled(NOISE_SCALE)

        const noise = getNoise2D(noisePosition.x, noisePosition.y)

        const baseTerrain = -absoluteTileTilePosition.y + (noise * NOISE_STRENGTH)

        let type: TileType = 'air'

        if (baseTerrain < 0) type = 'test'

        chunk.setTile({
          position: tileTilePosition,
          type
        })
      }
    }

    return chunk
  }

  // Ticking

  private readonly queue = new Set<Tick>()

  public tick (): void {
    const queue = new Set(this.queue)

    this.queue.clear()

    for (const f of queue) f()
  }

  public queueTick (tick: Tick): void {
    const queue = this.queue

    queue.add(tick)
  }
}

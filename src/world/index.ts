import { type TileInstance, type TileProperties } from './tile/base'
import { type WorldGen } from './gen'
import Chunk from './chunk'
import { CHUNK_SIZE, chunkPositionToTilePosition, tilePositionToChunkPosition } from '../public/engine/util/tilemap/position-conversion'
import Vec2 from '../public/engine/util/vec2'
import { Map2D } from '../public/engine/util/2d'
import { TypedEmitter } from 'tiny-typed-emitter'

export type Tick = () => void

export interface WorldEvents {
  'tile.set': (tile: TileInstance) => void
}

// TODO: Separate Tick and Chunk logic
export class World extends TypedEmitter<WorldEvents> {
  private readonly gen

  constructor (gen: WorldGen) {
    super()

    this.gen = gen
  }

  // Chunk

  private readonly chunks = new Map2D<number, number, Chunk>()

  public setChunk (chunk: Chunk, x: number, y: number): void {
    // TODO: Remove events from old chunk

    chunk.on('tile.set', tile => {
      this.emit('tile.set', tile)
    })

    const chunks = this.chunks

    chunks.set(x, y, chunk)

    for (const tile of chunk.getTiles()) {
      this.queueLight(tile)
    }
  }

  // TODO: Use x, y
  public getChunk (chunkPosition: Vec2): Chunk {
    const chunks = this.chunks

    let chunk = chunks.get(chunkPosition.x, chunkPosition.y)

    if (chunk !== undefined) return chunk

    chunk = this.generateChunk(chunkPosition)

    this.setChunk(chunk, chunkPosition.x, chunkPosition.y)

    return chunk
  }

  public generateEmptyChunk (chunkChunkPosition: Vec2): Chunk {
    return new Chunk(this, { position: chunkChunkPosition })
  }

  // TODO: Use x, y
  public generateChunk (chunkChunkPosition: Vec2): Chunk {
    const gen = this.gen

    const chunkTilePosition = chunkPositionToTilePosition(chunkChunkPosition)

    const chunk = this.generateEmptyChunk(chunkChunkPosition)

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let y = 0; y < CHUNK_SIZE; y++) {
        const tileTilePosition = new Vec2(x, y)

        const absoluteTileTilePosition = tileTilePosition.plus(chunkTilePosition)

        const tile = gen.getTile(absoluteTileTilePosition)

        chunk.setTile(tile.instance(), tileTilePosition)
      }
    }

    return chunk
  }

  public getChunkMap (): Map2D<number, number, Chunk> {
    return this.chunks
  }

  public getChunks (): Iterable<Chunk> {
    return this.chunks.values()
  }

  // Tile

  public syncTile (tile: TileInstance): void {
    const tilePosition = tile.getTilePosition()
    const chunkPosition = tilePositionToChunkPosition(tilePosition)

    const chunk = this.getChunk(chunkPosition)

    chunk.emit('tile.set', tile)
  }

  public setTile (Instance: (properties: TileProperties) => TileInstance, tilePosition: Vec2, emit: boolean = true, update: boolean = false): void {
    const chunkPosition = tilePositionToChunkPosition(tilePosition)
    const chunk = this.getChunk(chunkPosition)

    const chunkTilePosition = chunk.getTilePosition()
    const relativeTilePosition = tilePosition.minus(chunkTilePosition)

    const old = chunk.getTile(relativeTilePosition.x, relativeTilePosition.y)

    const tile = chunk.setTile(Instance, relativeTilePosition, emit)

    // ? Should destroy be called before of after tile replacement
    // ? or more importantly, should there be a pre and post destroy?

    if (old !== undefined) {
      old.destroy()
    }

    this.queueLight(tile)

    if (update) {
      for (let y = -1; y <= 1; y++) {
        for (let x = -1; x <= 1; x++) {
          this.queueTick(() => {
            const offsetedPosition = tilePosition.offset(x, y)
            const tile = this.getTile(offsetedPosition, false)

            if (tile === undefined) return

            tile.update()
          })
        }
      }
    }
  }

  public getTile (tilePosition: Vec2, generate: boolean): TileInstance | undefined {
    const tileChunkPosition = tilePositionToChunkPosition(tilePosition)

    const chunks = this.chunks

    const chunk = generate
      ? this.getChunk(tileChunkPosition)
      : chunks.get(tileChunkPosition.x, tileChunkPosition.y)

    if (chunk === undefined) return

    const chunkTilePosition = chunk.getTilePosition()
    const relativeTilePosition = tilePosition.minus(chunkTilePosition)

    return chunk.getTile(relativeTilePosition.x, relativeTilePosition.y)
  }

  // Ticking

  private readonly tickQueue = new Set<Tick>()

  public queueTick (tick: Tick): void {
    const queue = this.tickQueue

    queue.add(tick)
  }

  public currentTick: symbol = Symbol('load')

  public tick (): void {
    this.currentTick = Symbol('tick')

    const _queue = this.tickQueue

    const queue = new Set(_queue)

    _queue.clear()

    for (const f of queue) f()
  }

  // Light Updates

  private readonly lightQueue = new Set<TileInstance>()

  public queueLight (tile: TileInstance): void {
    const queue = this.lightQueue

    queue.add(tile)
  }

  public updateLights (): void {
    const _queue = this.lightQueue

    const queue = new Set(_queue)

    _queue.clear()

    for (const tile of queue) {
      const oldLight = tile.light

      tile.updateLight()

      const newLight = tile.light

      const equal = oldLight === newLight

      if (equal) continue

      this.syncTile(tile)

      const neighbors = tile.getNeighbors()

      for (const neighbor of neighbors) {
        this.queueLight(neighbor)
      }
    }
  }
}

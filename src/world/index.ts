import { type TileInstance, type TileProperties } from './tile/base'
import { type WorldGen } from './gen'
import Chunk from './chunk'
import { CHUNK_SIZE, chunkPositionToTilePosition, tilePositionToChunkPosition } from '../public/engine/util/tilemap/position-conversion'
import Vec2 from '../public/engine/util/vec2'
import { TypedEmitter } from 'tiny-typed-emitter'

export type Tick = () => void

export interface WorldEvents {
  'tile.set': (tile: TileInstance) => void
}

// TODO: Separate Tick and Chunk logic
export class World extends TypedEmitter<WorldEvents> {
  // Chunk

  private readonly chunks = new Map<number, Map<number, Chunk>>()

  private readonly gen

  public currentTick: symbol = Symbol('load')

  constructor (gen: WorldGen) {
    super()

    this.gen = gen
  }

  public setTile (Instance: (properties: TileProperties) => TileInstance, tilePosition: Vec2, emit: boolean = true, update: boolean = false): void {
    const chunkPosition = tilePositionToChunkPosition(tilePosition)
    const chunk = this.getChunk(chunkPosition)

    const chunkTilePosition = chunk.getTilePosition()
    const relativeTilePosition = tilePosition.minus(chunkTilePosition)

    const old = chunk.getTile(relativeTilePosition.x, relativeTilePosition.y)

    chunk.setTile(Instance, relativeTilePosition, emit)

    // ? Should destroy be called before of after tile replacement
    // ? or more importantly, should there be a pre and post destroy?

    if (old !== undefined) {
      old.destroy()
    }

    if (update) {
      for (let y = -1; y <= 1; y++) {
        for (let x = -1; x <= 1; x++) {
          this.queueTick(() => {
            const offsetedPosition = tilePosition.offset(x, y)
            const tile = this.getTile(offsetedPosition)

            if (tile === undefined) return

            tile.update()
          })
        }
      }
    }
  }

  public getTile (tilePosition: Vec2): TileInstance | undefined {
    const tileChunkPosition = tilePositionToChunkPosition(tilePosition)
    const chunk = this.getChunk(tileChunkPosition)

    const chunkTilePosition = chunk.getTilePosition()
    const relativeTilePosition = tilePosition.minus(chunkTilePosition)

    return chunk.getTile(relativeTilePosition.x, relativeTilePosition.y)
  }

  public setChunk (chunk: Chunk, x: number, y: number): void {
    // TODO: Remove events from old chunk

    chunk.on('tile.set', tile => {
      this.emit('tile.set', tile)
    })

    const chunks = this.chunks

    const row = chunks.get(x) ?? new Map()
    chunks.set(x, row)

    row.set(y, chunk)
  }

  protected _getChunk (x: number, y: number): Chunk | undefined {
    return this.chunks.get(x)?.get(y)
  }

  // TODO: Use x, y
  public getChunk (chunkPosition: Vec2): Chunk {
    let chunk = this._getChunk(chunkPosition.x, chunkPosition.y)

    if (chunk !== undefined) return chunk

    chunk = this.generateChunk(chunkPosition)

    this.setChunk(chunk, chunkPosition.x, chunkPosition.y)

    return chunk
  }

  // TODO: Use x, y
  public generateChunk (chunkChunkPosition: Vec2): Chunk {
    const gen = this.gen

    const chunkTilePosition = chunkPositionToTilePosition(chunkChunkPosition)

    const chunk = new Chunk(this, { position: chunkChunkPosition })

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

  // Ticking

  private readonly queue = new Set<Tick>()

  public tick (): void {
    this.currentTick = Symbol('tick')

    const queue = new Set(this.queue)

    this.queue.clear()

    for (const f of queue) f()
  }

  public queueTick (tick: Tick): void {
    const queue = this.queue

    queue.add(tick)
  }
}

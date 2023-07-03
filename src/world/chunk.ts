import { type World } from './index.js'
import { type TileProperties, type TileInstance } from './tiles/base.js'
import type Vec2 from '../public/engine/util/vec2.js'
import { chunkPositionToTilePosition, positionToTilePosition, tilePositionToChunkPosition, tilePositionToPosition } from '../public/engine/util/tilemap/position-conversion.js'
import { TypedEmitter } from 'tiny-typed-emitter'

export interface ChunkData {
  position: Vec2
}

export interface ChunkEvents {
  'tile.set': (tile: TileInstance) => void
}

export class Chunk extends TypedEmitter<ChunkEvents> {
  private readonly world: World

  public getWorld (): World {
    return this.world
  }

  constructor (world: World, data: ChunkData) {
    super()

    this.world = world
    this._position = data.position
  }

  private _position

  // Position (Getters)

  public getChunkPosition (): Vec2 {
    return this._position
  }

  public getTilePosition (): Vec2 {
    const chunkPosition = this.getChunkPosition()
    const tilePosition = chunkPositionToTilePosition(chunkPosition)

    return tilePosition
  }

  public getPosition (): Vec2 {
    const tilePosition = this.getTilePosition()
    const position = tilePositionToPosition(tilePosition)

    return position
  }

  // Position (Setters)

  public setChunkPosition (chunkPosition: Vec2): void {
    // ? Should I update via reference or value?
    // Reference: position.update(value)
    // Value:     position = value
    this._position = chunkPosition
  }

  public setTilePosition (tilePosition: Vec2): void {
    const chunkPosition = tilePositionToChunkPosition(tilePosition)

    this.setChunkPosition(chunkPosition)
  }

  public setPosition (position: Vec2): void {
    const tilePosition = positionToTilePosition(position)
    const chunkPosition = tilePositionToChunkPosition(tilePosition)

    this.setChunkPosition(chunkPosition)
  }

  // Tile

  private readonly tiles = new Map<number, Map<number, TileInstance>>()

  public setTile (Instance: (properties: TileProperties) => TileInstance, relativeTilePosition: Vec2, emit: boolean = true): void {
    const tiles = this.tiles

    const row = tiles.get(relativeTilePosition.x) ?? new Map()
    tiles.set(relativeTilePosition.x, row)

    const tile = Instance({ chunk: this, position: relativeTilePosition })

    row.set(relativeTilePosition.y, tile)

    if (emit) this.emit('tile.set', tile)
  }

  public getTile (x: number, y: number): TileInstance | undefined {
    return this.tiles.get(x)?.get(y)
  }

  public getTiles (): Map<number, Map<number, TileInstance>> {
    return this.tiles
  }
}

export default Chunk

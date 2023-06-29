import { type World, type TileUpdateCondition } from './world.js'
import type Vec2 from '../public/engine/util/vec2.js'
import { chunkPositionToTilePosition, positionToTilePosition, tilePositionToChunkPosition, tilePositionToPosition } from '../public/engine/util/tilemap/position-conversion.js'
import { vec2ToString } from '../public/engine/util/vec2.js'
import { TypedEmitter } from 'tiny-typed-emitter'
import { type TileInstance, type TileProperties } from './tiles/stone.js'

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

  private readonly tiles = new Map<string, TileInstance>()

  public setTile (Instance: (properties: TileProperties) => TileInstance, relativeTilePosition: Vec2, emit: TileUpdateCondition = 'change'): void {
    const tile = Instance({ chunk: this, position: relativeTilePosition })
    const type = tile.type

    const tileId = vec2ToString(relativeTilePosition)

    const oldTile = this.getTile(relativeTilePosition)

    this.tiles.set(tileId, tile)

    if (oldTile === undefined) return

    const oldTileType = oldTile.type

    const shouldEmit = emit === true || (emit === 'change' && oldTileType !== type)

    if (shouldEmit) this.emit('tile.set', tile)
  }

  public getTile (tilePosition: Vec2): TileInstance | undefined {
    const tileId = vec2ToString(tilePosition)

    return this.tiles.get(tileId)
  }

  public getTiles (): Map<string, TileInstance> {
    return this.tiles
  }
}

export default Chunk

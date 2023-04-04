import { type World, type TileUpdateCondition } from './world.js'
import type Vec2 from '../public/engine/util/vec2.js'
import { chunkPositionToTilePosition, positionToTilePosition, tilePositionToChunkPosition, tilePositionToPosition } from '../public/engine/util/tilemap/position-conversion.js'
import { vec2ToString } from '../public/engine/util/vec2.js'
import Tile, { type TileData } from './tile.js'
import EventEmitter from 'events'

export interface ChunkData {
  position: Vec2
}

// TODO: Use typed events
export class Chunk extends EventEmitter {
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

  private readonly tiles = new Map<string, Tile>()

  public setTile (data: TileData, emit: TileUpdateCondition = 'change'): void {
    const tile = new Tile(this, data)

    const relativeTilePosition = data.position

    const tileId = vec2ToString(relativeTilePosition)

    const oldTile = this.getTile(relativeTilePosition)

    this.tiles.set(tileId, tile)

    if (oldTile === undefined) return

    const oldTileType = oldTile.getType()

    const shouldEmit = emit === true || (emit === 'change' && oldTileType !== data.type)

    if (shouldEmit) this.emit('tile.set', tile)
  }

  public getTile (tilePosition: Vec2): Tile | undefined {
    const tileId = vec2ToString(tilePosition)

    return this.tiles.get(tileId)
  }

  public getTiles (): Map<string, Tile> {
    return this.tiles
  }
}

export default Chunk

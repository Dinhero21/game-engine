import type Vec2 from '../public/engine/util/vec2'
import type Player from '../player'
import { type World } from '.'
import { type TileProperties, type TileInstance } from './tile/base'
import { chunkPositionToTilePosition, positionToTilePosition, tilePositionToChunkPosition, tilePositionToPosition } from '../public/engine/util/tilemap/position-conversion'
import { Map2D } from '../public/engine/util/2d'
import { TypedEmitter } from 'tiny-typed-emitter'

export interface ChunkData {
  position: Vec2
}

export interface ChunkEvents {
  'tile.set': (tile: TileInstance) => void
}

export class Chunk extends TypedEmitter<ChunkEvents> {
  private readonly world: World

  public references = new Set<Player>()

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

  private readonly tiles = new Map2D<number, number, TileInstance>()

  public setTile (Instance: (properties: TileProperties) => TileInstance, relativeTilePosition: Vec2, emit: boolean = true): TileInstance {
    const tiles = this.tiles

    const tile = Instance({ chunk: this, position: relativeTilePosition })

    tiles.set(
      relativeTilePosition.x,
      relativeTilePosition.y,
      tile
    )

    if (emit) this.emit('tile.set', tile)

    const world = this.getWorld()

    world.queueTick(() => {
      tile.ready()
    })

    return tile
  }

  public getTile (x: number, y: number): TileInstance | undefined {
    return this.tiles.get(x, y)
  }

  public getTileMap (): Map2D<number, number, TileInstance> {
    return this.tiles
  }

  public getTiles (): Iterable<TileInstance> {
    return this.getTileMap().values()
  }
}

export default Chunk

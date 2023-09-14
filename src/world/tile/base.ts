import type Vec2 from '../../public/engine/util/vec2'
import type Chunk from '../chunk'
import type Player from '../../player'
import { type World } from '..'
import { tilePositionToPosition } from '../../public/engine/util/tilemap/position-conversion'

export type TileType = string

export interface TileProperties {
  chunk: Chunk
  position: Vec2
}

export abstract class Tile<Properties = any> {
  protected readonly properties

  constructor (properties: Properties) {
    this.properties = properties
  }

  public abstract instance (): (tileProperties: TileProperties) => TileInstance<Properties>
}

export abstract class TileInstance<Properties = any> {
  public readonly abstract type: TileType

  public readonly properties: Properties

  constructor (tileProperties: TileProperties, properties: Properties) {
    Object.freeze(properties)

    this.properties = properties

    this.chunk = tileProperties.chunk
    this.position = tileProperties.position
  }

  public ready (): void {}

  public update (): void {}

  public onInteraction (player: Player): void {}

  protected readonly chunk: Chunk

  public getChunk (): Chunk {
    return this.chunk
  }

  public getWorld (): World {
    const chunk = this.chunk

    return chunk.getWorld()
  }

  protected readonly position: Vec2

  public getRelativePosition (): Vec2 {
    return this.position
  }

  public getTilePosition (): Vec2 {
    const chunk = this.getChunk()
    const chunkTilePosition = chunk.getTilePosition()

    const relativeTilePosition = this.getRelativePosition()

    return chunkTilePosition.plus(relativeTilePosition)
  }

  public getMeta (): any {}

  public syncTile (tile: TileInstance): void {
    const world = this.getWorld()

    const tilePosition = tile.getTilePosition()
    const chunkPosition = tilePositionToPosition(tilePosition)

    const chunk = world.getChunk(chunkPosition)

    chunk.emit('tile.set', tile)
  }

  public * getNeighbors (): Iterable<TileInstance> {
    const position = this.getTilePosition()

    const neighborPositions = [
      position.offset(1, 0),
      position.offset(-1, 0),
      position.offset(0, 1),
      position.offset(0, -1)
    ]

    const world = this.getWorld()

    for (const neighborPosition of neighborPositions) {
      const neighbor = world.getTile(neighborPosition)

      if (neighbor === undefined) continue

      yield neighbor
    }
  }

  public updateNeighbors (): void {
    for (const neighbor of this.getNeighbors()) {
      neighbor.update()
    }
  }
}

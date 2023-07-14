import type Vec2 from '../../public/engine/util/vec2'
import type Chunk from '../chunk'
import { type World } from '..'

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
  public readonly abstract type: string

  protected readonly properties: Properties

  constructor (tileProperties: TileProperties, properties: Properties) {
    this.properties = properties

    this.chunk = tileProperties.chunk
    this.position = tileProperties.position
  }

  public ready (): void {}

  public update (): void {}

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
}

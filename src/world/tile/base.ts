import type Vec2 from '../../public/engine/util/vec2'
import type Chunk from '../chunk'
import { type World } from '..'
import { type IPlayer } from '../entity'

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
  public readonly abstract type: string

  public readonly properties

  constructor (tileProperties: TileProperties, properties: Properties) {
    Object.freeze(properties)

    this.properties = properties

    this.chunk = tileProperties.chunk
    this.position = tileProperties.position
  }

  // Game Loop

  public ready (): void {}

  public update (): void {}

  public onInteraction (player: IPlayer): void {}

  public destroy (): void {}

  // Getters

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

  // Helpers

  public syncTile (tile: TileInstance): void {
    const world = this.getWorld()

    world.syncTile(tile)
  }

  public * getNeighbors (generate: boolean = false): Iterable<TileInstance> {
    const position = this.getTilePosition()

    const neighborPositions = [
      position.offset(1, 0),
      position.offset(-1, 0),
      position.offset(0, 1),
      position.offset(0, -1)
    ]

    const world = this.getWorld()

    for (const neighborPosition of neighborPositions) {
      const neighbor = world.getTile(neighborPosition, generate)

      if (neighbor === undefined) continue

      yield neighbor
    }
  }

  public updateNeighbors (): void {
    for (const neighbor of this.getNeighbors()) {
      neighbor.update()
    }
  }

  // Lighting

  public LIGHT_ABSORPTION = 1 / 8

  public light: number = 0

  public updateLight (): void {
    const neighbors = this.getNeighbors()

    let light = 0

    for (const neighbor of neighbors) {
      light = Math.max(light, neighbor.light)
    }

    const world = this.getWorld()
    const tilePosition = this.getTilePosition()
    const topTilePosition = tilePosition.offset(0, -1)
    const topTile = world.getTile(topTilePosition, false)

    const topTileLight = topTile?.light ?? 1

    light = Math.max(light, topTileLight)

    light -= this.LIGHT_ABSORPTION

    if (light < 0) light = 0

    this.light = light
  }

  public queueLight (): void {
    const world = this.getWorld()

    world.queueLight(this)
  }
}

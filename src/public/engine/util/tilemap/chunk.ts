import type Vec2 from '../vec2.js'
import { vec2ToString } from '../vec2.js'
import { chunkPositionToTilePosition, tilePositionToPosition } from './position-conversion.js'
import RectangularCollider from '../collision/rectangular.js'

export interface Tile {
  id: number
  collider?: RectangularCollider
}

export class Chunk {
  public tiles = new Map<string, Tile>()
  public boundingBox: RectangularCollider

  constructor (chunkPosition: Vec2, tileCount: Vec2) {
    const tilePosition = chunkPositionToTilePosition(chunkPosition)
    const position = tilePositionToPosition(tilePosition)

    const size = tilePositionToPosition(tileCount)

    this.boundingBox = new RectangularCollider(position, size)
  }

  public setTile (tile: Tile, tilePosition: Vec2): void {
    const id = vec2ToString(tilePosition)

    this.tiles.set(id, tile)
  }

  public touching (other: RectangularCollider): boolean {
    return this.boundingBox.touching(other) && Array.from(this.tiles.values()).some(tile => tile.collider?.touching(other))
  }

  public overlapping (other: RectangularCollider): boolean {
    return this.boundingBox.overlapping(other) && Array.from(this.tiles.values()).some(tile => tile.collider?.overlapping(other))
  }

  public colliding (other: RectangularCollider): boolean {
    return this.boundingBox.colliding(other) && Array.from(this.tiles.values()).some(tile => tile.collider?.colliding(other))
  }
}

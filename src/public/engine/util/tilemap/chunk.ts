import RectangularCollider from '../collision/rectangular.js'
import Vec2 from '../vec2.js'

export interface Tile {
  id: number
  position: Vec2
  size: Vec2
  collider?: RectangularCollider
}

export class Chunk {
  public tiles: Tile[] = []
  public boundingBox: RectangularCollider
  public position: Vec2 = new Vec2(0, 0)

  constructor (position: Vec2, size: Vec2) {
    this.boundingBox = new RectangularCollider(position, size)
  }

  public setTile (tile: Tile): void {
    this.tiles = this.tiles
      .filter(t => !t.position.equals(tile.position))

    this.tiles.push(tile)
  }

  public touching (other: RectangularCollider): boolean {
    return this.boundingBox.touching(other) && this.tiles.some(tile => tile.collider?.touching(other))
  }

  public overlapping (other: RectangularCollider): boolean {
    return this.boundingBox.overlapping(other) && this.tiles.some(tile => tile.collider?.overlapping(other))
  }

  public colliding (other: RectangularCollider): boolean {
    return this.boundingBox.colliding(other) && this.tiles.some(tile => tile.collider?.colliding(other))
  }
}

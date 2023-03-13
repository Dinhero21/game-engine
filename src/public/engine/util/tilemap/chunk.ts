import RectangleCollider from '../collision/rectangle.js'
import Vec2 from '../vec2.js'

export interface Tile {
  id: number
  position: Vec2
  size: Vec2
  collider?: RectangleCollider
}

export class Chunk {
  public tiles: Tile[] = []
  public boundingBox: RectangleCollider
  public position: Vec2 = new Vec2(0, 0)

  constructor (position: Vec2, size: Vec2) {
    this.boundingBox = new RectangleCollider(position, size)
  }

  public setTile (tile: Tile): void {
    this.tiles = this.tiles
      .filter(t => !t.position.equals(tile.position))

    this.tiles.push(tile)
  }

  public colliding (other: RectangleCollider): boolean {
    return this.boundingBox.colliding(other) && this.tiles.some(tile => tile.collider?.colliding(other))
  }
}

import type Vec2 from './vec2.js'

export class BoundingBox {
  protected position: Vec2
  protected size: Vec2

  public getPosition (): Vec2 {
    return this.position
  }

  public getSize (): Vec2 {
    return this.size
  }

  public getStart (): Vec2 {
    return this.getPosition()
  }

  public getEnd (): Vec2 {
    const start = this.getStart()
    const size = this.getSize()

    return start.plus(size)
  }

  constructor (position: Vec2, size: Vec2) {
    this.position = position
    this.size = size
  }

  // ? Should I make this public or protected (or private)?
  public distancesTo (other: BoundingBox): number[] {
    const start = this.getStart()
    const end = this.getEnd()

    const otherStart = other.getStart()
    const otherEnd = other.getEnd()

    return [
      start.x - otherEnd.x,
      otherStart.x - end.x,
      start.y - otherEnd.y,
      otherStart.y - end.y
    ]
  }

  public distanceTo (other: BoundingBox): number {
    const distances = this.distancesTo(other)

    return Math.max(...distances)
  }

  public touching (other: BoundingBox): boolean {
    return this.distanceTo(other) === 0
  }

  public overlapping (other: BoundingBox): boolean {
    return this.distanceTo(other) < 0
  }

  public colliding (other: BoundingBox): boolean {
    return this.overlapping(other) || this.touching(other)
  }
}

export default BoundingBox

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

  public _distanceLeft (other: BoundingBox): number {
    const start = this.getStart()
    // const end = this.getEnd()

    // const otherStart = other.getStart()
    const otherEnd = other.getEnd()

    return start.x - otherEnd.x
  }

  public distanceLeft (other: BoundingBox): number {
    return Math.max(this._distanceLeft(other), other._distanceRight(this))
  }

  public _distanceRight (other: BoundingBox): number {
    // const start = this.getStart()
    const end = this.getEnd()

    const otherStart = other.getStart()
    // const otherEnd = other.getEnd()

    return otherStart.x - end.x
  }

  public distanceRight (other: BoundingBox): number {
    return Math.max(this._distanceRight(other), other._distanceLeft(this))
  }

  public _distanceDown (other: BoundingBox): number {
    const start = this.getStart()
    // const end = this.getEnd()

    // const otherStart = other.getStart()
    const otherEnd = other.getEnd()

    return start.y - otherEnd.y
  }

  public distanceDown (other: BoundingBox): number {
    return Math.max(this._distanceDown(other), other._distanceUp(this))
  }

  public _distanceUp (other: BoundingBox): number {
    // const start = this.getStart()
    const end = this.getEnd()

    const otherStart = other.getStart()
    // const otherEnd = other.getEnd()

    return otherStart.y - end.y
  }

  public distanceUp (other: BoundingBox): number {
    return Math.max(this._distanceUp(other), other._distanceDown(this))
  }

  public distances (other: BoundingBox): { left: number, right: number, down: number, up: number } {
    const left = this._distanceLeft(other)
    const right = this._distanceRight(other)
    const down = this._distanceDown(other)
    const up = this._distanceUp(other)

    return { left, right, down, up }
  }

  public distanceArray (other: BoundingBox): [number, number, number, number] {
    return [
      this._distanceLeft(other),
      this._distanceRight(other),
      this._distanceUp(other),
      this._distanceDown(other)
    ]
  }

  public distance (other: BoundingBox): number {
    const distances = this.distanceArray(other)

    return Math.max(...distances)
  }

  public touching (other: BoundingBox): boolean {
    return this.distance(other) === 0
  }

  public overlapping (other: BoundingBox): boolean {
    return this.distance(other) < 0
  }

  public colliding (other: BoundingBox): boolean {
    return this.distance(other) <= 0
  }
}

export default BoundingBox

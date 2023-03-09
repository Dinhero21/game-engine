import type Vec2 from '../vec2.js'
import { Collider } from './collider.js'

export class RectangleCollider extends Collider {
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
    super()

    this.position = position
    this.size = size
  }

  public _distanceLeft (other: this): number {
    const start = this.getStart()
    // const end = this.getEnd()

    // const otherStart = other.getStart()
    const otherEnd = other.getEnd()

    return start.x - otherEnd.x
  }

  public _distanceRight (other: this): number {
    // const start = this.getStart()
    const end = this.getEnd()

    const otherStart = other.getStart()
    // const otherEnd = other.getEnd()

    return otherStart.x - end.x
  }

  public _distanceDown (other: this): number {
    const start = this.getStart()
    // const end = this.getEnd()

    // const otherStart = other.getStart()
    const otherEnd = other.getEnd()

    return start.y - otherEnd.y
  }

  public _distanceUp (other: this): number {
    // const start = this.getStart()
    const end = this.getEnd()

    const otherStart = other.getStart()
    // const otherEnd = other.getEnd()

    return otherStart.y - end.y
  }
}

export default RectangleCollider

import type Vec2 from '../vec2.js'
import { Collider } from './collider.js'

export abstract class RectangularlyApproximatable extends Collider<RectangularlyApproximatable> {
  abstract getRectangularApproximation (): RectangularCollider
}

export class RectangularCollider extends RectangularlyApproximatable {
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

  public getRectangularApproximation (): RectangularCollider {
    return this
  }

  constructor (position: Vec2, size: Vec2) {
    super()

    this.position = position
    this.size = size
  }

  public _distanceLeft (other: RectangularlyApproximatable): number {
    const otherRectangularCollider = other.getRectangularApproximation()

    const start = this.getStart()
    // const end = this.getEnd()

    // const otherStart = otherRectangularCollider.getStart()
    const otherEnd = otherRectangularCollider.getEnd()

    return start.x - otherEnd.x
  }

  public _distanceRight (other: RectangularlyApproximatable): number {
    const otherRectangularCollider = other.getRectangularApproximation()

    // const start = this.getStart()
    const end = this.getEnd()

    const otherStart = otherRectangularCollider.getStart()
    // const otherEnd = otherRectangularCollider.getEnd()

    return otherStart.x - end.x
  }

  public _distanceDown (other: RectangularlyApproximatable): number {
    const otherRectangularCollider = other.getRectangularApproximation()

    const start = this.getStart()
    // const end = this.getEnd()

    // const otherStart = otherRectangularCollider.getStart()
    const otherEnd = otherRectangularCollider.getEnd()

    return start.y - otherEnd.y
  }

  public _distanceUp (other: RectangularlyApproximatable): number {
    const otherRectangularCollider = other.getRectangularApproximation()

    // const start = this.getStart()
    const end = this.getEnd()

    const otherStart = otherRectangularCollider.getStart()
    // const otherEnd = otherRectangularCollider.getEnd()

    return otherStart.y - end.y
  }
}

export default RectangularCollider

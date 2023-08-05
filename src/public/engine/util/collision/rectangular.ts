import { Collider } from './collider'
import Vec2 from '../vec2'

export type OverlapDetector = (collider: RectangularCollider) => boolean

export abstract class RectangularlyApproximatableCollider extends Collider<RectangularlyApproximatableCollider> {
  public abstract getRectangularApproximation (): RectangularCollider
}

export class RectangularCollider extends RectangularlyApproximatableCollider {
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

  public offset (offset: Vec2): RectangularCollider {
    const position = this.position
    const size = this.size

    return new (this.constructor as typeof RectangularCollider)(position.plus(offset), size)
  }

  constructor (position: Vec2, size: Vec2) {
    super()

    this.position = position
    this.size = size
  }

  public _distanceLeft (other: RectangularlyApproximatableCollider): number {
    const otherRectangularCollider = other.getRectangularApproximation()

    const start = this.getStart()
    // const end = this.getEnd()

    // const otherStart = otherRectangularCollider.getStart()
    const otherEnd = otherRectangularCollider.getEnd()

    return start.x - otherEnd.x
  }

  public _distanceRight (other: RectangularlyApproximatableCollider): number {
    const otherRectangularCollider = other.getRectangularApproximation()

    // const start = this.getStart()
    const end = this.getEnd()

    const otherStart = otherRectangularCollider.getStart()
    // const otherEnd = otherRectangularCollider.getEnd()

    return otherStart.x - end.x
  }

  public _distanceDown (other: RectangularlyApproximatableCollider): number {
    const otherRectangularCollider = other.getRectangularApproximation()

    const start = this.getStart()
    // const end = this.getEnd()

    // const otherStart = otherRectangularCollider.getStart()
    const otherEnd = otherRectangularCollider.getEnd()

    return start.y - otherEnd.y
  }

  public _distanceUp (other: RectangularlyApproximatableCollider): number {
    const otherRectangularCollider = other.getRectangularApproximation()

    // const start = this.getStart()
    const end = this.getEnd()

    const otherStart = otherRectangularCollider.getStart()
    // const otherEnd = otherRectangularCollider.getEnd()

    return otherStart.y - end.y
  }

  public calculateMaximumPositionDelta (delta: Vec2, _overlapping: OverlapDetector, maxIterations: number = 32): Vec2 {
    let position = this.position.clone()
    const size = this.size.clone()

    const oldPosition = position.clone()
    position = position.clone()

    const direction = delta.unit()

    let distance = delta.clone()

    distance.divide(2)

    position.add(distance)

    while (true) {
      distance.divide(2)

      const oldPosition = position.clone()

      if (overlapping()) position.subtract(distance)
      else position.add(distance)

      if (positionUnchanged(oldPosition, position)) break
    }

    // Ensure I am outside of the collider
    for (let i = 0; true; i++) {
      if (!overlapping()) break

      const oldPosition = position.clone()

      position.subtract(distance)

      if (positionUnchanged(oldPosition, position)) distance = scaleDistancePreservingDirection(distance, 2)

      if (i > maxIterations) return new Vec2(0, 0)
    }

    return position.minus(oldPosition)

    function overlapping (): boolean {
      return _overlapping(new RectangularCollider(position, size))
    }

    function positionUnchanged (oldPosition: Vec2, newPosition: Vec2): boolean {
      if (direction.length() === 0) return true

      // TODO: Find a more elegant way to do this
      // I have to check if oldPosition + direction !== oldPosition because if direction is 0 then it would always return true
      const x = oldPosition.x + direction.x !== oldPosition.x && oldPosition.x === newPosition.x
      const y = oldPosition.y + direction.y !== oldPosition.y && oldPosition.y === newPosition.y

      return x || y
    }

    function scaleDistancePreservingDirection (distance: Vec2, scale: number): Vec2 {
      const length = distance.length()

      return direction.scaled(length * scale)
    }
  }
}

export default RectangularCollider

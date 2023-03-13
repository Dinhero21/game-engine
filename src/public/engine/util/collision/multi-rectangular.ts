import RectangularCollider, { type RectangularlyApproximatableCollider } from './rectangular.js'
import Vec2 from '../vec2.js'

export class MultiRectangularCollider extends RectangularCollider {
  public colliders: RectangularCollider[]

  constructor (colliders: RectangularCollider[]) {
    super(new Vec2(NaN, NaN), new Vec2(NaN, NaN))

    this.colliders = colliders
  }

  // TODO: Make separate methods for Vertical and Horizontal collision
  protected getBestCollider (other: RectangularlyApproximatableCollider): RectangularCollider {
    let bestCollider
    let bestDistance = Infinity

    for (const collider of this.colliders) {
      const distance = collider.distance(other)

      if (distance < bestDistance) {
        bestDistance = distance
        bestCollider = collider
      }
    }

    if (bestCollider === undefined) throw new Error('No valid colliders found')

    return bestCollider
  }

  public _distanceLeft (other: RectangularlyApproximatableCollider): number {
    return this.getBestCollider(other)._distanceLeft(other)
  }

  public _distanceRight (other: RectangularlyApproximatableCollider): number {
    return this.getBestCollider(other)._distanceRight(other)
  }

  public _distanceDown (other: RectangularlyApproximatableCollider): number {
    return this.getBestCollider(other)._distanceDown(other)
  }

  public _distanceUp (other: RectangularlyApproximatableCollider): number {
    return this.getBestCollider(other)._distanceUp(other)
  }
}

export default MultiRectangularCollider

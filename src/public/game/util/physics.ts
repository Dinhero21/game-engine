import type RectangularCollider from '../../engine/util/collision/rectangular'
import Vec2 from '../../engine/util/vec2'

export type OverlapDetector = (collider: RectangularCollider) => boolean
export type ColliderGetter = () => RectangularCollider

const EPSILON = 0.001

export class PhysicsObject {
  public position = new Vec2(0, 0)

  protected isOverlapping
  protected _getCollider

  protected getCollider (): RectangularCollider {
    const constant = this._getCollider()
    const position = this.position

    return constant.offset(position)
  }

  constructor (isOverlapping: OverlapDetector, getCollider: ColliderGetter) {
    this.isOverlapping = isOverlapping
    this._getCollider = getCollider
  }

  public moveCollide (positionDelta: Vec2): boolean {
    // ? Do I need this?
    if (positionDelta.length() < EPSILON) return false

    const collider = this.getCollider()

    const maximumPositionDelta = collider.calculateMaximumPositionDelta(positionDelta, this.isOverlapping)

    this.position.add(maximumPositionDelta)

    positionDelta.subtract(maximumPositionDelta)

    return true
  }

  public moveSlideIterate (positionDelta: Vec2): boolean {
    if (!this.moveCollide(positionDelta)) return false

    const collider = this.getCollider()

    const maximumPositionDeltaX = collider.calculateMaximumPositionDelta(new Vec2(positionDelta.x, 0), this.isOverlapping)
    const maximumPositionDeltaY = collider.calculateMaximumPositionDelta(new Vec2(0, positionDelta.y), this.isOverlapping)

    const maximumPositionDelta = Math.abs(maximumPositionDeltaX.x) > Math.abs(maximumPositionDeltaY.y)
      ? maximumPositionDeltaX
      : maximumPositionDeltaY

    this.position.add(maximumPositionDelta)

    positionDelta.subtract(maximumPositionDelta)

    return positionDelta.length() < EPSILON
  }

  public moveSlide (positionDelta: Vec2): void {
    const collider = this.getCollider()

    // ? Should I implement this here?
    // ? noclip or freeze?
    if (this.isOverlapping(collider)) {
      this.position.add(positionDelta)

      return
    }

    while (true) {
      if (!this.moveSlideIterate(positionDelta)) break
    }
  }
}

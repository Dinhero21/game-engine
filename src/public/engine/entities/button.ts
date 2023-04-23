import Vec2 from '../util/vec2.js'
import Entity from './index.js'
import RectangularCollider from '../util/collision/rectangular.js'
import PointCollider from '../util/collision/point.js'
import ButtonManager from '../util/button-manager.js'

export class ButtonEntity extends Entity<never> {
  public size

  public readonly manager = new ButtonManager(() => {
    const collider = this.getViewportCollider()

    if (collider === undefined) return false

    const mouseViewportPosition = this.getMouseViewportPosition()

    if (mouseViewportPosition === undefined) return false

    const mouseCollider = new PointCollider(mouseViewportPosition)

    return collider.overlapping(mouseCollider)
  })

  constructor (size: Vec2) {
    super()

    this.size = size
  }

  public getConstantCollider (): RectangularCollider {
    const size = this.size

    return new RectangularCollider(new Vec2(0, 0), size)
  }
}

export default ButtonEntity

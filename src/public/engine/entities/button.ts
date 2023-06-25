import Vec2 from '../util/vec2.js'
import Entity from './index.js'
import RectangularCollider from '../util/collision/rectangular.js'
import PointCollider from '../util/collision/point.js'
import ClickHandler, { type IButton } from '../util/input/mouse/click-handler.js'
import { PrioritizedMouse } from '../util/input/mouse/prioritization.js'

// ? Should I make this a Generic?
export type IButtonEntity = IButton & Entity

export class ButtonEntity<ValidChild extends Entity = Entity> extends Entity<ValidChild> {
  protected size

  private readonly _mouse = new PrioritizedMouse(() => this.getPath())

  public readonly manager = new ClickHandler(() => {
    const collider = this.getViewportCollider()

    if (collider === undefined) return false

    const mouseViewportPosition = this.getMouseViewportPosition()

    if (mouseViewportPosition === undefined) return false

    const mouseCollider = new PointCollider(mouseViewportPosition)

    return collider.overlapping(mouseCollider)
  }, this._mouse)

  constructor (size: Vec2) {
    super()

    this.size = size
  }

  public getConstantCollider (): RectangularCollider {
    return new RectangularCollider(new Vec2(0, 0), this.size)
  }

  public free (): this {
    this.manager.free()
    this._mouse.free()

    return this
  }

  public deleteParent (): this {
    super.deleteParent()

    // ? Should I make this configurable?
    this.free()

    return this
  }
}

export default ButtonEntity

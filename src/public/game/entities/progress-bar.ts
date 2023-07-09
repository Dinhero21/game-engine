import { type Color } from '../util/types'
import type Frame from '../../engine/util/frame'
import Vec2 from '../../engine/util/vec2'
import Entity from '../../engine/entities'
import RectangularCollider from '../../engine/util/collision/rectangular'

export interface Colors {
  background: Color
  foreground: Color
}

export interface ProgressBarOptions {
  size: Vec2
  color: Colors
}

export class ProgressBarEntity<ValidChild extends Entity = Entity> extends Entity<ValidChild> {
  private readonly options

  public progress: number = 0

  constructor (options: ProgressBarOptions) {
    super()

    this.options = options
  }

  public getConstantCollider (): RectangularCollider {
    const options = this.options

    return new RectangularCollider(new Vec2(0, 0), options.size)
  }

  public draw (frame: Frame): void {
    const collider = this.getConstantCollider()
    const position = collider.getPosition()
    const size = collider.getSize()

    const progress = this.progress

    const options = this.options
    const color = options.color

    {
      const [r, g, b, a] = color.background
      frame.drawRectRGBA(position.x, position.y, size.x, size.y, r, g, b, a)
    }

    {
      const [r, g, b, a] = color.foreground
      frame.drawRectRGBA(position.x, position.y, size.x * progress, size.y, r, g, b, a)
    }

    super.draw(frame)
  }
}

export default ProgressBarEntity

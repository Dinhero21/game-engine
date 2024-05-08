import type Frame from '../../../engine/util/frame'
import Entity from '../../../engine/entity'
import Vec2 from '../../../engine/util/vec2'

export class MouseEntity<ValidChild extends Entity = Entity> extends Entity<ValidChild> {
  public update (delta: number): void {
    super.update(delta)

    const position = this.getMouseViewportPosition()

    if (position === undefined) return

    this.position = position
  }

  public image?: CanvasImageSource

  public imageOffset = Vec2.ZERO

  public draw (frame: Frame): void {
    if (this.image === undefined) return

    const offset = this.imageOffset

    frame._drawImage(
      this.image,
      offset.x, offset.y
    )
  }
}

export default MouseEntity

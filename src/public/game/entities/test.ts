import type Frame from '../../engine/util/frame.js'
import MultiRectangularCollider from '../../engine/util/collision/multi-rectangular.js'
import RectangularCollider from '../../engine/util/collision/rectangular.js'
import Entity from '../../engine/entities/index.js'
import Vec2 from '../../engine/util/vec2.js'

export class TestEntity extends Entity {
  public getBoundingBox (): MultiRectangularCollider | null {
    const scene = this.getScene()

    if (scene === undefined) return null

    const context = scene.context

    const canvas = context.canvas

    const size = new Vec2(64, 64)

    return new MultiRectangularCollider(
      [
        new RectangularCollider(
          (new Vec2(((canvas.width - size.x) / 2) - (size.x * 1.5), canvas.height - size.y)),
          size
        ),
        new RectangularCollider(
          (new Vec2(((canvas.width - size.x) / 2) + (size.x * 1.5), canvas.height - size.y)),
          size
        )
      ]
    )
  }

  public update (delta: number): void {
    (() => {
      const parentGlobalPosition = this.getParentGlobalPosition()

      if (parentGlobalPosition === undefined) return

      this.position.update(parentGlobalPosition.scale(-1))
    })()

    super.update(delta)
  }

  public draw (frame: Frame): void {
    super.draw(frame)

    const parent = this.parent

    if (parent === undefined) return

    if (!(parent instanceof Entity)) return

    const parentBoundingBox = parent.getBoundingBox()

    if (parentBoundingBox === null) return

    const boundingBox = this.getBoundingBox()

    if (boundingBox === null) return

    const colliding = boundingBox.colliding(parentBoundingBox)

    for (const collider of boundingBox.colliders) {
      const position = collider.getPosition()
      const size = collider.getSize()

      if (colliding) {
        frame.drawFancyRectRGBA(
          position.x,
          position.y,
          size.x,
          size.y,
          0x98,
          0xC3,
          0x78
        )
      } else {
        frame.drawFancyRectRGBA(
          position.x,
          position.y,
          size.x,
          size.y,
          0xE0,
          0x6C,
          0x75
        )
      }
    }
  }
}

export default TestEntity

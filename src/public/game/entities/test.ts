import type Frame from '../../engine/util/frame.js'
import BoundingBox from '../../engine/util/bounding-box.js'
import Entity from '../../engine/entities/base.js'
import Vec2 from '../../engine/util/vec2.js'

export class TestEntity extends Entity {
  public getBoundingBox (): BoundingBox {
    const globalContext = this.getGlobalContext()

    if (globalContext === undefined) return super.getBoundingBox()

    const canvas = globalContext.canvas

    const size = new Vec2(64, 64)

    return new BoundingBox(
      (new Vec2((canvas.width - size.x) / 2, canvas.height - size.y)),
      size
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

    const parentBoundingBox = parent.getBoundingBox()

    const boundingBox = this.getBoundingBox()
    const position = boundingBox.getPosition()
    const size = boundingBox.getSize()

    // console.log('Parent Start', parentBoundingBox.getStart())
    // console.log('Parent End', parentBoundingBox.getEnd())
    // console.log('Self   Start', boundingBox.getStart())
    // console.log('Self   End', boundingBox.getEnd())

    if (boundingBox.isCollidingWith(parentBoundingBox)) {
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

export default TestEntity

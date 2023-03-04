import BaseEntity from './base.js'

export class MouseEntity extends BaseEntity {
  update (delta) {
    const mousePosition = this.getMouseGlobalPosition()

    this.setGlobalPosition(mousePosition)

    super.update(delta)
  }

  draw (frame) {
    const parent = this.getParent()
    const isCollidingWithParent = this.isCollidingWith(parent)

    if (isCollidingWithParent) {
      frame.drawFancyRectRGBA(0, 0, 256, 256, 0x61, 0xAF, 0xEF)
    } else {
      frame.drawFancyRectRGBA(0, 0, 256, 256, 0xE0, 0x6C, 0x75)
    }

    super.draw(frame)
  }
}

export default MouseEntity

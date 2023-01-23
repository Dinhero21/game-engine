import BaseEntity from './base.js'

export class ExampleEntity extends BaseEntity {
  draw (frame) {
    const position = this.getPosition()
    const boundingBox = this.getBoundingBox()

    frame.drawFancyRectRGBA(position.x, position.y, boundingBox.x, boundingBox.y, 0xE5, 0xC0, 0x7B)

    super.draw(frame)
  }
}

export default ExampleEntity

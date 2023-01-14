import Frame from "../frame.js"
import Vec2 from '../vec2.js'

export class BaseEntity {
  #children = []

  position = new Vec2(0, 0)

  update (delta) {
    for (const child of this.#children) {
      child.update(delta)
    }
  }

  draw (frame) {
    for (const child of this.#children) {
      const childFrame = new Frame()

      child.draw(childFrame)

      childFrame.offset = child.position

      childFrame.draw(frame)
    }
  }

  addChild (child) {
    this.#children.push(child)
  }

  removeChild (child) {
    this.#children = this.#children
      .filter(entity => entity !== child)
  }
}

export default BaseEntity
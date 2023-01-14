import Vec2 from '../vec2.js'
import BaseEntity from './base.js'

const image = new Image()
image.src = 'me.png'

export default class TestEntity extends BaseEntity {
  #time = 0

  getBoundingBoxSize () {
    return new Vec2(256, 256)
  }

  update (delta) {
    this.#time += delta / 1000

    this.position.set(
      (Math.sin(2 * Math.PI * this.#time * 0.5) + 1) * 100,
      (Math.cos(2 * Math.PI * this.#time * 0.5) + 1) * 100
    )
  }

  draw (context) {
    context.fillStyle = '#61AFEF20'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    context.strokeStyle = '#61AFEF'
    context.lineWidth = 10
    context.strokeRect(0, 0, context.canvas.width, context.canvas.height)

    context.drawImage(image, (this.#time % 1) * 256, 0)

    super.draw(context)
  }
}
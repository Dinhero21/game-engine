import BaseEntity from "./base.js";

const image = new Image()
image.src = 'me.png'

export class TestEntity extends BaseEntity {
  #time = 0

  update (delta) {
    this.#time += delta / 1000

    this.position.set(
      (Math.sin(this.#time * Math.PI * 2 * 0.2) + 1) * 100,
      (Math.cos(this.#time * Math.PI * 2 * 0.2) + 1) * 100
    )

    super.update(delta)
  }
  
  draw (frame) {
    frame.outlineRect(0, 0, 256, 256, '#61AFEF', 10)
    frame.drawRect(0, 0, 256, 256, '#61AFEF20')
    frame.drawImage(image, this.#time * 100, 0)

    super.draw(frame)
  }
}

export default TestEntity
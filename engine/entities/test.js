import BaseEntity from "./base.js";

const image = new Image()
image.src = 'me.png'

export class TestEntity extends BaseEntity {
  #time = 0

  update (delta) {
    this.#time += delta / 1000

    const mouse = this.getMouse()
    const mousePosition = mouse.getPosition()

    this.position.set(mousePosition.x, mousePosition.y)

    const keyboard = this.getKeyboard()

    if (keyboard.isKeyPressed('R')) this.#time = 0

    super.update(delta)
  }
  
  draw (frame) {
    frame.outlineRect(0, 0, 256, 256, '#61AFEF', 10)
    frame.drawRect(0, 0, 256, 256, '#61AFEF20')
    frame.drawImage(
      image,
      ((Math.cos(this.#time * Math.PI * 2) + 1) / 2) * 256,
      ((Math.sin(this.#time * Math.PI * 2) + 1) / 2) * 256
      )

    super.draw(frame)
  }
}

export default TestEntity
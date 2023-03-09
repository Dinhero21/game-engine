import type Frame from '../../engine/util/frame.js'
import Entity from '../../engine/entities/base.js'
import Vec2 from '../../engine/util/vec2.js'

export class PlayerEntity extends Entity {
  protected velocity = new Vec2(0, 0)
  protected size = new Vec2(64, 64)

  public draw (frame: Frame): void {
    super.draw(frame)

    const boundingBox = this.getBoundingBox()
    const size = boundingBox.getSize()

    frame.drawFancyRectRGBA(0, 0, size.x, size.y, 0x61, 0xAF, 0xEF)

    const velocity = this.velocity

    frame.drawLine(size.x / 2, size.y / 2, size.x / 2, (velocity.y / 10) + (size.y / 2), '#e06c75', 3)
    frame.drawLine(size.x / 2, size.y / 2, (velocity.x / 10) + (size.x / 2), size.y / 2, '#98c379', 3)
    frame.drawLine(size.x / 2, size.y / 2, (velocity.x / 10) + (size.x / 2), (velocity.y / 10) + (size.y / 2), '#e5c07b', 3)

    const globalMousePosition = this.getGlobalMousePosition()

    if (globalMousePosition === undefined) return

    frame.drawLine(size.x / 2, size.y / 2, globalMousePosition.x, globalMousePosition.y, '#c678dd', 3)
  }

  public update (delta: number): void {
    (() => {
      const keyboard = this.getKeyboard()

      if (keyboard === undefined) return

      let direction = 0

      if (keyboard.isKeyDown('a')) direction--
      if (keyboard.isKeyDown('d')) direction++

      const velocity = this.velocity

      velocity.x += direction * 100
      velocity.x /= 1.2

      // Gravity
      if (keyboard.isKeyDown('space') && this.onGround()) {
        velocity.y = -800
      } else {
        velocity.y += 15
      }
      velocity.y /= 1.02

      // TODO: Make this less convoluted
      velocity.update(this.move(velocity.scaled(delta)).scaled(1 / delta))
    })()

    super.update(delta)
  }

  protected move (velocity: Vec2): Vec2 {
    const globalContext = this.getGlobalContext()

    if (globalContext === undefined) return velocity

    const canvas = globalContext.canvas

    const position = this.position

    const oldPosition = position.clone()

    position.add(velocity)

    const size = this.size

    if (this.position.y > canvas.height - this.size.y) position.y = canvas.height - size.y

    const newVelocity = position.minus(oldPosition)

    return newVelocity
  }

  protected onGround (): boolean {
    const globalContext = this.getGlobalContext()

    if (globalContext === undefined) return false

    const canvas = globalContext.canvas

    return this.position.y === canvas.height - this.size.y
  }
}

export default PlayerEntity

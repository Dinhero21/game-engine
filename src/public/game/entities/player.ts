import Entity from '../../engine/entities/base.js'
import type Frame from '../../engine/frame.js'
import Vec2 from '../../engine/vec2.js'

export class Player extends Entity {
  protected velocity: Vec2 = new Vec2(0, 0)

  public draw (frame: Frame): void {
    frame.drawFancyRectRGBA(0, 0, 64, 64, 0x61, 0xAF, 0xEF)

    const globalMousePosition = this.getGlobalMousePosition()

    if (globalMousePosition === undefined) return

    frame.drawLine(32, 32, globalMousePosition.x, globalMousePosition.y, '#e5c07b')
  }

  public update (delta: number): void {
    const keyboard = this.getKeyboard()

    if (keyboard === undefined) return

    let direction = 0

    if (keyboard.isKeyDown('a')) direction--
    if (keyboard.isKeyDown('d')) direction++

    const velocity = this.velocity

    velocity.x += direction * 100
    velocity.y += 15

    velocity.x /= 1.2
    velocity.y /= 1.02

    // TODO: Make this less convoluted
    velocity.update(this.move(velocity.scaled(delta)).scaled(1 / delta))
  }

  protected move (velocity: Vec2): Vec2 {
    const globalContext = this.getGlobalContext()

    if (globalContext === undefined) return velocity

    const canvas = globalContext.canvas

    const position = this.position

    const oldPosition = position.clone()

    position.add(velocity)

    if (position.y > canvas.height - 64) position.y = canvas.height - 64

    const newVelocity = position.minus(oldPosition)

    return newVelocity
  }
}

export default Player

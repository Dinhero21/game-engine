import type Frame from '../../engine/util/frame.js'
import Entity from '../../engine/entities/base.js'
import Vec2 from '../../engine/util/vec2.js'
import keyboard from '../../engine/util/input/keyboard.js'

export class PlayerEntity extends Entity {
  protected size = new Vec2(64, 64)

  public id
  public velocity

  public controllable: boolean = false

  constructor (id: string, velocity: Vec2) {
    super()

    this.id = id
    this.velocity = velocity
  }

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

    // const screenBoundingBox = this.getScreenBoundingBox()

    // if (screenBoundingBox === undefined) return

    // const isInScreen = this.getBoundingBox().colliding(screenBoundingBox)
    const isInScreen = true

    frame.drawLine(size.x / 2, size.y / 2, globalMousePosition.x, globalMousePosition.y, isInScreen ? '#98c379' : '#e06c75', 3)
  }

  public update (delta: number): void {
    this.move(delta)

    super.update(delta)

    if (this.controllable) {
      const scene = this.getScene()

      if (scene === undefined) return

      const camera = scene.camera

      camera.position = camera.position.plus(this.position.minus(camera.position).scaled(delta))
    }
  }

  protected getUserInputDirection (): Vec2 {
    let horizontalDirection = 0

    if (this.controllable) {
      if (keyboard.isKeyDown('a')) horizontalDirection--
      if (keyboard.isKeyDown('d')) horizontalDirection++
    }

    return new Vec2(horizontalDirection, 0)
  }

  protected move (delta: number): void {
    const velocity = this.velocity

    const direction = this.getUserInputDirection()

    // velocity += direction * speed
    velocity.add(direction.scaled(100))

    // velocity.y += gravity
    velocity.y += 15

    // Friction
    // velocity /= friction + 1
    velocity.x /= 1.2
    velocity.y /= 1.02

    // TODO: Make this less convoluted
    velocity.update(this.updatePosition(velocity.scaled(delta)).scaled(1 / delta))
  }

  protected updatePosition (velocity: Vec2): Vec2 {
    // const globalContext = this.getGlobalContext()

    // if (globalContext === undefined) return velocity

    // const canvas = globalContext.canvas

    const position = this.position

    const oldPosition = position.clone()

    position.add(velocity)

    const size = this.size

    // if (position.y > canvas.height - size.y) position.y = canvas.height - size.y
    if (position.y > 100 - size.y) position.y = 100 - size.y

    const newVelocity = position.minus(oldPosition)

    return newVelocity
  }
}

export default PlayerEntity

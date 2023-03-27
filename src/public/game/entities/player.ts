import type Frame from '../../engine/util/frame.js'
import Entity from '../../engine/entities/base.js'
import Vec2 from '../../engine/util/vec2.js'
import keyboard from '../../engine/util/input/keyboard.js'
import RectangularCollider from '../../engine/util/collision/rectangular.js'
import type MultiRectangularCollider from '../../engine/util/collision/multi-rectangular.js'
import { type Collider } from '../../engine/util/collision/collider.js'

export class PlayerEntity extends Entity {
  public id
  public velocity

  public controllable: boolean = false

  public collider?: MultiRectangularCollider

  constructor (id: string, velocity: Vec2) {
    super()

    this.id = id
    this.velocity = velocity
  }

  public getBoundingBox (): RectangularCollider {
    const size = new Vec2(64, 64)

    const globalPosition = this.getGlobalPosition()

    return new RectangularCollider(globalPosition.minus(size.divided(2)), size)
  }

  public draw (frame: Frame): void {
    super.draw(frame)

    const globalPosition = this.getGlobalPosition()

    const boundingBox = this.getBoundingBox()
    const size = boundingBox.getSize()
    const position = boundingBox.getPosition().minus(globalPosition)

    frame.drawFancyRectRGBA(position.x, position.y, size.x, size.y, 0x61, 0xAF, 0xEF)

    const velocity = this.velocity

    const delta = velocity.scaled(0.1)

    frame
      .drawLine(0, 0, 0, delta.y, '#e06c75', 3)
      .drawLine(0, 0, delta.x, 0, '#98c379', 3)
      .drawLine(0, 0, delta.x, delta.y, '#e5c07b', 3)

    const globalMousePosition = this.getGlobalMousePosition()

    if (globalMousePosition === undefined) return

    // const screenBoundingBox = this.getScreenBoundingBox()

    // if (screenBoundingBox === undefined) return

    // const isInScreen = this.getBoundingBox().colliding(screenBoundingBox)
    const isInScreen = true

    frame.drawLine(0, 0, globalMousePosition.x, globalMousePosition.y, isInScreen ? '#98c379' : '#e06c75', 3)
  }

  public update (delta: number): void {
    this.move(delta)

    super.update(delta)

    if (this.controllable) {
      const scene = this.getScene()

      if (scene === undefined) return

      const camera = scene.camera

      camera.position = this.position
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

  protected updatePosition (positionDelta: Vec2): Vec2 {
    const position = this.position

    const collider = this.collider

    if (collider === undefined) {
      position.add(positionDelta)

      return positionDelta
    }

    const oldPosition = position.clone()

    {
      const boundingBox = this.getBoundingBox()

      const boundingBoxPosition = boundingBox.getPosition()
      const boundingBoxSize = boundingBox.getSize()

      const maximumPositionDelta = this.calculateMaximumPositionDelta(positionDelta, boundingBoxPosition, boundingBoxSize, collider)

      position.add(maximumPositionDelta)

      positionDelta.subtract(maximumPositionDelta)
    }

    {
      const boundingBox = this.getBoundingBox()

      const boundingBoxPosition = boundingBox.getPosition()
      const boundingBoxSize = boundingBox.getSize()

      const maximumPositionDeltaX = this.calculateMaximumPositionDelta(new Vec2(positionDelta.x, 0), boundingBoxPosition, boundingBoxSize, collider)
      const maximumPositionDeltaY = this.calculateMaximumPositionDelta(new Vec2(0, positionDelta.y), boundingBoxPosition, boundingBoxSize, collider)

      if (maximumPositionDeltaX.length() > maximumPositionDeltaY.length()) {
        position.add(maximumPositionDeltaX)
      } else {
        position.add(maximumPositionDeltaY)
      }
    }

    return position.minus(oldPosition)
  }

  // * Iterations is not really necessary as the program will eventually break out of the loop to avoid rounding errors. It might be useful for performance.
  private calculateMaximumPositionDelta (delta: Vec2, position: Vec2, size: Vec2, collider: Collider<RectangularCollider>, iterations: number = 100): Vec2 {
    const oldPosition = position.clone()
    position = position.clone()

    const direction = delta.unit()

    const distance = delta.clone()
    for (let i = 0; i < iterations; i++) {
      distance.divide(2)

      const oldPosition = position.clone()

      if (overlapping()) position.subtract(distance)
      else position.add(distance)

      if (positionUnchanged(oldPosition, position)) break
    }

    // Ensure I am outside of the collider
    // * Hope that distance is not (0, 0) because if it is than this is never going to end
    while (overlapping()) {
      const oldPosition = position.clone()

      position.subtract(distance)

      if (positionUnchanged(oldPosition, position)) distance.scale(2)
    }

    return position.minus(oldPosition)

    function overlapping (): boolean {
      return collider.overlapping(new RectangularCollider(position, size))
    }

    function positionUnchanged (oldPosition: Vec2, newPosition: Vec2): boolean {
      // TODO: Find a more elegant way to do this
      // * I have to check if oldPosition + direction !== oldPosition because if direction is 0 then it would always return true
      const x = oldPosition.x + direction.x !== oldPosition.x && oldPosition.x === newPosition.x
      const y = oldPosition.y + direction.y !== oldPosition.y && oldPosition.y === newPosition.y

      return x || y
    }
  }
}

export default PlayerEntity

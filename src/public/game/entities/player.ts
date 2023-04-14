import type Frame from '../../engine/util/frame.js'
import Entity from '../../engine/entities/index.js'
import Vec2 from '../../engine/util/vec2.js'
import keyboard from '../../engine/util/input/keyboard.js'
import RectangularCollider from '../../engine/util/collision/rectangular.js'

export type OverlapDetector = (collider: RectangularCollider) => boolean

export class PlayerEntity<ValidChild extends Entity = Entity> extends Entity<ValidChild> {
  public id

  public velocity: Vec2 = new Vec2(0, 0)

  public controllable: boolean = false

  public overlapping?: OverlapDetector

  constructor (id: string) {
    super()

    this.id = id
  }

  public getConstantCollider (): RectangularCollider {
    const size = new Vec2(64, 64)

    return new RectangularCollider(size.divided(2).scaled(-1), size)
  }

  public draw (frame: Frame): void {
    super.draw(frame)

    const collider = this.getConstantCollider()
    const size = collider.getSize()
    const position = collider.getPosition()

    frame.drawFancyRectRGBA(position.x, position.y, size.x, size.y, 0x61, 0xAF, 0xEF)

    const velocity = this.velocity

    const delta = velocity.scaled(0.1)

    frame
      .drawLine(0, 0, delta.x, 0, '#e06c75', 3)
      .drawLine(0, 0, 0, delta.y, '#98c379', 3)
      .drawLine(0, 0, delta.x, delta.y, '#e5c07b', 3)
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

    if (keyboard.isKeyDown('space') || keyboard.isKeyDown('w')) velocity.y = -500

    // Friction
    // velocity /= friction + 1
    velocity.x /= 1.2
    velocity.y /= 1.02

    // TODO: Make this less convoluted
    velocity.update(this.updatePosition(velocity.scaled(delta)).divided(delta))
  }

  protected updatePosition (positionDelta: Vec2): Vec2 {
    const position = this.position

    const overlapping = this.overlapping

    if (overlapping === undefined) {
      position.add(positionDelta)

      return positionDelta
    }

    // ? Should I ignore collisions or freeze the player?
    if (overlapping(this.getGlobalCollider())) {
      position.add(positionDelta)

      return positionDelta
    }

    const oldPosition = position.clone()

    // Bidirectional Position Delta Calculation
    {
      const collider = this.getGlobalCollider()

      const maximumPositionDelta = collider.calculateMaximumPositionDelta(positionDelta, overlapping)

      position.add(maximumPositionDelta)

      positionDelta.subtract(maximumPositionDelta)
    }

    // Unidirectional Position Delta Calculation
    {
      const collider = this.getGlobalCollider()

      const maximumPositionDeltaX = collider.calculateMaximumPositionDelta(new Vec2(positionDelta.x, 0), overlapping)
      const maximumPositionDeltaY = collider.calculateMaximumPositionDelta(new Vec2(0, positionDelta.y), overlapping)

      const maximumPositionDelta = maximumPositionDeltaX.length() > maximumPositionDeltaY.length() ? maximumPositionDeltaX : maximumPositionDeltaY

      position.add(maximumPositionDelta)
    }

    return position.minus(oldPosition)
  }
}

export default PlayerEntity

import type Frame from '../../engine/util/frame'
import { TILE_SIZE } from '../../engine/util/tilemap/position-conversion'
import Entity from '../../engine/entities'
import Vec2 from '../../engine/util/vec2'
import keyboard from '../../engine/util/input/keyboard'
import RectangularCollider from '../../engine/util/collision/rectangular'

const FRICTION = new Vec2(50, 5)

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
    let verticalDirection = 0

    if (this.controllable) {
      if (keyboard.isKeyDown('a')) horizontalDirection--
      if (keyboard.isKeyDown('d')) horizontalDirection++

      if (keyboard.isKeyDown('space') || keyboard.isKeyDown('w')) verticalDirection--
    }

    return new Vec2(horizontalDirection, verticalDirection)
  }

  protected move (delta: number): void {
    const velocity = this.velocity

    const direction = this.getUserInputDirection()

    // velocity += direction * speed
    velocity.add(direction.scaled(new Vec2(25000, 12500)).scaled(delta))

    // velocity.y += gravity
    velocity.y += 3750 * delta

    // Friction
    velocity.x /= 1 + (FRICTION.x * delta)
    velocity.y /= 1 + (FRICTION.y * delta)

    const newVelocity = this.updatePosition(velocity.scaled(delta)).divided(delta)

    // TODO: Make this less convoluted
    velocity.update(newVelocity)
  }

  protected updatePosition (positionDelta: Vec2): Vec2 {
    const position = this.position

    const overlapping = undefined // this.overlapping

    if (overlapping === undefined) {
      position.add(positionDelta)

      return positionDelta
    }

    // ? Should I ignore collisions or freeze the player?
    if (overlapping(this.getGlobalCollider())) {
      position.y -= TILE_SIZE

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

      const maximumPositionDelta = Math.abs(maximumPositionDeltaX.x) > Math.abs(maximumPositionDeltaY.y)
        ? maximumPositionDeltaX
        : maximumPositionDeltaY

      position.add(maximumPositionDelta)
    }

    return position.minus(oldPosition)
  }
}

export default PlayerEntity

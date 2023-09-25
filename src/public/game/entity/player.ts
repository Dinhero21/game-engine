import type Frame from '../../engine/util/frame'
import Entity from '../../engine/entity'
import Vec2 from '../../engine/util/vec2'
import keyboard from '../../engine/util/input/keyboard'
import RectangularCollider from '../../engine/util/collision/rectangular'
import { type Color } from '../util/types'
import { type OverlapDetector, PhysicsObject } from '../util/physics'
import { Debug } from '../../globals'
import Alea from 'alea'

const FRICTION = new Vec2(50, 5)

export class PlayerEntity<ValidChild extends Entity = Entity> extends Entity<ValidChild> {
  public id

  public velocity: Vec2 = new Vec2(0, 0)

  public controllable: boolean = false

  public _overlapping?: OverlapDetector

  protected color: Color

  constructor (id: string) {
    super()

    this.id = id

    const prng = Alea(id)

    this.color = [
      prng() > 0.5 ? 0xFF : 0x00,
      prng() > 0.5 ? 0xFF : 0x00,
      prng() > 0.5 ? 0xFF : 0x00
    ]
  }

  protected isOverlapping (collider: RectangularCollider): boolean {
    const overlapping = this._overlapping

    if (overlapping === undefined) return false

    return overlapping(collider)
  }

  // TODO: Multiplayer Physics
  // There would be two physics objects, one would be private and the other would be shared.
  // The private one represents the physics of the local player.
  // The shared one represents how other players will see the local player.
  // Only when the private and shared desync would the shared one be updated.
  // This would allow for less packets to be sent potentially improving client and server performance.

  public readonly physics = new PhysicsObject(
    collider => this.isOverlapping(collider),
    () => this.getConstantCollider()
  )

  public getConstantCollider (): RectangularCollider {
    const size = new Vec2(64, 64)

    return new RectangularCollider(size.divided(2).scaled(-1), size)
  }

  public draw (frame: Frame): void {
    super.draw(frame)

    const collider = this.getConstantCollider()
    const size = collider.getSize()
    const position = collider.getPosition()

    const color = this.color

    frame.drawFancyRectRGBA(
      position.x, position.y,
      size.x, size.y,
      color[0], color[1], color[2]
    )

    const velocity = this.velocity

    const vector = velocity.scaled(0.1)

    frame
      .drawLine(0, 0, vector.x, 0, '#e06c75', 3)
      .drawLine(0, 0, 0, vector.y, '#98c379', 3)
      .drawLine(0, 0, vector.x, vector.y, '#e5c07b', 3)
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

    if (keyboard.isKeyDown('a')) horizontalDirection--
    if (keyboard.isKeyDown('d')) horizontalDirection++

    if (keyboard.isKeyDown('space') || keyboard.isKeyDown('w')) verticalDirection--
    if (keyboard.isKeyDown('shift') || keyboard.isKeyDown('s')) verticalDirection++

    return new Vec2(horizontalDirection, verticalDirection)
  }

  protected move (delta: number): void {
    const physics = this.physics

    const velocity = this.velocity

    if (this.controllable) {
      const direction = this.getUserInputDirection()

      // velocity += direction * speed
      velocity.add(direction.scaled(new Vec2(25000, 12500)).scaled(delta))
    }

    // velocity.y += gravity
    if (Debug.player.gravity) {
      velocity.y += 3750 * delta
    }

    // Friction
    velocity.x /= 1 + (FRICTION.x * delta)
    velocity.y /= 1 + (FRICTION.y * delta)

    const position = physics.position

    const oldPosition = position.clone()

    const scaledVelocity = velocity.scaled(delta)

    if (Debug.player.collision) {
      physics.moveSlide(scaledVelocity)
    } else {
      physics.position.add(scaledVelocity)
    }

    const positionDelta = position.minus(oldPosition)

    const newVelocity = positionDelta.divided(delta)

    velocity.update(newVelocity)

    this.position.update(position)
  }
}

export default PlayerEntity

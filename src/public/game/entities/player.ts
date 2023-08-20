import type Frame from '../../engine/util/frame'
import Entity from '../../engine/entities'
import Vec2 from '../../engine/util/vec2'
import keyboard from '../../engine/util/input/keyboard'
import RectangularCollider from '../../engine/util/collision/rectangular'
import { type Color } from '../util/types'
import { type OverlapDetector, PhysicsObject } from '../util/physics'
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

    const delta = velocity.scaled(0.1)

    frame
      .drawLine(0, 0, delta.x, 0, '#e06c75', 3)
      .drawLine(0, 0, 0, delta.y, '#98c379', 3)
      .drawLine(0, 0, delta.x, delta.y, '#e5c07b', 3)
  }

  public update (delta: number): void {
    this.move(delta)

    if (keyboard.isKeyDown('c')) throw new Error('c was pressed')

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
    velocity.y += 3750 * delta

    // Friction
    velocity.x /= 1 + (FRICTION.x * delta)
    velocity.y /= 1 + (FRICTION.y * delta)

    const position = physics.position

    const oldPosition = position.clone()

    physics.moveSlide(velocity.scaled(delta))

    const positionDelta = position.minus(oldPosition)

    const newVelocity = positionDelta.divided(delta)

    velocity.update(newVelocity)

    this.position.update(position)
  }
}

export default PlayerEntity

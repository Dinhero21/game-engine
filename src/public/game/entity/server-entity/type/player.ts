import type Frame from '../../../../engine/util/frame'
import ServerEntityEntity from './base'
import Vec2 from '../../../../engine/util/vec2'
import keyboard from '../../../../engine/util/input/keyboard'
import RectangularCollider from '../../../../engine/util/collision/rectangular'
import { type Color } from '../../../util/types'
import { PhysicsObject } from '../../../util/physics'
import { Debug } from '../../../../globals'
import socket from '../../../socket.io'
import Alea from 'alea'

const FRICTION = new Vec2(32, 4)

export class ServerPlayerEntity extends ServerEntityEntity {
  public velocity = Vec2.ZERO

  public controllable: boolean = false

  protected color: Color

  constructor (id: string) {
    super(id)

    const prng = Alea(id)

    this.color = [
      prng() > 0.5 ? 0xFF : 0x00,
      prng() > 0.5 ? 0xFF : 0x00,
      prng() > 0.5 ? 0xFF : 0x00
    ]
  }

  protected isOverlapping (collider: RectangularCollider): boolean {
    const world = this.world

    if (world === undefined) return false

    return world.overlapping(collider)
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
      const scene = this.getRoot()

      if (scene === undefined) return

      const camera = scene.camera

      camera.position = this.position
    }
  }

  public acceleration = Vec2.ZERO

  protected getAcceleration (): Vec2 {
    if (!this.controllable) return this.acceleration

    let x = 0
    let y = 0

    if (keyboard.isKeyDown('a')) x -= 16
    if (keyboard.isKeyDown('d')) x += 16

    if (keyboard.isKeyDown('space') || keyboard.isKeyDown('w')) y -= 12
    if (keyboard.isKeyDown('shift') || keyboard.isKeyDown('s')) y += 3

    return new Vec2(x, y)
  }

  protected move (delta: number): void {
    const physics = this.physics

    const velocity = this.velocity

    const kilodelta = delta * 1000

    const acceleration = this.getAcceleration()

    this.acceleration = acceleration

    // velocity += acceleration * delta
    velocity.add(acceleration.scaled(kilodelta))

    // velocity.y += gravity
    if (Debug.player.gravity) {
      velocity.y += 3.75 * kilodelta
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

    if (this.controllable) {
      socket.emit(
        'physics.update',
        this.position.toArray(),
        this.velocity.toArray(),
        this.acceleration.toArray()
      )
    }
  }
}

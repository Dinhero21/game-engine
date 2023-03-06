import type Frame from '../frame.js'
import Vec2 from '../vec2.js'

export class Entity {
  public position: Vec2 = new Vec2(0, 0)

  public draw (frame: Frame): void {
    frame.drawFancyRectRGBA(0, 0, 256, 256, 0x61, 0xAF, 0xEF)
  }

  public update (delta: number): void {
    this.position.x += delta * 10
  }
}

export default Entity

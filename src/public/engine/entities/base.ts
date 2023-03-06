import Frame from '../frame.js'
import Vec2 from '../vec2.js'

export class Entity {
  private readonly offset = Math.random()

  private frame = 0

  public position: Vec2 = new Vec2(0, 0)

  // Entity relationship

  public children: Entity[] = []

  public draw (frame: Frame): void {
    this.frame++

    frame.drawFancyRectRGBA(0, 0, 256, 256, 0x61, 0xAF, 0xEF)

    for (const child of this.children) {
      const childFrame = new Frame()
      childFrame.offset = child.position

      child.draw(childFrame)

      childFrame.draw(frame)
    }
  }

  public update (delta: number): void {
    for (const child of this.children) {
      child.update(delta)
    }

    this.position.set(
      (Math.sin(Date.now() / 1000) + 1) * 100,
      (Math.cos(Date.now() / 1000) + 1) * 100
    )
  }
}

export default Entity

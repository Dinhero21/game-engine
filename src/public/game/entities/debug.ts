import type Frame from '../../engine/util/frame.js'
import Vec2 from '../../engine/util/vec2.js'
import Entity from '../../engine/entities/index.js'
import RectangularCollider from '../../engine/util/collision/rectangular.js'

export class DebugEntity extends Entity {
  protected title
  protected size
  protected color: [number, number, number]

  constructor (title: string = 'Debug', size: Vec2 = new Vec2(0, 0)) {
    super()

    this.title = title
    this.size = size

    this.color = [
      [255, 0, 0],
      [0, 255, 0],
      [255, 255, 0],
      [0, 0, 255],
      [255, 0, 255],
      [0, 255, 255]
    ][Math.floor(Math.random() * 6)] as [number, number, number]
  }

  // Collision

  public getConstantCollider (): RectangularCollider {
    const size = this.size

    return new RectangularCollider(new Vec2(0, 0), size)
  }

  // Game Loop

  public update (delta: number): void {
    super.update(delta)
  }

  public draw (frame: Frame): void {
    const position = this.position
    const globalPosition = this.getGlobalPosition()
    const viewportPosition = this.getViewportPosition()

    {
      const collider = this.getConstantCollider()

      const position = collider.getPosition()

      const size = collider.getSize()

      const color = this.color

      frame.drawFancyRectRGBA(position.x, position.y, size.x, size.y, ...color, 0.5)
    }

    frame
      .drawLine(-16, 0, 16, 0, '#e06c75', 4)
      .drawLine(0, -16, 0, 16, '#98c379', 4)

    const lines = [
      this.title,
      `Position: ${Math.floor(position.x)}, ${Math.floor(position.y)}`,
      `Global Position: ${Math.floor(globalPosition.x)}, ${Math.floor(globalPosition.y)}`,
      `Viewport Position: ${Math.floor(viewportPosition.x)}, ${Math.floor(viewportPosition.y)}`
    ]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      frame.drawText(line, 0, 16 * (i + 1), 'white', '16px cursive')
    }
  }
}

export default DebugEntity

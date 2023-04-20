import type Frame from '../../engine/util/frame.js'
import Vec2 from '../../engine/util/vec2.js'
import Entity from '../../engine/entities/index.js'
import RectangularCollider from '../../engine/util/collision/rectangular.js'
import PointCollider from '../../engine/util/collision/point.js'
import mouse from '../../engine/util/input/mouse.js'

export class DebugEntity<ValidChild extends Entity = Entity> extends Entity<ValidChild> {
  protected title
  protected size

  constructor (title: string = 'Debug', size: Vec2 = new Vec2(0, 0)) {
    super()

    this.title = title
    this.size = size
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
    const viewportPosition = this.getViewportPosition();

    (() => {
      const collider = this.getConstantCollider()

      const position = collider.getPosition()

      const size = collider.getSize()

      const mousePosition = mouse.getPosition()

      if (mousePosition === undefined) return

      const viewportCollider = this.getViewportCollider()

      const mouseCollider = new PointCollider(mousePosition)

      // ? Should I make this its own function? (probably something like isMouseColliding)
      if (viewportCollider.overlapping(mouseCollider)) {
        frame.drawFancyRectRGBA(
          position.x,
          position.y,
          size.x,
          size.y,
          0x98,
          0xC3,
          0x78
        )
      } else {
        frame.drawFancyRectRGBA(
          position.x,
          position.y,
          size.x,
          size.y,
          0xE0,
          0x6C,
          0x75
        )
      }
    })()

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
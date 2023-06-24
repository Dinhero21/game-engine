import type Frame from '../../engine/util/frame.js'
import Vec2 from '../../engine/util/vec2.js'
import Entity from '../../engine/entities/index.js'
import RectangularCollider from '../../engine/util/collision/rectangular.js'
import PointCollider from '../../engine/util/collision/point.js'

export interface ConstantRectangularCollidable {
  getConstantCollider: () => RectangularCollider
}

export type DebugCollider = Vec2 | RectangularCollider | ConstantRectangularCollidable | undefined

export class DebugEntity<ValidChild extends Entity = Entity> extends Entity<ValidChild> {
  public title

  protected collider
  protected drawText

  constructor (title: string | string[] = 'Debug', collider: DebugCollider, drawText: boolean = true) {
    super()

    if (collider === undefined) collider = new Vec2(0, 0)
    if ('getConstantCollider' in collider) collider = collider.getConstantCollider()
    if (collider instanceof Vec2) collider = new RectangularCollider(new Vec2(0, 0), collider)

    this.title = title
    this.collider = collider
    this.drawText = drawText
  }

  protected getTitle (): string[] {
    const title = this.title

    if (Array.isArray(title)) return title

    return [title]
  }

  // Collision

  public getConstantCollider (): RectangularCollider {
    return this.collider
  }

  // Game Loop

  public draw (frame: Frame): void {
    super.draw(frame)

    const position = this.position
    const globalPosition = this.getGlobalPosition()
    const viewportPosition = this.getViewportPosition();

    (() => {
      const mousePosition = this.getMouseViewportPosition()

      if (mousePosition === undefined) return

      const viewportCollider = this.getViewportCollider()

      if (viewportCollider === undefined) return

      const constantCollider = this.getConstantCollider()
      const position = constantCollider.getPosition()
      const size = constantCollider.getSize()

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
          0x78,
          1,
          3
        )
      } else {
        frame.drawFancyRectRGBA(
          position.x,
          position.y,
          size.x,
          size.y,
          0xE0,
          0x6C,
          0x75,
          1,
          3
        )
      }
    })()

    frame
      .drawLine(-16, 0, 16, 0, '#e06c75', 3)
      .drawLine(0, -16, 0, 16, '#98c379', 3)

    const lines = this.getTitle();

    (() => {
      if (!this.drawText) return

      lines.push(
        `Position: ${Math.floor(position.x)}, ${Math.floor(position.y)}`,
        `Global Position: ${Math.floor(globalPosition.x)}, ${Math.floor(globalPosition.y)}`,
        `Viewport Position: ${Math.floor(viewportPosition.x)}, ${Math.floor(viewportPosition.y)}`
      )

      const mousePosition = this.getMouseViewportPosition()

      if (mousePosition === undefined) return

      const viewportCollider = this.getViewportCollider()

      if (viewportCollider === undefined) return

      const mouseCollider = new PointCollider(mousePosition)

      lines.push(`Mouse Distance: ${Math.floor(viewportCollider.distance(mouseCollider))}`)
    })()

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      frame.drawText(line, 0, 16 * (i + 1), 'white', '16px cursive')
    }
  }
}

export default DebugEntity

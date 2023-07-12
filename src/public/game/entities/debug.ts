import type Frame from '../../engine/util/frame'
import Vec2 from '../../engine/util/vec2'
import Entity from '../../engine/entities'
import RectangularCollider from '../../engine/util/collision/rectangular'
import PointCollider from '../../engine/util/collision/point'

export interface ConstantRectangularCollidable {
  getConstantCollider: () => RectangularCollider
}

export type DebugCollider = Vec2 | RectangularCollider | ConstantRectangularCollidable

export class DebugEntity<ValidChild extends Entity = Entity> extends Entity<ValidChild> {
  public title

  protected drawText

  constructor (title: string = 'Debug', collider: DebugCollider = new Vec2(0, 0), drawText: boolean = true) {
    super()

    let getCollider: () => RectangularCollider

    if ('getConstantCollider' in collider) getCollider = () => collider.getConstantCollider()
    else if (collider instanceof RectangularCollider) getCollider = () => collider
    // TODO: Stop instantiating a new RectangularCollider every time getCollider is called
    else getCollider = () => new RectangularCollider(new Vec2(0, 0), collider)

    this.title = title
    this.getConstantCollider = getCollider
    this.drawText = drawText
  }

  protected getTitle (): string[] {
    const title = this.title

    return title.split('\n')
  }

  // Collision

  public getConstantCollider: () => RectangularCollider

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

      frame.drawText(line, 0, 16 * (i + 1), 'white', '16px monospace')
    }
  }
}

export default DebugEntity

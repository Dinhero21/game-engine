import type Frame from '../../engine/util/frame.js'
import type Vec2 from '../../engine/util/vec2.js'
import Entity from '../../engine/entities/index.js'
import RectangularCollider from '../../engine/util/collision/rectangular.js'

export class DebugEntity extends Entity {
  protected title
  protected size
  protected color: [number, number, number]

  constructor (title: string = 'Debug', size?: Vec2) {
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

  public getBoundingBox (): RectangularCollider | null {
    const size = this.size

    if (size === undefined) return null

    const globalPosition = this.getGlobalPosition()

    return new RectangularCollider(globalPosition, size)
  }

  public draw (frame: Frame): void {
    const position = this.position
    const globalPosition = this.getGlobalPosition()
    const viewportPosition = this.getViewportPosition()

    const boundingBox = this.getBoundingBox()

    if (boundingBox !== null) {
      const size = boundingBox.getSize()

      frame.drawFancyRectRGBA(0, 0, size.x, size.y, this.color[0], this.color[1], this.color[2], 0.5)
    }

    frame
      .drawLine(-16, 0, 16, 0, '#e06c75', 4)
      .drawLine(0, -16, 0, 16, '#98c379', 4)

    const lines = [
      this.title,
      `Position: ${position.x}, ${position.y}`,
      `Global Position: ${globalPosition.x}, ${globalPosition.y}`,
      `Viewport Position: ${viewportPosition.x}, ${viewportPosition.y}`
    ]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      frame.drawText(line, 0, 16 * (i + 1), 'white', '16px cursive')
    }
  }
}

export default DebugEntity

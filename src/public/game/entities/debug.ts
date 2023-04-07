import Entity from '../../engine/entities/index.js'
import type Frame from '../../engine/util/frame.js'

export class DebugEntity extends Entity {
  protected name

  constructor (name: string = 'Debug') {
    super()

    this.name = name
  }

  public draw (frame: Frame): void {
    const position = this.position
    const globalPosition = this.getGlobalPosition()
    const viewportPosition = this.getViewportPosition()

    frame
      .drawLine(-16, 0, 16, 0, '#e06c75', 4)
      .drawLine(0, -16, 0, 16, '#98c379', 4)

    const lines = [
      this.name,
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

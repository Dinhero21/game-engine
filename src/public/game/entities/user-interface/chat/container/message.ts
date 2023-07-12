import TextEntity from '../../../../../engine/entities/text'
import type Frame from '../../../../../engine/util/frame'

const FADE_TIME = 1

export class ChatMessageEntity extends TextEntity {
  public update (delta: number): void {
    super.update(delta)

    if (this.opacity <= 0) this.parent?.removeChild(this)

    if (!this.fadingOut) return

    this.opacity -= delta / FADE_TIME
  }

  public draw (frame: Frame): void {
    const collider = this.getConstantCollider()
    const position = collider.getPosition()
    const size = collider.getSize()

    const opacity = this.opacity

    frame.drawRectRGBA(
      position.x,
      position.y,
      size.x,
      size.y,
      0,
      0,
      0,
      0.25 * opacity
    )

    this.fillStyle = `rgba(255,255,255,${opacity})`

    super.draw(frame)
  }

  protected fadingOut: boolean = false
  protected opacity: number = 1

  public fadeOut (): void {
    this.fadingOut = true
  }
}

export default ChatMessageEntity

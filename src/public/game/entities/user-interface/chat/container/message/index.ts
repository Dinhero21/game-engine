import type Frame from '../../../../../../engine/util/frame'
import ChatMessageTextEntity from './text'
import HorizontalContainerEntity from '../../../../../../engine/entities/horizontal-container'
import { type TextOptions } from '../../../../../../engine/entities/text'
import Vec2 from '../../../../../../engine/util/vec2'
import { merge } from 'lodash'

const FADE_TIME = 1

export type Text = string
export type Overflow = Text | undefined

export class ChatMessageEntity extends HorizontalContainerEntity<ChatMessageTextEntity> {
  protected options

  constructor (options: TextOptions) {
    super(0, new Vec2(0, 0))

    this.options = options
  }

  protected isOverflowing (entity: ChatMessageTextEntity): boolean {
    const options = this.options

    const maxWidth = options.maxWidth

    if (maxWidth === undefined) return false

    entity.configureContext()

    const collider = entity.getConstantCollider()
    const size = collider.getSize()
    const width = size.x

    return width > maxWidth
  }

  public addText (text: Text, options?: Partial<TextOptions>): Overflow {
    const fullOptions = structuredClone(this.options)

    if (options !== undefined) merge(fullOptions, options)

    const entity = new ChatMessageTextEntity({
      ...fullOptions,
      maxWidth: undefined
    })
    this.addChild(entity)

    entity.text = text

    if (!this.isOverflowing(entity)) return

    // TODO: Binary Search

    let lastText = entity.text

    for (let i = 0; i < text.length; i++) {
      lastText = entity.text
      entity.text = text.substring(0, i)

      if (this.isOverflowing(entity)) break
    }

    entity.text = lastText

    return text.substring(lastText.length)
  }

  public update (delta: number): void {
    super.update(delta)

    if (!this.fadingOut) return

    this.opacity -= delta / FADE_TIME

    const opacity = this.opacity

    for (const child of this.children) {
      child.fillStyle = `rgba(255,255,255,${opacity})`
    }

    if (opacity <= 0) this.parent?.removeChild(this)
  }

  public draw (frame: Frame): void {
    const collider = this.getConstantCollider()
    const position = collider.getPosition()
    const size = collider.getSize()

    const options = this.options
    const width = options.width

    const opacity = this.opacity

    frame.drawRectRGBA(
      position.x, position.y,
      width ?? size.x, size.y,
      0, 0, 0, 0.25 * opacity
    )

    super.draw(frame)
  }

  protected fadingOut: boolean = false
  protected opacity: number = 1

  public fadeOut (): void {
    this.fadingOut = true
  }
}

export default ChatMessageEntity

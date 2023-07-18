import ChatMessageEntity, { type Overflow } from './message'
import { type TextOptions } from '../../../../../engine/entities/text'
import VerticalContainerEntity from '../../../../../engine/entities/vertical-container'
import align from '../../../../../engine/patches/align'
import Vec2 from '../../../../../engine/util/vec2'

export class ChatMessageContainerEntity extends VerticalContainerEntity<ChatMessageEntity> {
  private readonly options

  constructor (options: TextOptions) {
    super(0, new Vec2(0, 0))

    this.options = options

    align(this, new Vec2(0, 1), true)
  }

  public addMessage (text: string): void {
    const options = this.options

    let overflow: Overflow = text

    while (overflow !== undefined && overflow.length > 0) {
      const entity = new ChatMessageEntity(options)
      this.addChild(entity)

      overflow = entity.addText(overflow)

      setTimeout(() => {
        entity.fadeOut()
      }, 5000)
    }
  }
}

export default ChatMessageContainerEntity

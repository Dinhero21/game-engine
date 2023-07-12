import { type TextOptions } from '../../../../engine/entities/text'
import ChatTextInputEntity from './container/text-input'
import ChatMessageContainerEntity from './container'
import VerticalContainerEntity from '../../../../engine/entities/vertical-container'
import align from '../../../../engine/patches/align'
import Vec2 from '../../../../engine/util/vec2'

export class ChatEntity extends VerticalContainerEntity<ChatMessageContainerEntity | ChatTextInputEntity> {
  public readonly container
  public readonly input

  constructor (options: TextOptions) {
    super(8, new Vec2(32, 32))

    align(this, new Vec2(0, 1), true)

    const container = new ChatMessageContainerEntity(options)
    this.addChild(container)

    this.container = container

    const input = new ChatTextInputEntity(options)
    this.addChild(input)

    this.input = input
  }
}

export default ChatEntity

import ChatMessageContainerEntity from './container'
import ChatTextInputEntity, { type TextInputOptions } from './container/text-input'
import VerticalContainerEntity from '../../../../engine/entity/container/vertical'
import align from '../../../../engine/patch/align'
import Vec2 from '../../../../engine/util/vec2'

export class ChatEntity extends VerticalContainerEntity<ChatMessageContainerEntity | ChatTextInputEntity> {
  public readonly container
  public readonly input

  constructor (options: TextInputOptions) {
    super(0, Vec2.ZERO)

    align(this, Vec2.DOWN, true)

    const container = new ChatMessageContainerEntity(options)
    this.addChild(container)

    this.container = container

    const input = new ChatTextInputEntity(options)
    this.addChild(input)

    this.input = input
  }
}

export default ChatEntity

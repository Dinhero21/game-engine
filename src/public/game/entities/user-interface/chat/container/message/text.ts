import TextEntity, { type TextOptions } from '../../../../../../engine/entities/text'

export class ChatMessageTextEntity extends TextEntity {
  public opacity: number = 1

  constructor (options: TextOptions) {
    super({
      ...options,
      width: undefined
    })
  }

  public update (delta: number): void {
    super.update(delta)
  }
}

export default ChatMessageTextEntity

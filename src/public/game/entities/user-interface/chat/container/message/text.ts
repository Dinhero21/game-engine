import TextEntity, { type TextOptions } from '../../../../../../engine/entities/text'

export class ChatMessageTextEntity extends TextEntity {
  constructor (options: TextOptions) {
    super({
      ...options,
      width: undefined
    })
  }
}

export default ChatMessageTextEntity

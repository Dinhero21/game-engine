import TextEntity, { type TextOptions } from '../../../../../../engine/entity/text'

export class ChatMessageTextEntity extends TextEntity {
  constructor (options: TextOptions) {
    super({
      ...options,
      width: undefined
    })
  }
}

export default ChatMessageTextEntity

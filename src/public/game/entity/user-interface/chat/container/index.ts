import ChatMessageEntity, { type Text, type Overflow } from './message'
import { type TextOptions } from '../../../../../engine/entity/text'
import VerticalContainerEntity from '../../../../../engine/entity/vertical-container'
import align from '../../../../../engine/patch/align'
import Vec2 from '../../../../../engine/util/vec2'
import { MarkupParser } from '../../../../util/chat'
import { set } from 'lodash'

const parser = new MarkupParser({
  dataParser (data) {
    const sections = data.split(':')

    const sectionCount = sections.length
    if (sectionCount !== 2) throw new SyntaxError(`Malformed chat message : Expected 2 sections, got ${sectionCount}`)

    const rawKey = sections[0]
    const key = rawKey.split('.')
    let value: string | number = sections[1]

    const numberValue = Number(value)

    if (!isNaN(numberValue)) value = numberValue

    return { key, value }
  }
})

export class ChatMessageContainerEntity extends VerticalContainerEntity<ChatMessageEntity> {
  private readonly options

  constructor (options: TextOptions) {
    super(0, new Vec2(0, 0))

    this.options = options

    align(this, new Vec2(0, 1), true)
  }

  public appendText (text: string, options?: Partial<TextOptions>): void {
    let overflow: Overflow = text;

    (() => {
      const children = this.getChildren()
      const lastChild = children[children.length - 1]

      if (lastChild === undefined) return

      overflow = lastChild.addText(overflow, options)
    })()

    while (overflow !== undefined) {
      const entity = new ChatMessageEntity(this.options)
      this.addChild(entity)

      overflow = entity.addText(overflow, options)

      setTimeout(() => {
        entity.fadeOut()
      }, 5000)
    }
  }

  public appendLine (options: TextOptions): ChatMessageEntity {
    const entity = new ChatMessageEntity(options)
    this.addChild(entity)

    setTimeout(() => {
      entity.fadeOut()
    }, 5000)

    return entity
  }

  public addMessage (raw: Text): void {
    const components = parser.getComponents(raw)

    let options = this.options
    options = structuredClone(options)

    this.appendLine(options)

    for (const component of components) {
      switch (component.type) {
        case 'data':
          const data = component.data
          const { key, value } = data

          set(options, key, value)
          break
        case 'text':
          this.appendText(component.text, options)
          break
      }
    }
  }
}

export default ChatMessageContainerEntity

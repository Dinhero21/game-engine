import json5 from 'json5'

export interface RawChatMessageComponent {
  type: 'data' | 'text'
  buffer: string
}

export interface TextChatMessageComponent {
  type: 'text'
  text: string
}

export interface KeyData<Value, Key extends string = string> {
  key: Key
  value: Key extends keyof Value ? Value[Key] : unknown
}

export interface DataChatMessageComponent<Data> {
  type: 'data'
  data: Data
}

export type ChatMessageComponent<Data> = TextChatMessageComponent | DataChatMessageComponent<Data>

export interface MarkupOptions<Data> {
  openingCharacter?: string
  closingCharacter?: string
  dataParser?: (data: string) => Data
}

export class MarkupParser<Data> {
  public readonly openingCharacter
  public readonly closingCharacter
  public readonly parseDataComponent

  constructor (options: MarkupOptions<Data>) {
    this.openingCharacter = options.openingCharacter ?? '{'
    this.closingCharacter = options.closingCharacter ?? '}'
    this.parseDataComponent = options.dataParser ?? json5.parse
  }

  * getRawComponents (raw: string): Generator<RawChatMessageComponent, void, unknown> {
    const openingCharacter = this.openingCharacter
    const closingCharacter = this.closingCharacter

    let depth = 0

    let buffer = ''

    while (raw.length > 0) {
      const character = raw[0]
      raw = raw.slice(1)

      const oldDepth = depth

      switch (character) {
        case openingCharacter:
          depth++
          break
        case closingCharacter:
          depth--
          break
      }

      // Start (text)
      if (oldDepth === 0 && depth === 1) {
        yield {
          type: 'text',
          buffer
        }

        buffer = ''

        continue
      }

      // End (data)
      if (oldDepth === 1 && depth === 0) {
        yield {
          type: 'data',
          buffer
        }

        buffer = ''

        continue
      }

      buffer += character
    }

    if (depth !== 0) throw new TypeError(`Premature end of chat message, depth was ${depth}`)

    yield {
      type: 'text',
      buffer
    }
  }

  * getComponents (raw: string): Generator<ChatMessageComponent<Data>, void, unknown> {
    for (const component of this.getRawComponents(raw)) {
      const type = component.type
      const buffer = component.buffer

      switch (type) {
        case 'data':
          yield {
            type: 'data',
            data: this.parseDataComponent(buffer)
          }
          break
        case 'text':
          yield {
            type: 'text',
            text: buffer
          }
          break
        default:
          throw new Error(`Unknown chat message component type ${JSON.stringify(type)}`)
      }
    }
  }
}

import type Frame from '../../../../../engine/util/frame'
import type Vec2 from '../../../../../engine/util/vec2'
import TextEntity, { type TextOptions } from '../../../../../engine/entities/text'
import { TypedEventTarget } from '../../../../../engine/util/typed-event-target'

export class TextInputEvent extends Event {
  constructor () {
    super('input')
  }
}

export interface TextInputManagerEventMap {
  input: TextInputEvent
}

export class TextInputManager extends TypedEventTarget<TextInputManagerEventMap> {}

export interface TextInputOptions extends TextOptions {
  prefix?: string
}

// TODO: Follow text (when your text is bigger than the canvas, offset the text so the end will be always visible.)
export class ChatTextInputEntity extends TextEntity {
  public active: boolean = false

  public prefix = '> '

  public readonly manager = new TextInputManager()

  constructor (options: TextInputOptions) {
    super({
      ...options,
      maxWidth: undefined
    })

    if (options.prefix !== undefined) this.prefix = options.prefix

    // TODO: Stop using capture instead of actually implementing a way of prepending (keyboard) listeners

    window.addEventListener('keyup', event => {
      if (!this.active) return

      event.stopImmediatePropagation()
      event.stopPropagation()
    }, {
      capture: true
    })

    window.addEventListener('keydown', event => {
      if (!this.active) return

      event.stopImmediatePropagation()
      event.stopPropagation()

      let key = event.key

      switch (key) {
        case 'Unidentified':
          key = '�'
          break

        // Modifier keys
        case 'Alt':
        case 'AltGraph':
        case 'CapsLock':
        case 'Control':
        case 'Fn':
        case 'FnLock':
        case 'Hyper':
        case 'Meta':
        case 'NumLock':
        case 'ScrollLock':
        case 'Shift':
        case 'Super':
        case 'Symbol':
        case 'SymbolLock':
          break

        // Whitespace keys
        case 'Enter':
          this.flush()
          break
        case 'Tab':
          break

        // Navigation keys
        // TODO: Arrow keys (moving the cursor)
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'End':
        case 'Home':
        case 'PageDown':
        case 'PageUp':
          break

        // Editing keys
        case 'Backspace':
          this.text = this.text.slice(0, -1)
          break
        // TODO: These keys (Andrew didn't so why should I)
        case 'Clear':
        case 'Copy':
        case 'CrSel':
        case 'Cut':
        case 'Delete':
        case 'EraseEof':
        case 'ExSel':
        case 'Insert':
        case 'Paste':
        case 'Redo':
        case 'Undo':
          break

        // * I have some *nice* ideas for these
        // Function keys
        case 'F1':
        case 'F2':
        case 'F3':
        case 'F4':
        case 'F5':
        case 'F6':
        case 'F7':
        case 'F8':
        case 'F9':
        case 'F10':
        case 'F11':
        case 'F12':
        case 'F13':
        case 'F14':
        case 'F15':
        case 'F16':
        case 'F17':
        case 'F18':
        case 'F19':
        case 'F20':
        case 'Soft1':
        case 'Soft2':
        case 'Soft3':
        case 'Soft4':
          break

        case 'Escape':
          break

        case 'Dead':
          break

        default:
          this.text += key
          break
      }
    }, {
      capture: true
    })
  }

  protected clear (): void {
    this.text = ''
  }

  protected emitInputEvent (): void {
    this.manager.dispatchTypedEvent('input', new TextInputEvent())
  }

  protected flush (): void {
    this.emitInputEvent()
    this.clear()
  }

  public disable (): void {
    this.clear()
    this.active = false
  }

  public enable (): void {
    this.active = true
  }

  public draw (frame: Frame): void {
    // ? Should I cancel super.draw? I only want to stop the text from being drawn and not children.
    // ? A better way of doing this might be to just set the text to an empty string or something of
    // ? that nature but `TextEntity`s are not supposed to have children so Entity.draw should never
    // ? have to draw anything which makes cancelling it not an issue.

    if (!this.active) return

    const collider = this.getConstantCollider()
    const position = collider.getPosition()
    const size = collider.getSize()

    frame.drawRectRGBA(
      position.x, position.y,
      size.x, size.y,
      0, 0, 0, 0.25
    )

    const prefix = this.prefix

    const text = this.text

    this.text = `${prefix}${text}`

    super.draw(frame)

    this.text = text
  }

  // TODO: Make this not bound to a ChatTextInputEntity
  // Ideas:
  //   1. Make this "injectable" via a patch or maybe even something simpler
  //   2. Make this bound to a TextEntity
  // ? ^ Bad Idea?

  protected getTextPosition (): Vec2 {
    const textPosition = super.getTextPosition()

    const boundingBox = this.getTextBoundingBox()

    if (boundingBox === undefined) return textPosition

    const width = this.width

    if (width === undefined) return textPosition

    const boundingBoxPositon = boundingBox.getPosition()
    const boundingBoxSize = boundingBox.getSize()

    const right = boundingBoxPositon.x + boundingBoxSize.x

    const overflow = width - right

    // For the python people:
    // if overflowing:
    //   don't
    textPosition.x += Math.min(0, overflow)

    return textPosition
  }
}

export default ChatTextInputEntity

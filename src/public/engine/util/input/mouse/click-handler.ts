import mouse, { type MouseButtonId, type MouseButtonName, MouseButtonMap, type MouseGlobalEventMap, type MouseMoveEvent, type MouseDownEvent, type MouseUpEvent } from './index.js'
import { TypedEventTarget } from '../../typed-event-target.js'
import { EventFrame } from '../../event.js'

export type MouseEvent = MouseMoveEvent | MouseDownEvent | MouseUpEvent

export type ButtonEmitter = TypedEventTarget<MouseGlobalEventMap>

export type ButtonMap<T> = Map<MouseButtonId, T>

export type ClickState = 'up' | 'down'

export type ClickStates = ButtonMap<ClickState>

export interface ClickHandlerEventMap extends Record<`${MouseButtonName}.${ClickState}`, ClickHandlerEvent> {
  'enter': ClickHandlerEvent
  'exit': ClickHandlerEvent
}

export class ClickHandlerEvent extends Event {
  public readonly original

  constructor (name: keyof ClickHandlerEventMap, original: MouseEvent) {
    super(name)

    this.original = original
  }
}

export class ClickHandler extends TypedEventTarget<ClickHandlerEventMap> {
  private readonly _isMouseInside
  private readonly frame

  private readonly clickStates: ButtonMap<ClickState> = new Map()

  private inside: boolean = false

  constructor (isMouseInside: () => boolean, emitter: ButtonEmitter = mouse) {
    super()

    this._isMouseInside = isMouseInside

    const frame = new EventFrame(emitter) as typeof emitter & EventFrame<typeof emitter>
    this.frame = frame

    frame.addEventListener('down', event => {
      if (!this._isMouseInside()) return

      const id = event.button

      this.setClickState(id, 'down', event)
    })

    frame.addEventListener('up', event => {
      if (!this._isMouseInside()) return

      const id = event.button

      if (this.getClickState(id) === 'down') this.setClickState(id, 'up', event)
    })

    frame.addEventListener('move', event => {
      const inside = this._isMouseInside()

      const oldInside = this.inside

      if (oldInside === inside) return

      this.setInside(inside, event)
    })

    this.addEventListener('exit', () => {
      const clicks = this.clickStates

      clicks.clear()
    })
  }

  public isMouseInside (): boolean {
    return this.inside
  }

  private setInside (inside: boolean, original: MouseEvent): void {
    this.inside = inside

    this.dispatchTypedEvent<'enter' | 'exit'>(inside ? 'enter' : 'exit', new ClickHandlerEvent(inside ? 'enter' : 'exit', original))
  }

  public getClickState (button: MouseButtonId): ClickState | undefined {
    const clicks = this.clickStates

    return clicks.get(button)
  }

  private setClickState (button: MouseButtonId, state: ClickState, original: MouseEvent): void {
    for (const [name, id] of Object.entries(MouseButtonMap) as Array<[MouseButtonName, MouseButtonId]>) {
      if (id === button) this.dispatchTypedEvent<`${typeof name}.${typeof state}`>(`${name}.${state}`, new ClickHandlerEvent(`${name}.${state}`, original))
    }

    const clicks = this.clickStates

    clicks.set(button, state)
  }

  public free (): this {
    this.frame.free()

    return this
  }
}

export default ClickHandler

export interface IButton {
  manager: ClickHandler
}

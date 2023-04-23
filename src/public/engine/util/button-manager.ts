import mouse, { type MouseButtonId, type MouseButtonName, MouseButtonMap } from './input/mouse.js'
import { TypedEventTarget } from './typed-event-target.js'

export type ButtonMap<T> = Map<MouseButtonId, T>

export type ClickState = 'up' | 'down'

export type ClickStates = ButtonMap<ClickState>

export interface ButtonManagerEventMap extends Record<`${MouseButtonName}.${ClickState}`, Event> {
  'enter': Event
  'exit': Event
}

export class ButtonManager extends TypedEventTarget<ButtonManagerEventMap> {
  private readonly _isMouseInside

  private inside: boolean = false

  private readonly clickStates: ButtonMap<ClickState> = new Map()

  constructor (isMouseInside: () => boolean) {
    super()

    this._isMouseInside = isMouseInside

    mouse.addEventListener('down', event => {
      if (!this._isMouseInside()) { return }

      const id = event.button

      this.setClickState(id, 'down')
    })

    mouse.addEventListener('up', event => {
      if (!this._isMouseInside()) { return }

      const id = event.button

      if (this.getClickState(id) === 'down') { this.setClickState(id, 'up') }
    })

    mouse.addEventListener('move', event => {
      const inside = this._isMouseInside()

      const oldInside = this.inside

      if (oldInside === inside) { return }

      this.setInside(inside)
    })

    this.addEventListener('exit', () => {
      const clicks = this.clickStates

      clicks.clear()
    })
  }

  public isMouseInside (): boolean {
    return this.inside
  }

  private setInside (inside: boolean): void {
    this.inside = inside

    this.dispatchTypedEvent<'enter' | 'exit'>(inside ? 'enter' : 'exit', new Event(inside ? 'enter' : 'exit'))
  }

  public getClickState (button: MouseButtonId): ClickState | undefined {
    const clicks = this.clickStates

    return clicks.get(button)
  }

  private setClickState (button: MouseButtonId, state: ClickState): void {
    for (const [name, id] of Object.entries(MouseButtonMap) as Array<[MouseButtonName, MouseButtonId]>) {
      if (id === button) { this.dispatchTypedEvent<`${typeof name}.${typeof state}`>(`${name}.${state}`, new Event(`${name}.${state}`)) }
    }

    const clicks = this.clickStates

    clicks.set(button, state)
  }
}

export default ButtonManager

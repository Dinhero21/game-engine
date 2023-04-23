import { TypedEventTarget } from '../typed-event-target.js'
import Vec2 from '../vec2.js'

export const MouseButtonMap = {
  primary: 0,
  main: 0,
  left: 0,
  auxiliary: 1,
  wheel: 1,
  middle: 1,
  secondary: 2,
  right: 2,
  fourth: 3,
  back: 3,
  fifth: 4,
  forward: 4
} as const

export type MouseButtonName = keyof typeof MouseButtonMap
export type MouseButtonId = typeof MouseButtonMap[MouseButtonName]

export class MouseMoveEvent extends Event {
  public position: Vec2

  constructor (position: Vec2) {
    super('move')

    this.position = position
  }
}

export class MouseDownEvent extends Event {
  public button: MouseButtonId

  constructor (button: MouseButtonId | MouseButtonName) {
    if (typeof button === 'string') {
      super(`${button}.down`)

      button = MouseButtonMap[button]
    } else super('down')

    this.button = button
  }
}

export class MouseUpEvent extends Event {
  public button: MouseButtonId

  constructor (button: MouseButtonId | MouseButtonName) {
    if (typeof button === 'string') {
      super(`${button}.up`)

      button = MouseButtonMap[button]
    } else super('up')

    this.button = button
  }
}

type DownButtonEventMap<ButtonName extends MouseButtonName = MouseButtonName> = Record<`${ButtonName}.down`, MouseDownEvent>
type UpButtonEventMap<ButtonName extends MouseButtonName = MouseButtonName> = Record<`${ButtonName}.up`, MouseUpEvent>
type ButtonEventMap = DownButtonEventMap & UpButtonEventMap

interface EventMap extends ButtonEventMap {
  'move': MouseMoveEvent
  'down': MouseDownEvent
  'up': MouseUpEvent
}

export class Mouse extends TypedEventTarget<EventMap> {
  constructor () {
    super()

    window.addEventListener('mousemove', event => { this.onMouseMove(event) })

    window.addEventListener('mousedown', event => { this.onMouseDown(event) })
    window.addEventListener('mouseup', event => { this.onMouseUp(event) })
  }

  private readonly position = new Vec2(0, 0)
  public getPosition (): Vec2 {
    return this.position
  }

  private onMouseMove (event: MouseEvent): void {
    const x = event.clientX
    const y = event.clientY

    const position = new Vec2(x, y)

    this.dispatchTypedEvent('move', new MouseMoveEvent(position))

    this.position.update(position)
  }

  private readonly buttons = new Map<MouseButtonId, boolean>()
  public isButtonDown (button: MouseButtonId | MouseButtonName): boolean {
    if (typeof button === 'string') button = MouseButtonMap[button]

    return this.buttons.get(button) ?? false
  }

  private onMouseDown (event: MouseEvent): void {
    const button = event.button as MouseButtonId

    for (const [name, id] of Object.entries(MouseButtonMap) as Array<[MouseButtonName, MouseButtonId]>) {
      if (id === button) this.dispatchTypedEvent<`${typeof name}.down`>(`${name}.down`, new MouseDownEvent(name))
    }

    this.dispatchTypedEvent('down', new MouseDownEvent(button))

    this.buttons.set(button, true)
  }

  private onMouseUp (event: MouseEvent): void {
    const button = event.button as MouseButtonId

    for (const [name, id] of Object.entries(MouseButtonMap) as Array<[MouseButtonName, MouseButtonId]>) {
      if (id === button) this.dispatchTypedEvent<`${typeof name}.up`>(`${name}.up`, new MouseUpEvent(name))
    }

    this.dispatchTypedEvent('up', new MouseUpEvent(button))

    this.buttons.set(button, false)
  }
}

export default new Mouse()

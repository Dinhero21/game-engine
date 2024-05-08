import { EventFrame } from '../../event'
import { TypedEventTarget } from '../../typed-event-target'
import Vec2 from '../../vec2'

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

export type DownButtonEventMap<ButtonName extends MouseButtonName = MouseButtonName> = Record<`${ButtonName}.down`, MouseDownEvent>
export type UpButtonEventMap<ButtonName extends MouseButtonName = MouseButtonName> = Record<`${ButtonName}.up`, MouseUpEvent>
export type ButtonEventMap = DownButtonEventMap & UpButtonEventMap

// TODO: Find a better name for this
export interface MouseGlobalEventMap {
  'move': MouseMoveEvent
  'down': MouseDownEvent
  'up': MouseUpEvent
}

export type MouseEventMap = ButtonEventMap & MouseGlobalEventMap

export type MouseEventEmitterEventMap = Record<`mouse${'move' | 'down' | 'up'}`, MouseEvent>

type MouseEventListener = (evt: MouseEvent) => void

interface MouseEventListenerObject {
  handleEvent: (object: MouseEvent) => void
}

// TODO: Figure out why everything goes wrong if this is an interface
export abstract class MouseEventEmitter extends EventTarget {
  abstract addEventListener (
    type: string,
    callback: MouseEventListener | MouseEventListenerObject | null,
    options?: AddEventListenerOptions | boolean
  ): void

  abstract dispatchEvent (event: MouseEvent): boolean

  abstract removeEventListener (
    type: string,
    callback: MouseEventListener | MouseEventListenerObject | null,
    options?: EventListenerOptions | boolean
  ): void
}

export class Mouse extends TypedEventTarget<MouseEventMap> {
  private readonly frame

  constructor (emitter: MouseEventEmitter = window) {
    super()

    const frame = new EventFrame(emitter) as typeof emitter & EventFrame<typeof emitter>
    this.frame = frame

    frame.addEventListener('mousemove', event => { this.onMouseMove(event) })

    frame.addEventListener('mousedown', event => { this.onMouseDown(event) })
    frame.addEventListener('mouseup', event => { this.onMouseUp(event) })
  }

  private readonly position = Vec2.ZERO
  public getPosition (): Vec2 {
    return this.position
  }

  private onMouseMove (event: MouseEvent): void {
    const x = event.clientX
    const y = event.clientY

    const position = new Vec2(x, y)

    const newEvent = new MouseMoveEvent(position)

    newEvent.stopPropagation = () => {
      event.stopPropagation()
    }

    newEvent.stopImmediatePropagation = () => {
      event.stopImmediatePropagation()
    }

    this.dispatchTypedEvent('move', newEvent)

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
      const newEvent = new MouseDownEvent(name)

      newEvent.stopPropagation = () => {
        event.stopPropagation()
      }

      newEvent.stopImmediatePropagation = () => {
        event.stopImmediatePropagation()
      }

      if (id === button) this.dispatchTypedEvent(`${name}.down`, newEvent)
    }

    const newEvent = new MouseDownEvent(button)

    newEvent.stopPropagation = () => {
      event.stopPropagation()
    }

    newEvent.stopImmediatePropagation = () => {
      event.stopImmediatePropagation()
    }

    this.dispatchTypedEvent('down', newEvent)

    this.buttons.set(button, true)
  }

  private onMouseUp (event: MouseEvent): void {
    const button = event.button as MouseButtonId

    for (const [name, id] of Object.entries(MouseButtonMap) as Array<[MouseButtonName, MouseButtonId]>) {
      const newEvent = new MouseUpEvent(name)

      newEvent.stopPropagation = () => {
        event.stopPropagation()
      }

      newEvent.stopImmediatePropagation = () => {
        event.stopImmediatePropagation()
      }

      if (id === button) this.dispatchTypedEvent(`${name}.up`, newEvent)
    }

    const newEvent = new MouseUpEvent(button)

    newEvent.stopPropagation = () => {
      event.stopPropagation()
    }

    newEvent.stopImmediatePropagation = () => {
      event.stopImmediatePropagation()
    }

    this.dispatchTypedEvent('up', newEvent)

    this.buttons.set(button, false)
  }

  public free (): this {
    this.frame.free()

    return this
  }
}

export default new Mouse()

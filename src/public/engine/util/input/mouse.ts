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

type MouseButtonName = keyof typeof MouseButtonMap
type MouseButtonId = typeof MouseButtonMap[MouseButtonName]

export class MouseMoveEvent extends Event {
  public position: Vec2

  constructor (position: Vec2) {
    super('move')

    this.position = position
  }
}

export class MouseDownEvent extends Event {
  public button: MouseButtonId

  constructor (button: MouseButtonId) {
    super('down')

    this.button = button
  }
}

export class MouseUpEvent extends Event {
  public button: MouseButtonId

  constructor (button: MouseButtonId) {
    super('up')

    this.button = button
  }
}

export class Mouse extends EventTarget {
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

    this.dispatchEvent(new MouseMoveEvent(position))

    this.position.update(position)
  }

  private readonly buttons = new Map<MouseButtonId, boolean>()
  public isButtonDown (button: MouseButtonId | MouseButtonName): boolean {
    if (typeof button === 'string') button = MouseButtonMap[button]

    return this.buttons.get(button) ?? false
  }

  private onMouseDown (event: MouseEvent): void {
    const button = event.button as MouseButtonId

    for (const [name, id] of Object.entries(MouseButtonMap)) {
      if (id === button) this.dispatchEvent(new Event(`${name}.down`))
    }

    this.dispatchEvent(new MouseDownEvent(button))

    this.buttons.set(button, true)
  }

  private onMouseUp (event: MouseEvent): void {
    const button = event.button as MouseButtonId

    for (const [name, id] of Object.entries(MouseButtonMap)) {
      if (id === button) this.dispatchEvent(new Event(`${name}.up`))
    }

    this.dispatchEvent(new MouseUpEvent(button))

    this.buttons.set(button, false)
  }
}

export default new Mouse()

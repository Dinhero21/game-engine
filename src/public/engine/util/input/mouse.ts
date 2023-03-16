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

export class Mouse {
  constructor () {
    window.addEventListener('mousemove', event => { this.onMouseMove(event) })

    window.addEventListener('mousedown', event => { this.onMouseDown(event) })
    window.addEventListener('mouseup', event => { this.onMouseUp(event) })
  }

  private readonly position = new Vec2(0, 0)
  public getPosition (): Vec2 {
    return this.position
  }

  private onMouseMove (event: MouseEvent): void {
    this.position.set(event.clientX, event.clientY)
  }

  private readonly buttons = new Map<MouseButtonId, boolean>()
  public isButtonDown (button: MouseButtonId | MouseButtonName): boolean {
    if (typeof button === 'string') button = MouseButtonMap[button]

    return this.buttons.get(button) ?? false
  }

  private onMouseDown (event: MouseEvent): void {
    this.buttons.set(event.button as MouseButtonId, true)
  }

  private onMouseUp (event: MouseEvent): void {
    this.buttons.set(event.button as MouseButtonId, false)
  }
}

export default new Mouse()

import Vec2 from '../util/vec2.js'
import Entity from './index.js'
import mouse from '../util/input/mouse.js'
import RectangularCollider from '../util/collision/rectangular.js'
import PointCollider from '../util/collision/point.js'

export type ButtonName = 'left' | 'right' | 'middle'

export type ButtonMap<T> = {
  [key in ButtonName]: T
}

export type ClickState = 'none' | 'up' | 'down'

export type ClickStates = ButtonMap<ClickState>

export type ButtonState = 'up' | 'down'

export type Buttons = ButtonMap<ButtonState>

export class ButtonEntity extends Entity<never> {
  public size

  private inside: boolean = false

  protected clickStates: ClickStates = {
    left: 'none',
    right: 'none',
    middle: 'none'
  }

  protected buttons: Buttons = {
    left: 'up',
    right: 'up',
    middle: 'up'
  }

  constructor (size: Vec2) {
    super()

    this.size = size

    mouse.addEventListener('left.down', () => {
      const mouseCollider = this.getViewportMouseCollider()

      if (mouseCollider === undefined) return

      const collider = this.getParentRelativeCollider()

      if (collider.overlapping(mouseCollider)) this.onButtonDown('left')
    })

    mouse.addEventListener('right.down', () => {
      const mouseCollider = this.getViewportMouseCollider()

      if (mouseCollider === undefined) return

      const collider = this.getParentRelativeCollider()

      if (collider.overlapping(mouseCollider)) this.onButtonDown('right')
    })

    mouse.addEventListener('middle.down', () => {
      const mouseCollider = this.getViewportMouseCollider()

      if (mouseCollider === undefined) return

      const collider = this.getParentRelativeCollider()

      if (collider.overlapping(mouseCollider)) this.onButtonDown('middle')
    })

    mouse.addEventListener('left.up', () => {
      const mouseCollider = this.getViewportMouseCollider()

      if (mouseCollider === undefined) return

      const collider = this.getParentRelativeCollider()

      if (collider.overlapping(mouseCollider)) this.onButtonUp('left')
    })

    mouse.addEventListener('right.up', () => {
      const mouseCollider = this.getViewportMouseCollider()

      if (mouseCollider === undefined) return

      const collider = this.getParentRelativeCollider()

      if (collider.overlapping(mouseCollider)) this.onButtonUp('right')
    })

    mouse.addEventListener('middle.up', () => {
      const mouseCollider = this.getViewportMouseCollider()

      if (mouseCollider === undefined) return

      const collider = this.getParentRelativeCollider()

      if (collider.overlapping(mouseCollider)) this.onButtonUp('middle')
    })

    mouse.addEventListener('move', () => {
      const mouseCollider = this.getViewportMouseCollider()

      if (mouseCollider === undefined) return

      const collider = this.getParentRelativeCollider()

      this.setInside(collider.overlapping(mouseCollider))
    })
  }

  private setInside (inside: boolean): void {
    if (inside === this.inside) return

    this.inside = inside

    this.onInsideUpdate(inside)
  }

  protected getViewportMouseCollider (): PointCollider | undefined {
    const viewportMousePosition = this.getMouseViewportPosition()

    if (viewportMousePosition === undefined) return

    const mouseCollider = new PointCollider(viewportMousePosition)

    return mouseCollider
  }

  protected onButtonDown (button: ButtonName): void {
    const clickStates = this.clickStates
    const buttons = this.buttons

    buttons[button] = 'up'

    clickStates[button] = 'down'
  }

  protected onButtonUp (button: ButtonName): void {
    const clickStates = this.clickStates
    const buttons = this.buttons

    buttons[button] = 'down'

    if (clickStates[button] === 'down') clickStates[button] = 'up'
  }

  protected onInsideUpdate (inside: boolean): void {
    if (inside) this.onEnter()
    else this.onExit()
  }

  protected onEnter (): void {}

  protected onExit (): void {
    const clickStates = this.clickStates

    for (const button of Object.keys(clickStates) as ButtonName[]) {
      clickStates[button] = 'none'
    }
  }

  public getConstantCollider (): RectangularCollider {
    const size = this.size

    return new RectangularCollider(new Vec2(0, 0), size)
  }
}

export default ButtonEntity

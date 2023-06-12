import { loader } from '../../assets/loader.js'
import Entity from '../../engine/entities/index.js'
import { TRANSFORMATIONS, animatePosition } from '../../engine/patches/animate.js'
import RectangularCollider from '../../engine/util/collision/rectangular.js'
import type Frame from '../../engine/util/frame.js'
import keyboard from '../../engine/util/input/keyboard.js'
import Vec2 from '../../engine/util/vec2.js'

export type CraftingState = 'open' | 'closed'

export class CraftingEntity extends Entity {
  private animating: boolean = false

  public state: CraftingState = 'closed'

  public getConstantCollider (): RectangularCollider {
    return new RectangularCollider(new Vec2(0, 0), new Vec2(270, 270))
  }

  protected getOpenPosition (): Vec2 {
    return new Vec2(0, 0)
  }

  protected getClosedPosition (): Vec2 {
    return new Vec2(-1000, 0)
  }

  protected getPosition (state: CraftingState): Vec2 {
    const positionMap = {
      open: this.getOpenPosition,
      closed: this.getClosedPosition
    } as const

    const position = positionMap[state].call(this)

    return position
  }

  public draw (frame: Frame): void {
    super.draw(frame)

    const collider = this.getConstantCollider()
    const position = collider.getPosition()
    const size = collider.getSize()

    const image = loader.getTexture('crafting')

    frame._drawImage(image, position.x, position.y, size.x, size.y, false)
  }

  public update (delta: number): void {
    super.update(delta)

    void this.updateAnimation()
  }

  protected async updateAnimation (): Promise<void> {
    if (this.animating) return

    const state = this.state

    const position = this.getPosition(state)

    if (position.equals(this.position)) return

    this.animating = true

    await animatePosition(this, this.position, position, 0.5, TRANSFORMATIONS.EaseQuadratic)
      .getPromise()

    this.animating = false
  }
}

export default CraftingEntity

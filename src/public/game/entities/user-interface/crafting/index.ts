import { type Recipe } from '../../../../assets/recipes.js'
import { TRANSFORMATIONS, animatePosition } from '../../../../engine/patches/animate.js'
import { MouseButtonMap } from '../../../../engine/util/input/mouse/index.js'
import Vec2 from '../../../../engine/util/vec2.js'
import VerticalContainerEntity from '../../../../engine/entities/vertical-container.js'
import DebugEntity from '../../debug.js'
import ProgressBarEntity from '../../progress-bar.js'
import HorizontalContainerEntity from '../../../../engine/entities/horizontal-container.js'
import ButtonEntity from '../../../../engine/entities/button.js'
import center from '../../../../engine/patches/center.js'
import AnchorEntity from '../../../../engine/entities/anchor.js'
import ListEntity from './list.js'
import DisplayEntity from './display.js'
import ItemEntity from './item.js'
import CraftingManager from './manager.js'

export type CraftingState = 'open' | 'closed'

export class CraftingEntity extends HorizontalContainerEntity {
  private animating: boolean = false

  private readonly list
  private readonly display
  private readonly button
  private readonly progress

  public readonly manager: CraftingManager = new CraftingManager()

  private recipe?: Recipe

  public state: CraftingState = 'closed'

  constructor () {
    super(
      0,
      new Vec2(0, 0)
    )

    const list = new ListEntity(new Vec2(64, 192), 32, new Vec2(16, 16))
    this.addChild(list)

    this.list = list

    const container = new VerticalContainerEntity(
      0,
      new Vec2(0, 0)
    )
    this.addChild(container)

    const display = new DisplayEntity(new Vec2(128, 128))
    container.addChild(display)

    this.display = display

    const progress = new ProgressBarEntity({
      size: new Vec2(128, 64),
      color: {
        background: [0x00, 0x00, 0x00],
        foreground: [0xFF, 0xFF, 0xFF]
      }
    })
    container.addChild(progress)

    this.progress = progress

    const progressCenter = new AnchorEntity(new Vec2(0.5, 0.5))
    progress.addChild(progressCenter)

    const button = new ButtonEntity(new Vec2(64, 32))
    progressCenter.addChild(button)
    center(button)

    this.button = button

    const debug = new DebugEntity('🔨🔨🔨', button, false)
    button.addChild(debug)
  }

  protected getOpenPosition (): Vec2 {
    const collider = this.getConstantCollider()
    const position = collider.getPosition()

    return position
  }

  protected getClosedPosition (): Vec2 {
    const collider = this.getConstantCollider()
    const position = collider.getPosition()
    const size = collider.getSize()

    return new Vec2(position.x - size.x, position.y)
  }

  protected getPosition (state: CraftingState): Vec2 {
    const positionMap = {
      open: this.getOpenPosition,
      closed: this.getClosedPosition
    } as const

    const position = positionMap[state].call(this)

    return position
  }

  public update (delta: number): void {
    super.update(delta)

    void this.updateAnimation()
    this.updateProgress(delta)
    this.updateDisplay()
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

  private updateProgress (delta: number): void {
    const progress = this.progress
    const button = this.button
    const manager = this.manager
    const recipe = this.recipe

    if (button.manager.getClickState(MouseButtonMap.left) === 'down') {
      progress.progress += delta
    }

    while (progress.progress > 1) {
      progress.progress -= 1

      if (recipe === undefined) continue

      manager.onCrafted(recipe)
    }
  }

  private updateDisplay (): void {
    const display = this.display
    const recipe = this.recipe

    if (recipe === undefined) return

    display.title = JSON.stringify(recipe, null, 2)
  }

  public addRecipe (recipe: Recipe): this {
    const output = recipe.output

    const entity = new ItemEntity(output.name, new Vec2(32, 32))

    // ? left.down or left.up
    entity.manager.addEventListener('left.down', () => {
      this.recipe = recipe
    })

    this.list.addItem(entity)

    return this
  }

  public clearRecipes (): this {
    this.list.clearItems()

    return this
  }
}

export default CraftingEntity

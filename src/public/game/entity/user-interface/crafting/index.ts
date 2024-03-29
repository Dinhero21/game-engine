import CraftingProgressEntity from './progress'
import CraftingManager from './manager'
import ItemEntity from './item'
import DisplayEntity from './display'
import ListEntity from './list'
import { type Recipe } from '../../../../asset/recipe'
import { TRANSFORMATIONS, animatePosition } from '../../../../engine/patch/animate'
import { MouseButtonMap } from '../../../../engine/util/input/mouse'
import { chunk } from '../../../util/string'
import Vec2 from '../../../../engine/util/vec2'
import VerticalContainerEntity from '../../../../engine/entity/container/vertical'
import HorizontalContainerEntity from '../../../../engine/entity/container/horizontal'
import { type UIState } from '..'

const COLORS = {
  BACKGROUND: [0x1F, 0x1F, 0x1F, 0.75],
  FOREGROUND: [0xFF, 0xFF, 0xFF]
} as const

export class CraftingEntity extends HorizontalContainerEntity {
  public readonly list
  public readonly display
  public readonly progress

  public readonly manager: CraftingManager = new CraftingManager()

  private recipe?: Recipe

  private readonly _recipes = new Set<Recipe>()

  constructor () {
    super(
      0,
      Vec2.ZERO
    )

    const list = new ListEntity(new Vec2(64, 192), 32, new Vec2(16, 16), [...COLORS.BACKGROUND])
    this.addChild(list)

    this.list = list

    const container = new VerticalContainerEntity(
      0,
      Vec2.ZERO
    )
    this.addChild(container)

    const display = new DisplayEntity(new Vec2(128, 128))
    container.addChild(display)

    this.display = display

    const progress = new CraftingProgressEntity(new Vec2(128, 64), {
      background: [...COLORS.BACKGROUND],
      foreground: [...COLORS.FOREGROUND]
    })
    container.addChild(progress)

    this.progress = progress
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

  protected getPosition (state: UIState): Vec2 {
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

  public state: UIState = 'closed'

  private animating: boolean = false

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
    const button = progress.button
    const manager = this.manager
    const recipe = this.recipe

    if (button.manager.getClickState(MouseButtonMap.left) === 'down') {
      progress.progress += delta
    }

    if (recipe === undefined) progress.progress = 0

    while (progress.progress > 1) {
      progress.progress -= 1

      if (recipe === undefined) continue

      manager.onCrafted(recipe)
    }
  }

  private updateDisplay (): void {
    const display = this.display

    if (this.recipe !== undefined && !this._recipes.has(this.recipe)) this.recipe = undefined

    const recipe = this.recipe

    if (recipe === undefined) {
      display.title = 'undefined'

      return
    }

    const string = JSON.stringify(recipe)
    const chunks = chunk(string, 13)

    display.title = chunks.join('\n')
  }

  public addRecipe (recipe: Recipe): this {
    this._recipes.add(recipe)

    const output = recipe.output

    const entity = new ItemEntity(output.type, new Vec2(32, 32))

    // ? left.down or left.up
    entity.manager.addEventListener('left.down', () => {
      this.recipe = recipe
    })

    this.list.addItem(entity)

    return this
  }

  public clearRecipes (): this {
    this._recipes.clear()

    this.list.clearItems()

    return this
  }

  public renderList (): void {
    this.list.render()
  }
}

export default CraftingEntity

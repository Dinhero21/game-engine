import { type IClientSocket as Socket } from '../../../../socket.io.js'
import recipes from '../../../assets/recipes.js'
import AnchorEntity from '../../../engine/entities/anchor.js'
import Entity from '../../../engine/entities/index.js'
import ViewportEntity from '../../../engine/entities/viewport.js'
import keyboard from '../../../engine/util/input/keyboard.js'
import Vec2 from '../../../engine/util/vec2.js'
import CraftingEntity from './crafting/index.js'
import PlayerInventoryEntity from './inventory.js'

export type UIState = 'open' | 'closed'

export class UserInterfaceEntity extends Entity<ViewportEntity> {
  private state: UIState = 'closed'

  private readonly inventory
  private readonly crafting

  constructor (socket: Socket) {
    super()

    const ui = new ViewportEntity()
    this.addChild(ui)

    const centeredUi = new AnchorEntity(new Vec2(0.5, 0.5))
    ui.addChild(centeredUi)

    const inventory = new PlayerInventoryEntity(socket)
    centeredUi.addChild(inventory)

    this.inventory = inventory

    const crafting = new CraftingEntity()
    ui.addChild(crafting)

    this.crafting = crafting

    crafting.manager.addEventListener('crafted', event => {
      console.log('Crafted!', JSON.stringify(event.recipe))
    })
  }

  public update (delta: number): void {
    super.update(delta)

    this.updateState()
    this.updateRecipes()
  }

  private updateState (): void {
    if (this.getAnimating(this)) return

    if (!keyboard.isKeyDown('e')) return

    this.state = this.state === 'open' ? 'closed' : 'open'

    this.setState(this, this.state)
  }

  private updateRecipes (): void {
    const crafting = this.crafting

    crafting.clearRecipes()

    for (const recipe of recipes) {
      crafting.addRecipe(recipe)
    }
  }

  protected setState (entity: Entity, state: UIState): void {
    if ('state' in entity) entity.state = state

    for (const child of entity.children) {
      this.setState(child, state)
    }
  }

  protected getAnimating (entity: Entity): boolean {
    if ('animating' in entity) if (entity.animating === true) return true

    for (const child of entity.children) if (this.getAnimating(child)) return true

    return false
  }
}

export default UserInterfaceEntity

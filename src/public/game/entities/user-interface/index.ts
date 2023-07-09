import { type IClientSocket as Socket } from '../../../../socket.io'
import type Entity from '../../../engine/entities'
import recipes from '../../../assets/recipes'
import AnchorEntity from '../../../engine/entities/anchor'
import ViewportEntity from '../../../engine/entities/viewport'
import keyboard from '../../../engine/util/input/keyboard'
import Vec2 from '../../../engine/util/vec2'
import CraftingEntity from './crafting'
import PlayerInventoryEntity from './inventory'

export type UIState = 'open' | 'closed'

export class UserInterfaceEntity extends ViewportEntity {
  private state: UIState = 'closed'

  public readonly inventory
  public readonly crafting

  constructor (socket: Socket) {
    super()

    const crafting = new CraftingEntity()
    this.addChild(crafting)

    this.crafting = crafting

    const centeredUi = new AnchorEntity(new Vec2(0.5, 0.5))
    this.addChild(centeredUi)

    const inventoryEntity = new PlayerInventoryEntity(socket)
    centeredUi.addChild(inventoryEntity)

    const inventory = inventoryEntity.inventory

    this.inventory = inventoryEntity

    inventory.manager.addEventListener('slot.update', event => {
      this.updateRecipes()
    })
  }

  public update (delta: number): void {
    this.updateState()

    super.update(delta)
  }

  private updateState (): void {
    if (this.isAnimating(this)) return

    if (!keyboard.isKeyDown('e')) return

    this.state = this.state === 'open' ? 'closed' : 'open'

    this.setState(this, this.state)
  }

  private updateRecipes (): void {
    const crafting = this.crafting
    const inventoryEntity = this.inventory
    const inventory = inventoryEntity.inventory

    const list = inventory.list()

    crafting.clearRecipes()

    for (const recipe of recipes) {
      if (!recipe.inputs.every(input => (list.get(input.type) ?? 0) >= input.amount)) continue

      crafting.addRecipe(recipe)
    }
  }

  protected setState (entity: Entity, state: UIState): void {
    if ('state' in entity) entity.state = state

    for (const child of entity.children) {
      this.setState(child, state)
    }
  }

  protected isAnimating (entity: Entity): boolean {
    if ('animating' in entity) if (entity.animating === true) return true

    for (const child of entity.children) if (this.isAnimating(child)) return true

    return false
  }
}

export default UserInterfaceEntity

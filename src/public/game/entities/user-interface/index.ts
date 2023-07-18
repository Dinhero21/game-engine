import type Entity from '../../../engine/entities'
import ChatEntity from './chat'
import PlayerInventoryEntity from './inventory'
import CraftingEntity from './crafting'
import recipes from '../../../assets/recipes'
import AnchorEntity from '../../../engine/entities/anchor'
import ViewportEntity from '../../../engine/entities/viewport'
import keyboard from '../../../engine/util/input/keyboard'
import Vec2 from '../../../engine/util/vec2'
import { type IClientSocket as Socket } from '../../../../socket.io'

export type UIState = 'open' | 'closed'

// ? Should I make sending packets the UIEntity's responsibility? That seems like a very bad idea...
export class UserInterfaceEntity extends ViewportEntity {
  private state: UIState = 'closed'

  public readonly inventory
  public readonly crafting

  public readonly chat

  constructor (socket: Socket) {
    super()

    // --- Crafting ---

    const crafting = new CraftingEntity()
    this.addChild(crafting)

    this.crafting = crafting

    const centeredUi = new AnchorEntity(new Vec2(0.5, 0.5))
    this.addChild(centeredUi)

    const inventoryEntity = new PlayerInventoryEntity(socket)
    centeredUi.addChild(inventoryEntity)

    // --- Inventory ---

    const inventory = inventoryEntity.inventory

    this.inventory = inventoryEntity

    inventory.manager.addEventListener('slot.update', event => {
      this.updateRecipes()
    })

    const bottomUi = new AnchorEntity(new Vec2(0, 1))
    this.addChild(bottomUi)

    // --- Chat ---

    window.addEventListener('keydown', event => {
      switch (event.key) {
        case 'Escape':
          chat.input.disable()
          break
        // Me when copying Terraria be like:
        case 'Enter':
          if (input.active) break

          chat.input.enable()

          event.stopImmediatePropagation()
          event.stopPropagation()
          break
      }
    }, true)

    const chat = new ChatEntity({
      width: 480,
      height: 32,
      maxWidth: 480
    })
    bottomUi.addChild(chat)

    this.chat = chat

    const input = chat.input
    const container = chat.container

    input.manager.addEventListener('input', () => {
      socket.emit('chat.message', input.text)

      input.disable()
    })

    socket.on('chat.message', message => {
      container.addMessage(message)
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

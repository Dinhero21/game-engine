import { type IClientSocket as Socket } from '../../../socket.io.js'
import Entity from '../../engine/entities/index.js'
import ViewportRelativeEntity from '../../engine/entities/viewport.js'
import keyboard from '../../engine/util/input/keyboard.js'
import Vec2 from '../../engine/util/vec2.js'
import CraftingEntity from './crafting.js'
import PlayerInventoryEntity from './player-inventory.js'

export type UIState = 'open' | 'closed'

export class UserInterfaceEntity extends Entity<ViewportRelativeEntity> {
  private readonly socket

  private initialized: boolean = false

  private state: UIState = 'closed'

  constructor (socket: Socket) {
    super()

    this.socket = socket
  }

  public update (delta: number): void {
    super.update(delta)

    this.updateState()

    if (this.initialized) return

    const socket = this.socket

    const centeredUI = new ViewportRelativeEntity(new Vec2(0.5, 0.5))
    this.addChild(centeredUI)

    const inventory = new PlayerInventoryEntity(socket)
    centeredUI.addChild(inventory)

    const ui = new ViewportRelativeEntity(new Vec2(0, 0))
    this.addChild(ui)

    const crafting = new CraftingEntity()
    ui.addChild(crafting)

    this.initialized = true
  }

  private updateState (): void {
    if (this.getAnimating(this)) return

    if (!keyboard.isKeyDown('e')) return

    this.state = this.state === 'open' ? 'closed' : 'open'

    this.setState(this, this.state)
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

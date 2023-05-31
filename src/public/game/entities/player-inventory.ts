import { type IClientSocket as Socket } from '../../../socket.io.js'
import { TRANSFORMATIONS, animatePosition } from '../../engine/patches/animate.js'
import keyboard from '../../engine/util/input/keyboard.js'
import Vec2 from '../../engine/util/vec2.js'
import InventoryEntity from './inventory.js'

export type PlayerInventoryState = 'open' | 'closed'

export class PlayerInventoryEntity extends InventoryEntity {
  private readonly socket

  private animating: boolean = false

  public state: PlayerInventoryState = 'closed'

  constructor (socket: Socket) {
    super(
      new Vec2(3, 3),
      new Vec2(32, 32),
      new Vec2(16, 16),
      new Vec2(64, 64),
      new Vec2(16, 16)
    )

    this.socket = socket

    const slots = this.getGridItems()
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]

      const manager = slot.manager

      manager.addEventListener('left.up', () => {
        socket.emit('slot.click', i)
      })
    }

    socket.on('slot.set', (id, type) => {
      // Cursor
      if (id === -1) {
        this.cursorItem = type

        return
      }

      this.setSlot(id, type)
    })
  }

  protected getOpenPosition (): Vec2 {
    const collider = this.getConstantCollider()
    const size = collider.getSize()

    return size.scaled(-0.5)
  }

  protected getClosedPosition (): Vec2 {
    const open = this.getOpenPosition()

    const scene = this.getScene()

    if (scene === undefined) throw new Error('Closed Position requested before Entity Initialization')

    const camera = scene.camera
    const viewport = camera.getViewport()
    const cameraSize = viewport.getSize()

    const padding = this.padding
    const itemSize = this.itemSize
    const slotPadding = this.slotPadding
    const spacing = this.spacing2D

    const slotSize = itemSize.plus(slotPadding.scaled(2))

    return new Vec2(open.x, (cameraSize.y * 0.5) - (padding.y + slotSize.y + spacing.y / 2))
  }

  protected getPosition (state: PlayerInventoryState): Vec2 {
    const positionMap = {
      open: this.getOpenPosition,
      closed: this.getClosedPosition
    } as const

    const position = positionMap[state].call(this)

    return position
  }

  public update (delta: number): void {
    super.update(delta)

    this.updateState()

    void this.updateAnimation()
  }

  protected updateState (): void {
    if (this.animating) return

    if (!keyboard.isKeyDown('e')) return

    this.state = this.state === 'open' ? 'closed' : 'open'
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

export default PlayerInventoryEntity

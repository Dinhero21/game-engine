import { type UIState } from '.'
import { type IClientSocket as Socket } from '../../../../socket.io'
import { TRANSFORMATIONS, animatePosition } from '../../../engine/patch/animate'
import keyboard from '../../../engine/util/input/keyboard'
import Vec2 from '../../../engine/util/vec2'
import InventoryEntity from '../inventory'

export class PlayerInventoryEntity extends InventoryEntity {
  constructor (socket: Socket) {
    super(
      new Vec2(3, 3),
      new Vec2(32, 32),
      new Vec2(16, 16),
      new Vec2(64, 64),
      new Vec2(16, 16)
    )

    const inventory = this.inventory

    const slots = this.getGridItems()
    for (let id = 0; id < slots.length; id++) {
      const slot = slots[id]

      if (slot === undefined) throw new Error(`Invalid slot ${id}`)

      const manager = slot.manager

      manager.addEventListener('left.down', event => {
        socket.emit('slot.click', id)

        event.original.stopPropagation()
      })
    }

    socket.on('slot.set', (id, type, amount) => {
      const slot = inventory.getSlot(id)

      slot?.setType(type)
      slot?.setAmount(amount)
    })

    const position = this.getOpenPosition()
    this.position.update(position)

    // "Trigger" a selected-slot change
    this.setSelectedSlot(0)
    keyboard.addEventListener('key.down', event => {
      const number = event.getNumber()

      if (Number.isNaN(number)) return

      // 1 = 0th slot
      this.setSelectedSlot(number - 1)
    })
  }

  protected getOpenPosition (): Vec2 {
    const collider = this.getConstantCollider()
    const size = collider.getSize()

    return size.scaled(-0.5)
  }

  protected getClosedPosition (): Vec2 {
    const open = this.getOpenPosition()

    const scene = this.getRoot()

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

  public selectedSlot = 0

  private setSelectedSlot (number: number): void {
    if (number < 0) return
    if (number > this.children.size - 1) return

    const old = this.getGridItem(this.selectedSlot)

    if (old !== undefined) old.outlineColor = undefined

    const current = this.getGridItem(number)

    if (current !== undefined) current.outlineColor = 'white'

    this.selectedSlot = number
  }
}

export default PlayerInventoryEntity

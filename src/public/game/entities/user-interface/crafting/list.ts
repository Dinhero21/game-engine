import { type Color } from '../../../util/types'
import type Entity from '../../../../engine/entities'
import type Frame from '../../../../engine/util/frame'
import VerticalContainerEntity from '../../../../engine/entities/vertical-container'
import Vec2 from '../../../../engine/util/vec2'
import ClippingEntity from '../../../../engine/entities/clipper'

export class ListEntity<ValidItem extends Entity> extends ClippingEntity {
  protected container

  protected color

  constructor (size: Vec2, spacing: number, padding: Vec2, color: Color) {
    super(new Vec2(0, 0), size)

    this.color = color

    const listContainer = new VerticalContainerEntity(spacing, padding)
    this.addChild(listContainer)

    this.container = listContainer
  }

  public draw (frame: Frame): void {
    const color = this.color

    const collider = this.getConstantCollider()
    const position = collider.getPosition()
    const size = collider.getSize()

    frame.drawRectRGBA(position.x, position.y, size.x, size.y, color[0], color[1], color[2], color[3])

    super.draw(frame)
  }

  public update (delta: number): void {
    super.update(delta)

    const container = this.container
    const collider = container.getConstantCollider()
    const position = collider.getPosition()

    container.position = position
  }

  public addItem (item: ValidItem): this {
    this.container.addChild(item)

    return this
  }

  public removeItem (item: ValidItem): this {
    this.container.removeChild(item)

    return this
  }

  public clearItems (): this {
    const container = this.container

    for (const child of container.children) container.removeChild(child)

    return this
  }
}

export default ListEntity

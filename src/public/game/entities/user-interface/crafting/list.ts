import type Entity from '../../../../engine/entities'
import VerticalContainerEntity from '../../../../engine/entities/vertical-container.js'
import Vec2 from '../../../../engine/util/vec2.js'
import ClippingEntity from '../../clipper.js'

export class ListEntity<ValidItem extends Entity> extends ClippingEntity {
  protected container

  constructor (size: Vec2, spacing: number, padding: Vec2) {
    super(new Vec2(0, 0), size)

    const listContainer = new VerticalContainerEntity(spacing, padding)
    this.addChild(listContainer)

    this.container = listContainer
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

import type Entity from '../../../../engine/entities/index.js'
import ButtonEntity from '../../../../engine/entities/button.js'
import type Vec2 from '../../../../engine/util/vec2.js'
import type Frame from '../../../../engine/util/frame.js'
import { loader } from '../../../../assets/loader.js'

export class ItemEntity<ValidChild extends Entity> extends ButtonEntity<ValidChild> {
  protected item

  constructor (item: string, size: Vec2) {
    super(size)

    this.item = item
  }

  public draw (frame: Frame): void {
    super.draw(frame)

    const item = this.item
    const size = this.size

    const texture = loader.getItemTexture(item)

    frame._drawImage(texture, 0, 0, size.x, size.y, false)

    // frame.drawText(item, 0, 32, 'white', '32px cursive', 32)
  }
}

export default ItemEntity

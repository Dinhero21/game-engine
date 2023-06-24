import type Vec2 from '../../../../engine/util/vec2.js'
import ProgressBarEntity, { type Colors } from '../../progress-bar.js'

export class CraftingProgressEntity extends ProgressBarEntity {
  constructor (size: Vec2, color: Colors) {
    super({ size, color })

    this.addChild()
  }
}

export default CraftingProgressEntity

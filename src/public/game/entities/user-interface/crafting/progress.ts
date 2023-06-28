import ProgressBarEntity, { type Colors } from '../../progress-bar.js'
import Vec2 from '../../../../engine/util/vec2.js'
import ButtonEntity from '../../../../engine/entities/button.js'
import center from '../../../../engine/patches/center.js'
import AnchorEntity from '../../../../engine/entities/anchor.js'
import DebugEntity from '../../debug.js'

export class CraftingProgressEntity extends ProgressBarEntity {
  public readonly button

  constructor (size: Vec2, color: Colors) {
    super({ size, color })

    const progressCenter = new AnchorEntity(new Vec2(0.5, 0.5))
    this.addChild(progressCenter)

    const button = new ButtonEntity(new Vec2(64, 32))
    progressCenter.addChild(button)
    center(button)

    this.button = button

    const debug = new DebugEntity('🔨🔨🔨', button, false)
    button.addChild(debug)
  }
}

export default CraftingProgressEntity
